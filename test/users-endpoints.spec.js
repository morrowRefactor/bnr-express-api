const knex = require('knex');
const app = require('../src/app');
const { makeUsersArray, makeMaliciousUser, usersSansPassword } = require('./users.fixtures');
const { expect } = require('chai');
const helpers = require('./test-helpers');
const jwt = require('jsonwebtoken');

describe('Users Endpoints', function() {
  let db;

  before('make knex instance', () => {

    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);

  })

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db.raw('TRUNCATE users RESTART IDENTITY CASCADE'));

  afterEach('cleanup',() => db.raw('TRUNCATE users RESTART IDENTITY CASCADE'));

  describe(`GET /api/users`, () => {
    context(`Given no users`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/users')
          .expect(200, [])
      })
    });

    context('Given there are users in the database', () => {
      const testUsers = makeUsersArray();
      const sansPassUsers = usersSansPassword();

      beforeEach('insert users', () => {
        return db
          .into('users')
          .insert(testUsers)
      });

      it('responds with 200 and all of the users', () => {
        return supertest(app)
          .get('/api/users')
          .expect(200, sansPassUsers)
        });
    });
    
    context(`Given an XSS attack user`, () => {
      const { maliciousUser, expectedUser } = makeMaliciousUser();

      beforeEach('insert malicious user', () => {
        return db
          .into('users')
          .insert(maliciousUser)
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/users`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].name).to.eql(expectedUser.name)
          })
      });
    });
  });

  describe(`GET /api/users/:user_id`, () => {
    context(`Given no user`, () => {
      it(`responds with 404`, () => {
        const uid = 123;
        return supertest(app)
          .get(`/api/users/${uid}`)
          .expect(404, { error: { message: `User doesn't exist` } })
      });
    });

    context('Given there are users in the database', () => {
      const testUsers = makeUsersArray();
      const sansPassUsers = usersSansPassword();

      beforeEach('insert users', () => {
        return db
          .into('users')
          .insert(testUsers)
      });

      it('responds with 200 and the specified user', () => {
        const uid = 2
        const expectedUser = sansPassUsers[uid - 1]
        return supertest(app)
          .get(`/api/users/${uid}`)
          .expect(200, expectedUser)
      });
    });

    context(`Given an XSS attack content`, () => {
      const { maliciousUser, expectedUser } = makeMaliciousUser();

      beforeEach('insert malicious user', () => {
        return db
          .into('users')
          .insert(maliciousUser)
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/users/${maliciousUser.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.name).to.eql(expectedUser.name)
          })
      });
    });
  });

  describe(`POST /api/users`, () => {

    it(`creates a user, responding with 201 and the new user`, () => {
      const newUser = {
        name: 'test user',
        email: 'someemail@gmail.com',
        password: 'Somepassword12!',
        joined_date: new Date('2020-01-22T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
      };

      return supertest(app)
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(newUser.name)
          expect(res.body).to.have.property('id')
          expect(res.body).to.have.property('authToken')
          expect(res.headers.location).to.eql(`/api/users/${res.body.id}`)
        })
    });

    const requiredFields = ['name', 'password', 'email'];

    requiredFields.forEach(field => {
        const newUser = {
            name: 'test user',
            email: 'someemail@gmail.com',
            password: 'somepassword12!'
        };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newUser[field]

        return supertest(app)
          .post('/api/users')
          .send(newUser)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      });
    });

    it('removes XSS attack content from response', () => {
      const { maliciousUser, expectedUser } = makeMaliciousUser();
      return supertest(app)
        .post(`/api/users`)
        .send(maliciousUser)
        .expect(201)
        .expect(res => {
            expect(res.body.name).to.eql(expectedUser.name)
        })
    });
  });

  describe(`DELETE /api/users/:user_id`, () => {
    context(`Given no users`, () => {
      it(`responds with 404`, () => {
        const uid = 123
        return supertest(app)
          .delete(`/api/users/${uid}`)
          .expect(404, { error: { message: `User doesn't exist` } })
      })
    });

    context('Given there are users in the database', () => {
      const testUsers = makeUsersArray();
      const sansPassUsers = usersSansPassword();

      function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
        const token = jwt.sign({ id: user.id }, secret, {
          subject: user.email,
          algorithm: 'HS256',
        });

        return `Bearer ${token}`
      }

      beforeEach('insert videos and users', () => {
        helpers.seedUsers(db, testUsers)
      });

      it('responds with 204 and removes the user', () => {
        const idToRemove = 2
        const expectedUser = sansPassUsers.filter(user => user.id !== idToRemove)
        return supertest(app)
          .delete(`/api/users/${idToRemove}`)
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/users`)
              .expect(expectedUser)
          )
      });
    });
  });

  describe(`PATCH /api/users/:user_id`, () => {
    context(`Given no users`, () => {
      it(`responds with 404`, () => {
        const uid = 123;
        return supertest(app)
          .delete(`/api/users/${uid}`)
          .expect(404, { error: { message: `User doesn't exist` } })
      })
    });

    context('Given there are users in the database', () => {
      const testUsers = makeUsersArray();
      const sansPassUsers = usersSansPassword();

      function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
        const token = jwt.sign({ id: user.id }, secret, {
          subject: user.email,
          algorithm: 'HS256',
        });

        return `Bearer ${token}`
      }

      beforeEach('insert users', () => {
        helpers.seedUsers(db, testUsers)
      });
      
      it('responds with 204 and updates the user', () => {
        const idToUpdate = 2;
        const updateUser = {
          id: 2,
          name: 'updated name',
          about: 'some new about text',
          email: 'someemail@gmail.com',
          password: 'Something12!'
        };
        const sansPassUser = {
          name: 'updated name',
          about: 'some new about text'
        };
        const expectedUser = {
          ...sansPassUsers[idToUpdate - 1],
          ...sansPassUser
        };
        return supertest(app)
          .patch(`/api/users/${idToUpdate}`)
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .send(updateUser)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/users/${idToUpdate}`)
              .expect(expectedUser)
          )
      });
      
      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2;        
        return supertest(app)
          .patch(`/api/users/${idToUpdate}`)
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
              message: `Request body must contain an id`
            }
          })
      });
    });
    });
});
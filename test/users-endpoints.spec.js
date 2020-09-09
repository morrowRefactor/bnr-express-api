const knex = require('knex');
const app = require('../src/app');
const { makeUsersArray, makeMaliciousUser } = require('./users.fixtures');
const { expect } = require('chai');

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

      beforeEach('insert users', () => {
        return db
          .into('users')
          .insert(testUsers)
      });

      it('responds with 200 and all of the users', () => {
        return supertest(app)
          .get('/api/users')
          .expect(200, testUsers)
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
            expect(res.body[0].password).to.eql(expectedUser.password)
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

      beforeEach('insert users', () => {
        return db
          .into('users')
          .insert(testUsers)
      });

      it('responds with 200 and the specified user', () => {
        const uid = 2
        const expectedUser = testUsers[uid - 1]
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
            expect(res.body.password).to.eql(expectedUser.password)
          })
      });
    });
  });

  describe(`POST /api/users`, () => {

    it(`creates a user, responding with 201 and the new user`, () => {
      const newUser = {
        name: 'test user',
        password: 'somepassword12!'
      };

      return supertest(app)
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(newUser.name)
          expect(res.body.password).to.eql(newUser.password)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/api/users/${res.body.id}`)
        })
        .then(res =>
          supertest(app)
            .get(`/api/users/${res.body.id}`)
            .expect(res.body)
        )
    });

    const requiredFields = ['name', 'password'];

    requiredFields.forEach(field => {
        const newUser = {
            name: 'test user',
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
            expect(res.body.password).to.eql(expectedUser.password)
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

      beforeEach('insert users', () => {
        return db
          .into('users')
          .insert(testUsers)
      });

      it('responds with 204 and removes the user', () => {
        const idToRemove = 2
        const expectedUser = testUsers.filter(user => user.id !== idToRemove)
        return supertest(app)
          .delete(`/api/users/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/users`)
              .expect(expectedUser)
          )
      });
    });
  });

  describe(`PATCH /api/userss/:user_id`, () => {
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

      beforeEach('insert users', () => {
        return db
          .into('users')
          .insert(testUsers)
      });

      it('responds with 204 and updates the user', () => {
        const idToUpdate = 2;
        const updateUser = {
          name: 'updated name',
          password: 'Updatedpassword12!'
        };
        const expectedUser = {
          ...testUsers[idToUpdate - 1],
          ...updateUser
        };
        return supertest(app)
          .patch(`/api/users/${idToUpdate}`)
          .send(updateUser)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/users/${idToUpdate}`)
              .expect(expectedUser)
          )
      });

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2
        return supertest(app)
          .patch(`/api/users/${idToUpdate}`)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
              message: `Request body must contain a name and password`
            }
          })
      });

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2;
        const updateUser = {
          name: 'updated name',
        };
        const expectedUser = {
          ...testUsers[idToUpdate - 1],
          ...updateUser
        };

        return supertest(app)
          .patch(`/api/users/${idToUpdate}`)
          .send({
            ...updateUser,
            fieldToIgnore: 'should not be in GET response'
          })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/users/${idToUpdate}`)
              .expect(expectedUser)
          )
      });
    });
    });
});
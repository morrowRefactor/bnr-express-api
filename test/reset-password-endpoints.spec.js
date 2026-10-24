const knex = require('knex');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const { makeUsersArray } = require('./users.fixtures');
const { expect } = require('chai');
const helpers = require('./test-helpers');

describe('Reset Password Endpoints', function() {
  let db;
  const testUsers = makeUsersArray();
  const genericMessage = 'If an account exists for that email, a temporary password has been sent to it.';

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db.raw('TRUNCATE users, temp_passwords RESTART IDENTITY CASCADE'));

  afterEach('cleanup', () => db.raw('TRUNCATE users, temp_passwords RESTART IDENTITY CASCADE'));

  beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

  function insertTempPass(user, password, createdAt = new Date()) {
    return db.into('temp_passwords').insert({
      uid: user.id,
      email: user.email,
      password: bcrypt.hashSync(password, 4),
      created_at: createdAt
    });
  }

  describe(`POST /api/reset-password`, () => {
    it(`responds 202 with the same message for unknown emails and stores nothing`, () => {
      return supertest(app)
        .post('/api/reset-password')
        .send({ email: 'nobody@example.com' })
        .expect(202, { message: genericMessage })
        .then(() => db('temp_passwords').count('* as count').first())
        .then(row => expect(Number(row.count)).to.eql(0))
    });

    it(`creates a server-generated temp password for a known email without returning it`, () => {
      return supertest(app)
        .post('/api/reset-password')
        .send({ email: testUsers[1].email, password: 'ChosenByAttacker1!' })
        .expect(202, { message: genericMessage })
        .then(() => db('temp_passwords').select('*'))
        .then(rows => {
          expect(rows).to.have.length(1)
          expect(rows[0].uid).to.eql(testUsers[1].id)
          expect(bcrypt.compareSync('ChosenByAttacker1!', rows[0].password)).to.eql(false)
        })
    });
  });

  describe(`POST /api/reset-password/login`, () => {
    it(`rejects a password chosen by the requester (old account-takeover attack)`, () => {
      return supertest(app)
        .post('/api/reset-password')
        .send({ uid: 1, email: testUsers[0].email, password: 'ChosenByAttacker1!' })
        .expect(202)
        .then(() =>
          supertest(app)
            .post('/api/reset-password/login')
            .send({ email: testUsers[0].email, password: 'ChosenByAttacker1!' })
            .expect(400, { error: 'Incorrect email or temporary password' })
        )
    });

    it(`logs in with a valid temp password, for that account only, exactly once`, () => {
      return insertTempPass(testUsers[1], 'emailed-temp-pass')
        .then(() =>
          supertest(app)
            .post('/api/reset-password/login')
            .send({ email: testUsers[1].email, password: 'emailed-temp-pass' })
            .expect(200)
        )
        .then(res => {
          expect(res.body.uid).to.eql(testUsers[1].id)
          const payload = jwt.verify(res.body.authToken, process.env.JWT_SECRET)
          expect(payload.sub).to.eql(testUsers[1].email)
        })
        .then(() =>
          supertest(app)
            .post('/api/reset-password/login')
            .send({ email: testUsers[1].email, password: 'emailed-temp-pass' })
            .expect(400)
        )
    });

    it(`rejects another account's email paired with a valid temp password`, () => {
      return insertTempPass(testUsers[1], 'emailed-temp-pass')
        .then(() =>
          supertest(app)
            .post('/api/reset-password/login')
            .send({ email: testUsers[0].email, password: 'emailed-temp-pass' })
            .expect(400)
        )
    });

    it(`rejects an expired temp password`, () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      return insertTempPass(testUsers[1], 'emailed-temp-pass', twoHoursAgo)
        .then(() =>
          supertest(app)
            .post('/api/reset-password/login')
            .send({ email: testUsers[1].email, password: 'emailed-temp-pass' })
            .expect(400)
        )
    });
  });
});

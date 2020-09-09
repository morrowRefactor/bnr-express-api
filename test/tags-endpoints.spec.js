const knex = require('knex');
const app = require('../src/app');
const { makeTagsArray, makeMaliciousTag } = require('./tags.fixtures');
const { expect } = require('chai');

describe.only('Tags Endpoints', function() {
  let db;

  before('make knex instance', () => {

    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);

  })

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db.raw('TRUNCATE tags RESTART IDENTITY CASCADE'));

  afterEach('cleanup',() => db.raw('TRUNCATE tags RESTART IDENTITY CASCADE'));

  describe(`GET /api/tags`, () => {
    context(`Given no tags`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/tags')
          .expect(200, [])
      })
    });

    context('Given there are tags in the database', () => {
      const testTags = makeTagsArray();

      beforeEach('insert tags', () => {
        return db
          .into('tags')
          .insert(testTags)
      });

      it('responds with 200 and all of the tags', () => {
        return supertest(app)
          .get('/api/tags')
          .expect(200, testTags)
        });
    });

    context(`Given an XSS attack tag`, () => {
      const { maliciousTag, expectedTag } = makeMaliciousTag();

      beforeEach('insert malicious tag', () => {
        return db
          .into('tags')
          .insert(maliciousTag)
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/tags`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].tag).to.eql(expectedTag.tag)
          })
      });
    });
  });

  describe(`GET /api/tags/:tag_id`, () => {
    context(`Given no tag`, () => {
      it(`responds with 404`, () => {
        const tid = 123;
        return supertest(app)
          .get(`/api/tags/${tid}`)
          .expect(404, { error: { message: `Tag doesn't exist` } })
      });
    });

    context('Given there are tags in the database', () => {
      const testTags = makeTagsArray();

      beforeEach('insert tags', () => {
        return db
          .into('tags')
          .insert(testTags)
      });

      it('responds with 200 and the specified tag', () => {
        const tid = 2
        const expectedTag = testTags[tid - 1]
        return supertest(app)
          .get(`/api/tags/${tid}`)
          .expect(200, expectedTag)
      });
    });

    context(`Given an XSS attack content`, () => {
      const { maliciousTag, expectedTag } = makeMaliciousTag();

      beforeEach('insert malicious tag', () => {
        return db
          .into('tags')
          .insert(maliciousTag)
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/tags/${maliciousTag.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.tag).to.eql(expectedTag.tag)
          })
      });
    });
  });

  describe(`POST /api/tags`, () => {

    it(`creates a tag, responding with 201 and the new tag`, () => {
      const newTag = {
        tag: 'test tag',
      };

      return supertest(app)
        .post('/api/tags')
        .send(newTag)
        .expect(201)
        .expect(res => {
          expect(res.body.tag).to.eql(newTag.tag)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/api/tags/${res.body.id}`)
        })
        .then(res =>
          supertest(app)
            .get(`/api/tags/${res.body.id}`)
            .expect(res.body)
        )
    });

    const requiredFields = ['tag'];

    requiredFields.forEach(field => {
        const newTag = {
            tag: 'test tag'
        };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newTag[field]

        return supertest(app)
          .post('/api/tags')
          .send(newTag)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      });
    });

    it('removes XSS attack content from response', () => {
      const { maliciousTag, expectedTag } = makeMaliciousTag();
      return supertest(app)
        .post(`/api/tags`)
        .send(maliciousTag)
        .expect(201)
        .expect(res => {
            expect(res.body.tag).to.eql(expectedTag.tag)
        })
    });
  });

  describe(`DELETE /api/tags/:tag_id`, () => {
    context(`Given no tags`, () => {
      it(`responds with 404`, () => {
        const tid = 123
        return supertest(app)
          .delete(`/api/tags/${tid}`)
          .expect(404, { error: { message: `Tag doesn't exist` } })
      })
    });

    context('Given there are tags in the database', () => {
      const testTags = makeTagsArray();

      beforeEach('insert tags', () => {
        return db
          .into('tags')
          .insert(testTags)
      });

      it('responds with 204 and removes the tag', () => {
        const idToRemove = 2
        const expectedTag = testTags.filter(tag => tag.id !== idToRemove)
        return supertest(app)
          .delete(`/api/tags/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/tags`)
              .expect(expectedTag)
          )
      });
    });
  });

  describe(`PATCH /api/tags/:tag_id`, () => {
    context(`Given no tags`, () => {
      it(`responds with 404`, () => {
        const tid = 123
        return supertest(app)
          .delete(`/api/tags/${tid}`)
          .expect(404, { error: { message: `Tag doesn't exist` } })
      })
    });

    context('Given there are tags in the database', () => {
      const testTags = makeTagsArray();

      beforeEach('insert tags', () => {
        return db
          .into('tags')
          .insert(testTags)
      });

      it('responds with 204 and updates the tag', () => {
        const idToUpdate = 2;
        const updateTag = {
          tag: 'updated name'
        };
        const expectedTag = {
          ...testTags[idToUpdate - 1],
          ...updateTag
        };
        return supertest(app)
          .patch(`/api/tags/${idToUpdate}`)
          .send(updateTag)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/tags/${idToUpdate}`)
              .expect(expectedTag)
          )
      });

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2
        return supertest(app)
          .patch(`/api/tags/${idToUpdate}`)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
              message: `Request body must contain a tag name`
            }
          })
      });

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2;
        const updateTag = {
          tag: 'updated name',
        };
        const expectedTag = {
          ...testTags[idToUpdate - 1],
          ...updateTag
        };

        return supertest(app)
          .patch(`/api/tags/${idToUpdate}`)
          .send({
            ...updateTag,
            fieldToIgnore: 'should not be in GET response'
          })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/tags/${idToUpdate}`)
              .expect(expectedTag)
          )
      });
    });
    });
});
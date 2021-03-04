const knex = require('knex');
const app = require('../src/app');
const { makeVidTagsArray, makeMaliciousVidTag } = require('./vid-tags.fixtures');
const { makeTagsArray } = require('./tags.fixtures');
const { makeVideosArray } = require('./videos.fixtures');
const { makeUsersArray } = require('./users.fixtures');
const helpers = require('./test-helpers');
const jwt = require('jsonwebtoken');

describe('Video Tags Endpoints', function() {
  let db;

  before('make knex instance', () => {

    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);

  })

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db.raw('TRUNCATE users, videos, tags, vid_tags RESTART IDENTITY CASCADE'));

  afterEach('cleanup',() => db.raw('TRUNCATE users,videos, tags, vid_tags RESTART IDENTITY CASCADE'));

  describe(`GET /api/vid-tags`, () => {
    context(`Given no video tags`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/vid-tags')
          .expect(200, [])
      })
    });

    context('Given there are video tags in the database', () => {
      const testVidTags = makeVidTagsArray();
      const testVideos = makeVideosArray();
      const testTags = makeTagsArray();

      beforeEach('insert video tags', () => {
        return db
          .into('videos')
          .insert(testVideos)
          .then(() => {
              return db
                .into('tags')
                .insert(testTags)
          })
          .then(() => {
            return db
              .into('vid_tags')
              .insert(testVidTags)
          })
      });

      it('responds with 200 and all of the video tags', () => {
        return supertest(app)
          .get('/api/vid-tags')
          .expect(200, testVidTags)
      });
    });
  });

  describe(`GET /api/vid-tags/:vidtag_id`, () => {
    context(`Given no video tags`, () => {
      it(`responds with 404`, () => {
        const vidtagId = 123456;
        return supertest(app)
          .get(`/api/vid-tags/${vidtagId}`)
          .expect(404, { error: { message: `Video tag doesn't exist` } })
      });
    });

    context('Given there are video tags in the database', () => {
      const testVideos = makeVideosArray();
      const testTags = makeTagsArray();
      const testVidTags = makeVidTagsArray();

      beforeEach('insert video tags', () => {
        return db
          .into('videos')
          .insert(testVideos)
          .then(() => {
              return db
                .into('tags')
                .insert(testTags)
          })
          .then(() => {
            return db
              .into('vid_tags')
              .insert(testVidTags)
          })
      });

      it('responds with 200 and the specified video tags', () => {
        const vidtagId = 2
        const expectedVidTag = testVidTags[vidtagId - 1]
        return supertest(app)
          .get(`/api/vid-tags/${vidtagId}`)
          .expect(200, expectedVidTag)
      });
    });
  });

  describe(`POST /api/vid-tags`, () => {
    const testVideos = makeVideosArray();
    const testTags = makeTagsArray();
    const testUsers = makeUsersArray();

    function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
      const token = jwt.sign({ id: user.id }, secret, {
        subject: user.email,
        algorithm: 'HS256',
      });

      return `Bearer ${token}`
    }

    beforeEach('insert videos and tags', () => {
      return db
        .into('videos')
        .insert(testVideos)
        .then(() => {
            return db
                .into('tags')
                .insert(testTags)
        })
        .then(() => {
          helpers.seedUsers(db, testUsers)
        })
    });

    it(`creates a video tag, responding with 201 and the new video tag`, () => {
      const newVideoTag = [{
        vid_id: 2,
        tag_id: 1
      },
      {
        vid_id: 3,
        tag_id: 2
      }];

      return supertest(app)
        .post('/api/vid-tags')
        .set('Authorization', makeAuthHeader(testUsers[0]))
        .send(newVideoTag)
        .expect(201)
    });

    const requiredFields = [ 'vid_id', 'tag_id' ];

    requiredFields.forEach(field => {
        const newVideoTag = [{
            vid_id: 2,
            tag_id: 2
          }];

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newVideoTag[0][field]

        return supertest(app)
          .post('/api/vid-tags')
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .send(newVideoTag)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      });
    });
  });

  describe(`DELETE /api/vid-tags`, () => {
    context(`Given no video tags`, () => {
      it(`responds with 404`, () => {
        const vidtagId = 123456
        return supertest(app)
          .delete(`/api/vid-tags/${vidtagId}`)
          .expect(404, { error: { message: `Video tag doesn't exist` } })
      })
    });

    context('Given there are video tags in the database', () => {
      const testVideos = makeVideosArray();
      const testTags = makeTagsArray();
      const testVidTags = makeVidTagsArray();
      const testUsers = makeUsersArray();

      function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
        const token = jwt.sign({ id: user.id }, secret, {
          subject: user.email,
          algorithm: 'HS256',
        });

        return `Bearer ${token}`
      }

      beforeEach('insert video tags', () => {
        return db
          .into('videos')
          .insert(testVideos)
          .then(() => {
              return db 
                .into('tags')
                .insert(testTags)
          })
          .then(() => {
              return db
                .into('vid_tags')
                .insert(testVidTags)
          })
          .then(() => {
            helpers.seedUsers(db, testUsers)
          })
      });

      it('responds with 204 and removes the video tag', () => {
        const idToRemove = [ 1, 2 ];
        const expectedVidTag = testVidTags.filter(vidtag => vidtag.id !== idToRemove);
        return supertest(app)
          .delete(`/api/vid-tags`)
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .send(idToRemove)
          .expect(204)
      });
    });
  });

  describe(`PATCH /api/vid-tags/:dest_id`, () => {
    context(`Given no video tags`, () => {
      it(`responds with 404`, () => {
        const vidtagId = 123456
        return supertest(app)
          .delete(`/api/vid-tags/${vidtagId}`)
          .expect(404, { error: { message: `Video tag doesn't exist` } })
      })
    });

    context('Given there are video tags in the database', () => {
      const testVideos = makeVideosArray();
      const testTags = makeTagsArray();
      const testVidTags = makeVidTagsArray();

      beforeEach('insert video tags', () => {
        return db
          .into('videos')
          .insert(testVideos)
          .then(() => {
              return db
                .into('tags')
                .insert(testTags)
          })
          .then(() => {
              return db
                .into('vid_tags')
                .insert(testVidTags)
          })
      });

      it('responds with 204 and updates the video tag', () => {
        const idToUpdate = 2;
        const updateVidTag = {
          vid_id: 3,
          tag_id: 1
        };
        const expectedVidTag = {
          ...testVidTags[idToUpdate - 1],
          ...updateVidTag
        };
        return supertest(app)
          .patch(`/api/vid-tags/${idToUpdate}`)
          .send(updateVidTag)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/vid-tags/${idToUpdate}`)
              .expect(expectedVidTag)
          )
      });

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2
        return supertest(app)
          .patch(`/api/vid-tags/${idToUpdate}`)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
              message: `Request body must contain a video ID and tag ID`
            }
          })
      });

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2;
        const updateVidTag = {
          tag_id: 3,
        };
        const expectedVidTag = {
          ...testVidTags[idToUpdate - 1],
          ...updateVidTag
        };

        return supertest(app)
          .patch(`/api/vid-tags/${idToUpdate}`)
          .send({
            ...updateVidTag,
            fieldToIgnore: 'should not be in GET response'
          })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/vid-tags/${idToUpdate}`)
              .expect(expectedVidTag)
          )
      });
    });
    });
});
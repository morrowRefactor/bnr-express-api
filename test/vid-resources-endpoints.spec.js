const knex = require('knex');
const app = require('../src/app');
const { expect } = require('chai');
const { makeVidResourcesArray, makeMaliciousVidResource } = require('./vid-resources.fixtures');
const { makeVideosArray } = require('./videos.fixtures');

describe('Video Resources Endpoints', function() {
  let db;

  before('make knex instance', () => {

    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);

  })

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db.raw('TRUNCATE videos, vid_resources RESTART IDENTITY CASCADE'));

  afterEach('cleanup',() => db.raw('TRUNCATE videos, vid_resources RESTART IDENTITY CASCADE'));

  describe(`GET /api/vid-resources`, () => {
    context(`Given no video resources`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/vid-resources')
          .expect(200, [])
      })
    });

    context('Given there are video resources in the database', () => {
      const testVidResources = makeVidResourcesArray();
      const testVideos = makeVideosArray();

      beforeEach('insert videos', () => {
        return db
          .into('videos')
          .insert(testVideos)
          .then(() => {
            return db
              .into('vid_resources')
              .insert(testVidResources)
          })
      });

      it('responds with 200 and all of the video resources', () => {
        return supertest(app)
          .get('/api/vid-resources')
          .expect(200, testVidResources)
      });
    });

    context(`Given an XSS attack video resource`, () => {
      const testVideos = makeVideosArray();
      const { maliciousVidResource, expectedVidResource } = makeMaliciousVidResource();

      beforeEach('insert malicious video resource', () => {
        return db
          .into('videos')
          .insert(testVideos)
          .then(() => {
            return db   
              .into('vid_resources')
              .insert([ maliciousVidResource ])
          })
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/vid-resources`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].description).to.eql(expectedVidResource.description)
            expect(res.body[0].link).to.eql(expectedVidResource.link)
            expect(res.body[0].vid_id).to.eql(expectedVidResource.vid_id)
          })
      });
    });
  });

  describe(`GET /api/vid-resources/:vid_id`, () => {
    context(`Given no video resources`, () => {
      it(`responds with 404`, () => {
        const vidResId = 123456;
        return supertest(app)
          .get(`/api/vid-resources/${vidResId}`)
          .expect(404, { error: { message: `Video resource doesn't exist` } })
      });
    });

    context('Given there are video resources in the database', () => {
      const testVideos = makeVideosArray();
      const testVidResources = makeVidResourcesArray();

      beforeEach('insert video resources', () => {
        return db
          .into('videos')
          .insert(testVideos)
          .then(() => {
            return db
              .into('vid_resources')
              .insert(testVidResources)
          })
      });

      it('responds with 200 and the specified video resource', () => {
        const vidResId = 2
        const expectedVidResource = testVidResources[vidResId - 1]
        return supertest(app)
          .get(`/api/vid-resources/${vidResId}`)
          .expect(200, expectedVidResource)
      });
    });

    context(`Given an XSS attack content`, () => {
      const testVideos = makeVideosArray();
      const { maliciousVidResource, expectedVidResource } = makeMaliciousVidResource();

      beforeEach('insert malicious video resource', () => {
        return db
          .into('videos')
          .insert(testVideos)
          .then(() => {
            return db
              .into('vid_resources')
              .insert([ maliciousVidResource ])
          })
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/vid-resources/${maliciousVidResource.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.description).to.eql(expectedVidResource.description)
            expect(res.body.link).to.eql(expectedVidResource.link)
          })
      });
    });
  });

  describe(`POST /api/vid-resources`, () => {
    const testVideos = makeVideosArray();

    beforeEach('insert videos', () => {
      return db
        .into('videos')
        .insert(testVideos)
    });

    it(`creates a video resource, responding with 201 and the new video resource`, () => {
      const newVidResource = [
        {
          description: 'Test new description',
          link: 'http://www.somesite.com',
          vid_id: 1
        },
        {
          description: 'Test new description',
          link: 'http://www.somesite.com',
          vid_id: 1
        },
      ];

      return supertest(app)
        .post('/api/vid-resources')
        .send(newVidResource)
        .expect(201)
        .expect(res => {
          expect(res.body.description).to.eql(newVidResource[0].description)
          expect(res.body.link).to.eql(newVidResource[0].link)
          expect(res.body.vid_id).to.eql(newVidResource[0].vid_id)
          expect(res.headers.location).to.eql(`/api/vid-resources/${newVidResource[0].vid_id}`)
        })
    });

    const requiredFields = ['description', 'link', 'vid_id'];

    requiredFields.forEach(field => {
        const newVidResource = [{
            description: 'Test new description',
            link: 'http://www.somesite.com',
            vid_id: 1
        }];

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newVidResource[0][field]

        return supertest(app)
          .post('/api/vid-resources')
          .send(newVidResource)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      });
    });

    it('removes XSS attack content from response', () => {
      const { maliciousVidResource, expectedVidResource } = makeMaliciousVidResource();
      return supertest(app)
        .post(`/api/vid-resources`)
        .send(maliciousVidResource)
        .expect(201)
        .expect(res => {
            expect(res.body.description).to.eql(expectedVidResource[0].description)
            expect(res.body.link).to.eql(expectedVidResource[0].link)
            expect(res.body.vid_id).to.eql(expectedVidResource[0].vid_id)
        })
    });
  });

  describe(`DELETE /api/vid-resources/:vid_id`, () => {
    context(`Given no video resources`, () => {
      it(`responds with 404`, () => {
        const vidResId = 123456
        return supertest(app)
          .delete(`/api/vid-resources/${vidResId}`)
          .expect(404, { error: { message: `Video resource doesn't exist` } })
      })
    });

    context('Given there are video resources in the database', () => {
      const testVideos = makeVideosArray();
      const testVidResources = makeVidResourcesArray();

      beforeEach('insert video resources', () => {
        return db
          .into('videos')
          .insert(testVideos)
          .then(() => {
              return db
                .into('vid_resources')
                .insert(testVidResources)
          })
      });

      it('responds with 204 and removes the video resource', () => {
        const idToRemove = 2
        const expectedVidResource = testVidResources.filter(vid => vid.id !== idToRemove)
        return supertest(app)
          .delete(`/api/vid-resources/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/vid-resources`)
              .expect(expectedVidResource)
          )
      });
    });
  });

  describe(`PATCH /api/vid-resources/:vid_id`, () => {
    context(`Given no video resources`, () => {
      it(`responds with 404`, () => {
        const vidResId = 123456
        return supertest(app)
          .delete(`/api/vid-resources/${vidResId}`)
          .expect(404, { error: { message: `Video resource doesn't exist` } })
      })
    });

    context('Given there are video resources in the database', () => {
      const testVideos = makeVideosArray();
      const testVidResources = makeVidResourcesArray();

      beforeEach('insert video resources', () => {
        return db
          .into('videos')
          .insert(testVideos)
          .then(() => {
              return db
                .into('vid_resources')
                .insert(testVidResources)
          })
      });

      it('responds with 204 and updates the video resource', () => {
        const idToUpdate = 2;
        const updateVidResource = {
          description: 'updated description title',
          link: 'http://www.newsite.com',
          vid_id: 3
        };
        const expectedVidResource = {
          ...testVidResources[idToUpdate - 1],
          ...updateVidResource
        };
        return supertest(app)
          .patch(`/api/vid-resources/${idToUpdate}`)
          .send(updateVidResource)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/vid-resources/${idToUpdate}`)
              .expect(expectedVidResource)
          )
      });

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2
        return supertest(app)
          .patch(`/api/vid-resources/${idToUpdate}`)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
              message: `Request body must contain a description, link, and video ID`
            }
          })
      });

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2;
        const updateVidResource = {
          description: 'updated description title',
        };
        const expectedVidResource = {
          ...testVidResources[idToUpdate - 1],
          ...updateVidResource
        };

        return supertest(app)
          .patch(`/api/vid-resources/${idToUpdate}`)
          .send({
            ...updateVidResource,
            fieldToIgnore: 'should not be in GET response'
          })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/vid-resources/${idToUpdate}`)
              .expect(expectedVidResource)
          )
      });
    });
    });
});
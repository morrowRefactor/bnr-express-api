const knex = require('knex');
const app = require('../src/app');
const { makeVideosArray, makeMaliciousVideo } = require('./videos.fixtures');
const { expect } = require('chai');

describe('Videos Endpoints', function() {
  let db;

  before('make knex instance', () => {

    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);

  })

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db.raw('TRUNCATE videos RESTART IDENTITY CASCADE'));

  afterEach('cleanup',() => db.raw('TRUNCATE videos RESTART IDENTITY CASCADE'));

  describe(`GET /api/videos`, () => {
    context(`Given no videos`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/videos')
          .expect(200, [])
      })
    });

    context('Given there are videos in the database', () => {
      const testVideos = makeVideosArray();

      beforeEach('insert videos', () => {
        return db
          .into('videos')
          .insert(testVideos)
      });

      it('responds with 200 and all of the videos', () => {
        return supertest(app)
          .get('/api/videos')
          .expect(200, testVideos)
        });
    });

    context(`Given an XSS attack video`, () => {
      const { maliciousVideo, expectedVideo } = makeMaliciousVideo();

      beforeEach('insert malicious video', () => {
        return db
          .into('videos')
          .insert(maliciousVideo)
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/videos`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].title).to.eql(expectedVideo.title)
            expect(res.body[0].description).to.eql(expectedVideo.description)
            expect(res.body[0].youtube_id).to.eql(expectedVideo.youtube_id)
            expect(res.body[0].date_posted).to.eql(expectedVideo.date_posted)
          })
      });
    });
  });

  describe(`GET /api/videos/:vid_id`, () => {
    context(`Given no video`, () => {
      it(`responds with 404`, () => {
        const vid = 123;
        return supertest(app)
          .get(`/api/videos/${vid}`)
          .expect(404, { error: { message: `Video doesn't exist` } })
      });
    });

    context('Given there are videos in the database', () => {
      const testVideos = makeVideosArray();

      beforeEach('insert videos', () => {
        return db
          .into('videos')
          .insert(testVideos)
      });

      it('responds with 200 and the specified video', () => {
        const vid = 2
        const expectedVideo = testVideos[vid - 1]
        return supertest(app)
          .get(`/api/videos/${vid}`)
          .expect(200, expectedVideo)
      });
    });

    context(`Given an XSS attack content`, () => {
      const { maliciousVideo, expectedVideo } = makeMaliciousVideo();

      beforeEach('insert malicious video', () => {
        return db
          .into('videos')
          .insert(maliciousVideo)
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/videos/${maliciousVideo.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.title).to.eql(expectedVideo.title)
            expect(res.body.description).to.eql(expectedVideo.description)
            expect(res.body.youtube_id).to.eql(expectedVideo.youtube_id)
            expect(res.body.date_posted).to.eql(expectedVideo.date_posted)
          })
      });
    });
  });

  describe(`POST /api/videos`, () => {

    it(`creates a video, responding with 201 and the new video`, () => {
      const newVideo = {
        title: 'test video',
        description: 'test description',
        youtube_id: 'cywyb3Y6Qxg',
        date_posted: new Date('2020-03-22T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
      };

      return supertest(app)
        .post('/api/videos')
        .send(newVideo)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newVideo.title)
          expect(res.body.description).to.eql(newVideo.description)
          expect(res.body.youtube_id).to.eql(newVideo.youtube_id)
          expect(res.body.date_posted).to.eql(newVideo.date_posted)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/api/videos/${res.body.id}`)
        })
        .then(res =>
          supertest(app)
            .get(`/api/videos/${res.body.id}`)
            .expect(res.body)
        )
    });

    const requiredFields = ['title', 'description', 'youtube_id', 'date_posted'];

    requiredFields.forEach(field => {
        const newVideo = {
            title: 'test video',
            description: 'test description',
            youtube_id: 'cywyb3Y6Qxg',
            date_posted: new Date('2020-03-22T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newVideo[field]

        return supertest(app)
          .post('/api/videos')
          .send(newVideo)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      });
    });

    it('removes XSS attack content from response', () => {
      const { maliciousVideo, expectedVideo } = makeMaliciousVideo();
      return supertest(app)
        .post(`/api/videos`)
        .send(maliciousVideo)
        .expect(201)
        .expect(res => {
            expect(res.body.title).to.eql(expectedVideo.title)
            expect(res.body.description).to.eql(expectedVideo.description)
            expect(res.body.youtube_id).to.eql(expectedVideo.youtube_id)
            expect(res.body.date_posted).to.eql(expectedVideo.date_posted)
        })
    });
  });

  describe(`DELETE /api/videos/:vid_id`, () => {
    context(`Given no videos`, () => {
      it(`responds with 404`, () => {
        const vid = 123
        return supertest(app)
          .delete(`/api/videos/${vid}`)
          .expect(404, { error: { message: `Video doesn't exist` } })
      })
    });

    context('Given there are videos in the database', () => {
      const testVideos = makeVideosArray();

      beforeEach('insert videos', () => {
        return db
          .into('videos')
          .insert(testVideos)
      });

      it('responds with 204 and removes the video', () => {
        const idToRemove = 2
        const expectedVideo = testVideos.filter(vid => vid.id !== idToRemove)
        return supertest(app)
          .delete(`/api/videos/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/videos`)
              .expect(expectedVideo)
          )
      });
    });
  });

  describe(`PATCH /api/videos/:vid_id`, () => {
    context(`Given no videos`, () => {
      it(`responds with 404`, () => {
        const vid = 123
        return supertest(app)
          .delete(`/api/videos/${vid}`)
          .expect(404, { error: { message: `Video doesn't exist` } })
      })
    });

    context('Given there are videos in the database', () => {
      const testVideos = makeVideosArray();

      beforeEach('insert videos', () => {
        return db
          .into('videos')
          .insert(testVideos)
      });

      it('responds with 204 and updates the video', () => {
        const idToUpdate = 2;
        const updateVideo = {
          title: 'updated title',
          description: 'new test description'
        };
        const expectedVideo = {
          ...testVideos[idToUpdate - 1],
          ...updateVideo
        };
        return supertest(app)
          .patch(`/api/videos/${idToUpdate}`)
          .send(updateVideo)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/videos/${idToUpdate}`)
              .expect(expectedVideo)
          )
      });

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2
        return supertest(app)
          .patch(`/api/videos/${idToUpdate}`)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
              message: `Request body must contain a title, description and YouTube ID`
            }
          })
      });

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2;
        const updateVideo = {
          title: 'updated title',
        };
        const expectedVideo = {
          ...testVideos[idToUpdate - 1],
          ...updateVideo
        };

        return supertest(app)
          .patch(`/api/videos/${idToUpdate}`)
          .send({
            ...updateVideo,
            fieldToIgnore: 'should not be in GET response'
          })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/videos/${idToUpdate}`)
              .expect(expectedVideo)
          )
      });
    });
    });
});
const knex = require('knex');
const app = require('../src/app');
const { makeCommentsArray, makeMaliciousComment } = require('./comments.fixtures');
const { makeVideosArray } = require('./videos.fixtures');
const { makeUsersArray } = require('./users.fixtures');

describe('Comments Endpoints', function() {
  let db;

  before('make knex instance', () => {

    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);

  })

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db.raw('TRUNCATE videos, users, comments RESTART IDENTITY CASCADE'));

  afterEach('cleanup',() => db.raw('TRUNCATE videos, users, comments RESTART IDENTITY CASCADE'));

  describe(`GET /api/comments`, () => {
    context(`Given no comments`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/comments')
          .expect(200, [])
      })
    });

    context('Given there are comments in the database', () => {
      const testComments = makeCommentsArray();
      const testVideos = makeVideosArray();
      const testUsers = makeUsersArray();

      beforeEach('insert comments', () => {
        return db
          .into('videos')
          .insert(testVideos)
          .then(() => {
            return db
              .into('users')
              .insert(testUsers)
          })
          .then(() => {
            return db
              .into('comments')
              .insert(testComments)
          })
      });

      it('responds with 200 and all of the comments', () => {
        return supertest(app)
          .get('/api/comments')
          .expect(200, testComments)
      });
    });

    context(`Given an XSS attack comment`, () => {
      const testVideos = makeVideosArray();
      const testUsers = makeUsersArray();
      const { maliciousComment, expectedComment } = makeMaliciousComment();

      beforeEach('insert malicious comment', () => {
        return db
          .into('videos')
          .insert(testVideos)
          .then(() => {
            return db
              .into('users')
              .insert(testUsers)
          })
          .then(() => {
            return db   
              .into('comments')
              .insert([ maliciousComment ])
          })
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/comments`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].comment).to.eql(expectedComment.comment)
            expect(res.body[0].uid).to.eql(expectedComment.uid)
            expect(res.body[0].vid_id).to.eql(expectedComment.vid_id)
            expect(res.body[0].date_posted).to.eql(expectedComment.date_posted)
          })
      });
    });
  });

  describe(`GET /api/comments/:com_id`, () => {
    context(`Given no comments`, () => {
      it(`responds with 404`, () => {
        const commentId = 123456;
        return supertest(app)
          .get(`/api/comments/${commentId}`)
          .expect(404, { error: { message: `Comment doesn't exist` } })
      });
    });

    context('Given there are comments in the database', () => {
      const testVideos = makeVideosArray();
      const testUsers = makeUsersArray();
      const testComments = makeCommentsArray();

      beforeEach('insert comments', () => {
        return db
          .into('videos')
          .insert(testVideos)
          .then(() => {
            return db
              .into('users')
              .insert(testUsers)
          })
          .then(() => {
            return db
              .into('comments')
              .insert(testComments)
          })
      });

      it('responds with 200 and the specified comment', () => {
        const commentId = 2
        const expectedComment = testComments[commentId - 1]
        return supertest(app)
          .get(`/api/comments/${commentId}`)
          .expect(200, expectedComment)
      });
    });

    context(`Given an XSS attack content`, () => {
      const testVideos = makeVideosArray();
      const testUsers = makeUsersArray();
      const { maliciousComment, expectedComment } = makeMaliciousComment();

      beforeEach('insert malicious comment', () => {
        return db
          .into('videos')
          .insert(testVideos)
          .then(() => {
            return db
              .into('users')
              .insert(testUsers)
          })
          .then(() => {
            return db
              .into('comments')
              .insert([ maliciousComment ])
          })
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/comments/${maliciousComment.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.comment).to.eql(expectedComment.comment)
            expect(res.body.uid).to.eql(expectedComment.uid)
            expect(res.body.vid_id).to.eql(expectedComment.vid_id)
            expect(res.body.date_posted).to.eql(expectedComment.date_posted)
          })
      });
    });
  });

  describe(`POST /api/comments`, () => {
    const testVideos = makeVideosArray();
    const testUsers = makeUsersArray();

    beforeEach('insert videos and users', () => {
      return db
        .into('videos')
        .insert(testVideos)
        .then(() => {
            return db
              .into('users')
              .insert(testUsers)
          })
    });

    it(`creates a comment, responding with 201 and the new comment`, () => {
      const newComment = {
        comment: 'Test new comment',
        uid: 2,
        vid_id: 1,
        date_posted: new Date('2020-01-22T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
      };
      return supertest(app)
        .post('/api/comments')
        .send(newComment)
        .expect(201)
        .expect(res => {
          expect(res.body.comment).to.eql(newComment.comment)
          expect(res.body.uid).to.eql(newComment.uid)
          expect(res.body.vid_id).to.eql(newComment.vid_id)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/api/comments/${res.body.id}`)
        })
        .then(res =>
          supertest(app)
            .get(`/api/comments/${res.body.id}`)
            .expect(res.body)
        )
    });

    const requiredFields = ['comment', 'uid', 'vid_id', 'date_posted'];

    requiredFields.forEach(field => {
        const newComment = {
            comment: 'Test new comment',
            uid: 2,
            vid_id: 1,
            date_posted: new Date('2020-01-22T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
          };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newComment[field]

        return supertest(app)
          .post('/api/comments')
          .send(newComment)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      });
    });

    it('removes XSS attack content from response', () => {
      const { maliciousComment, expectedComment } = makeMaliciousComment();
      return supertest(app)
        .post(`/api/comments`)
        .send(maliciousComment)
        .expect(201)
        .expect(res => {
            expect(res.body.comment).to.eql(expectedComment.comment)
            expect(res.body.uid).to.eql(expectedComment.uid)
            expect(res.body.vid_id).to.eql(expectedComment.vid_id)
        })
    });
  });

  describe(`DELETE /api/comments/:com_id`, () => {
    context(`Given no comments`, () => {
      it(`responds with 404`, () => {
        const commentId = 123456
        return supertest(app)
          .delete(`/api/comments/${commentId}`)
          .expect(404, { error: { message: `Comment doesn't exist` } })
      })
    });

    context('Given there are comments in the database', () => {
      const testVideos = makeVideosArray();
      const testUsers = makeUsersArray();
      const testComments = makeCommentsArray();

      beforeEach('insert comments', () => {
        return db
          .into('videos')
          .insert(testVideos)
          .then(() => {
            return db
              .into('users')
              .insert(testUsers)
        })
          .then(() => {
              return db
                .into('comments')
                .insert(testComments)
          })
      });

      it('responds with 204 and removes the comment', () => {
        const idToRemove = 2
        const expectedComment = testComments.filter(com => com.id !== idToRemove)
        return supertest(app)
          .delete(`/api/comments/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/comments`)
              .expect(expectedComment)
          )
      });
    });
  });

  describe(`PATCH /api/comments/:com_id`, () => {
    context(`Given no comments`, () => {
      it(`responds with 404`, () => {
        const commentId = 123456
        return supertest(app)
          .delete(`/api/comments/${commentId}`)
          .expect(404, { error: { message: `Comment doesn't exist` } })
      })
    });

    context('Given there are comments in the database', () => {
      const testVideos = makeVideosArray();
      const testUsers = makeUsersArray();
      const testComments = makeCommentsArray();

      beforeEach('insert comments', () => {
        return db
          .into('videos')
          .insert(testVideos)
          .then(() => {
            return db
              .into('users')
              .insert(testUsers)
        })
          .then(() => {
              return db
                .into('comments')
                .insert(testComments)
          })
      });

      it('responds with 204 and updates the comment', () => {
        const idToUpdate = 2;
        const updateComment = {
            comment: 'Test updated comment',
            uid: 3,
            vid_id: 2,
            date_posted: new Date('2020-01-22T16:28:32.615Z').toISOString('en', { timeZone: 'UTC' })
        };
        const expectedComment = {
          ...testComments[idToUpdate - 1],
          ...updateComment
        };
        return supertest(app)
          .patch(`/api/comments/${idToUpdate}`)
          .send(updateComment)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/comments/${idToUpdate}`)
              .expect(expectedComment)
          )
      });

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2
        return supertest(app)
          .patch(`/api/comments/${idToUpdate}`)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
              message: `Request body must contain a comment, user ID, video ID, and posted date`
            }
          })
      });

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2;
        const updateComment = {
          comment: 'updated comment text',
        };
        const expectedComment = {
          ...testComments[idToUpdate - 1],
          ...updateComment
        };

        return supertest(app)
          .patch(`/api/comments/${idToUpdate}`)
          .send({
            ...updateComment,
            fieldToIgnore: 'should not be in GET response'
          })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/comments/${idToUpdate}`)
              .expect(expectedComment)
          )
      });
    });
    });
});
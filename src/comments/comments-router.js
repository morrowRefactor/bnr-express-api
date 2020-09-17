const express = require('express');
const xss = require('xss');
const path = require('path');
const CommentsService = require('./comments-service');

const commentsRouter = express.Router();
const jsonParser = express.json();

const serializeComments = com => ({
  id: com.id,
  comment: xss(com.comment),
  uid: com.uid,
  vid_id: com.vid_id,
  date_posted: new Date(com.date_posted).toISOString('en', { timeZone: 'UTC' })
});

commentsRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    CommentsService.getAllComments(knexInstance)
      .then(com => {
        res.json(com.map(serializeComments))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { comment, uid, vid_id, date_posted } = req.body;
    const newComment = { comment, uid, vid_id, date_posted };

    for (const [key, value] of Object.entries(newComment))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
    CommentsService.insertComment(
      req.app.get('db'),
      newComment
    )
      .then(com => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${com.id}`))
          .json(serializeComments(com));
      })
      .catch(next)
  });

commentsRouter
  .route('/:com_id')
  .all((req, res, next) => {
    CommentsService.getById(
      req.app.get('db'),
      req.params.com_id
    )
      .then(com => {
        if (!com) {
          return res.status(404).json({
            error: { message: `Comment doesn't exist` }
          })
        }
        res.com = com
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeComments(res.com))
  })
  .delete((req, res, next) => {
    CommentsService.deleteComment(
      req.app.get('db'),
      req.params.com_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { comment, uid, vid_id, date_posted } = req.body;
    const commentToUpdate = { comment, uid, vid_id, date_posted };

    const numberOfValues = Object.values(commentToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
        return res.status(400).json({
        error: {
          message: `Request body must contain a comment, user ID, video ID, and posted date`
        }
      });
    };

    CommentsService.updateComment(
        req.app.get('db'),
        req.params.com_id,
        commentToUpdate
      )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  });

module.exports = commentsRouter;
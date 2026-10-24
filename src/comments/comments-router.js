const express = require('express');
const xss = require('xss');
const path = require('path');
const CommentsService = require('./comments-service');
const { requireAuth, isAdmin } = require('../middleware/jwt-auth');

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
  .post(requireAuth, jsonParser, (req, res, next) => {
    const { comment, vid_id, date_posted } = req.body;
    // Always post as the logged-in user, whatever uid the request claims
    const newComment = { uid: req.user.id, comment, vid_id, date_posted };
    
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
  .delete(requireAuth, (req, res, next) => {
    if (res.com.uid !== req.user.id && !isAdmin(req.user))
      return res.status(403).json({ error: 'You can only delete your own comments' });

    CommentsService.deleteComment(
      req.app.get('db'),
      req.params.com_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(requireAuth, jsonParser, (req, res, next) => {
    if (res.com.uid !== req.user.id)
      return res.status(403).json({ error: 'You can only edit your own comments' });

    const { comment, vid_id, date_posted } = req.body;
    const commentToUpdate = { comment, vid_id, date_posted };

    const numberOfValues = Object.values(commentToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
        return res.status(400).json({
        error: {
          message: `Request body must contain a comment, video ID, or posted date`
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
const express = require('express');
const xss = require('xss');
const path = require('path');
const { requireAuth } = require('../middleware/jwt-auth');
const VideosService = require('./videos-service');

const videosRouter = express.Router();
const jsonParser = express.json();

const serializeVideos = vid => ({
  id: vid.id,
  title: xss(vid.title),
  description: xss(vid.description),
  youtube_id: xss(vid.youtube_id),
  date_posted: new Date(vid.date_posted).toISOString('en', { timeZone: 'UTC' })
});

videosRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    VideosService.getAllVideos(knexInstance)
      .then(vid => {
        res.json(vid.map(serializeVideos))
      })
      .catch(next)
  })
  .post(requireAuth, jsonParser, (req, res, next) => {
    const { title, description, youtube_id, date_posted } = req.body;
    const newVideo = { title, description, youtube_id, date_posted };
    console.log('nevid', newVideo)

    for (const [key, value] of Object.entries(newVideo))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
    VideosService.insertVideo(
      req.app.get('db'),
      newVideo
    )
      .then(vid => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${vid.id}`))
          .json(serializeVideos(vid));
      })
      .catch(next)
  });

videosRouter
  .route('/:vid_id')
  .all((req, res, next) => {
    VideosService.getById(
      req.app.get('db'),
      req.params.vid_id
    )
      .then(vid => {
        if (!vid) {
          return res.status(404).json({
            error: { message: `Video doesn't exist` }
          })
        }
        res.vid = vid
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeVideos(res.vid))
  })
  .delete(requireAuth, (req, res, next) => {
    VideosService.deleteVideo(
      req.app.get('db'),
      req.params.vid_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(requireAuth, jsonParser, (req, res, next) => {
    const { title, description, youtube_id, date_posted } = req.body;
    const videoToUpdate = { title, description, youtube_id, date_posted };

    const numberOfValues = Object.values(videoToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
        return res.status(400).json({
        error: {
          message: `Request body must contain a title, description and YouTube ID`
        }
      });
    };

    VideosService.updateVideo(
        req.app.get('db'),
        req.params.vid_id,
        videoToUpdate
      )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  });

module.exports = videosRouter;
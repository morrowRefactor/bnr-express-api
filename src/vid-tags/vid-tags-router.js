const express = require('express');
const xss = require('xss');
const path = require('path');
const { requireAuth } = require('../middleware/jwt-auth');
const VidTagsService = require('./vid-tags-service');

const vidTagsRouter = express.Router();
const jsonParser = express.json();

const serializeVidTags = vidTag => ({
  id: vidTag.id,
  vid_id: vidTag.vid_id,
  tag_id: vidTag.tag_id
});

vidTagsRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    VidTagsService.getAllVidTags(knexInstance)
      .then(vidtag => {
        res.json(vidtag.map(serializeVidTags))
      })
      .catch(next)
  })
  .post(requireAuth, jsonParser, (req, res, next) => {
    const newVidTags = req.body;
    let tagcount = 0;

    newVidTags.forEach(tag => {
      const { vid_id, tag_id } = tag;
      const newVidTag = { vid_id, tag_id };

      for (const [key, value] of Object.entries(newVidTag))
        if (value == null)
          return res.status(400).json({
            error: { message: `Missing '${key}' in request body` }
          });
    })
      
    newVidTags.forEach(tag => {
      VidTagsService.insertVidTag(
        req.app.get('db'),
        tag
      )
      
      tagcount++;
    })

    if(tagcount === newVidTags.length) {
      return res
          .status(201)
          .end()
    }
  })
  .delete(requireAuth, jsonParser, (req, res, next) => {
    const delTags = req.body;
    let count = 0;

    delTags.forEach(tag => {
      VidTagsService.deleteVidTag(
        req.app.get('db'),
        tag
      )
      .then(e => {
        count++;
      });
    })

    if(count === delTags.length) {
      return res
          .status(204)
          .end()
    }
  });

vidTagsRouter
  .route('/:vidtag_id')
  .all((req, res, next) => {
    VidTagsService.getById(
      req.app.get('db'),
      req.params.vidtag_id
    )
      .then(vidtag => {
        if (!vidtag) {
          return res.status(404).json({
            error: { message: `Video tag doesn't exist` }
          })
        }
        res.vidtag = vidtag
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeVidTags(res.vidtag))
  })
  .patch(jsonParser, (req, res, next) => {
    const { vid_id, tag_id } = req.body;
    const vidTagToUpdate = { vid_id, tag_id };

    const numberOfValues = Object.values(vidTagToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
        return res.status(400).json({
        error: {
          message: `Request body must contain a video ID and tag ID`
        }
      });
    };

    VidTagsService.updateVidTag(
        req.app.get('db'),
        req.params.vidtag_id,
        vidTagToUpdate
      )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  });

module.exports = vidTagsRouter;
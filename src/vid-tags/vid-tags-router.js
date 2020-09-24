const express = require('express');
const xss = require('xss');
const path = require('path');
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
  .post(jsonParser, (req, res, next) => {
    const { vid_id, tags } = req.body;
    const newVidTag = { vid_id, tags };

    for (const [key, value] of Object.entries(newVidTag))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      newVidTag.tags.forEach(tag => {
        const eachTag = {
          tag_id: tag,
          vid_id: newVidTag.vid_id
        };

        const test = VidTagsService.insertVidTag(
          req.app.get('db'),
          eachTag
        )
      })
      
      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${newVidTag.tags[0]}`))
        .json(newVidTag)
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
  .delete((req, res, next) => {
    VidTagsService.deleteVidTag(
      req.app.get('db'),
      req.params.vidtag_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
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
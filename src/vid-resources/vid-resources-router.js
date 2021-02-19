const express = require('express');
const xss = require('xss');
const path = require('path');
const { requireAuth } = require('../middleware/jwt-auth');
const VidResourcesService = require('./vid-resources-service');

const vidResourcesRouter = express.Router();
const jsonParser = express.json();

const serializeVidResources = vid => ({
  id: vid.id,
  description: xss(vid.description),
  link: xss(vid.link),
  vid_id: vid.vid_id
});

vidResourcesRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    VidResourcesService.getAllVidResources(knexInstance)
      .then(vid => {
        res.json(vid.map(serializeVidResources))
      })
      .catch(next)
  })
  .post(requireAuth, jsonParser, (req, res, next) => {
    const newVidResources = req.body;
    let insertCount = 0;
    
    newVidResources.forEach(vidRes => {
      const { description, link, vid_id } = vidRes;
      const newVidRes = { description, link, vid_id };

      for (const [key, value] of Object.entries(newVidRes))
        if (value == null)
          return res.status(400).json({
            error: { message: `Missing '${key}' in request body` }
          });
    })
    
    newVidResources.forEach(res => {
      const eachVidRes = {
        vid_id: res.vid_id,
        description: res.description,
        link: res.link
      };

      VidResourcesService.insertVidResource(
        req.app.get('db'),
        eachVidRes
      );

      insertCount++;
    })

    if(insertCount === newVidResources.length) {
      return res
        .status(201)
        .end()
    }
  });
  
vidResourcesRouter
  .route('/:vid_id')
  .all((req, res, next) => {
    VidResourcesService.getById(
      req.app.get('db'),
      req.params.vid_id
    )
      .then(vid => {
        if (!vid) {
          return res.status(404).json({
            error: { message: `Video resource doesn't exist` }
          })
        }
        res.vid = vid
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeVidResources(res.vid))
  })
  .delete((req, res, next) => {
    VidResourcesService.deleteVidResource(
      req.app.get('db'),
      req.params.vid_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { description, link, vid_id } = req.body;
    const videoToUpdate = { description, link, vid_id };

    const numberOfValues = Object.values(videoToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
        return res.status(400).json({
        error: {
          message: `Request body must contain a description, link, and video ID`
        }
      });
    };

    VidResourcesService.updateVidResource(
        req.app.get('db'),
        req.params.vid_id,
        videoToUpdate
      )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  });

module.exports = vidResourcesRouter;
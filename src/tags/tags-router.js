const express = require('express');
const xss = require('xss');
const path = require('path');
const TagsService = require('./tags-service');

const tagsRouter = express.Router();
const jsonParser = express.json();

const serializeTags = t => ({
  id: t.id,
  tag: xss(t.tag)
});

tagsRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    TagsService.getAllTags(knexInstance)
      .then(user => {
        res.json(user.map(serializeTags))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { tag } = req.body;
    const newTag = { tag };

    for (const [key, value] of Object.entries(newTag))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
    TagsService.insertTag(
      req.app.get('db'),
      newTag
    )
      .then(tag => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${tag.id}`))
          .json(serializeTags(tag))
      })
      .catch(next)
  });

tagsRouter
  .route('/:tag_id')
  .all((req, res, next) => {
    TagsService.getById(
      req.app.get('db'),
      req.params.tag_id
    )
      .then(tag => {
        if (!tag) {
          return res.status(404).json({
            error: { message: `Tag doesn't exist` }
          })
        }
        res.tag = tag
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeTags(res.tag))
  })
  .delete((req, res, next) => {
    TagsService.deleteTag(
      req.app.get('db'),
      req.params.tag_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { tag } = req.body;
    const tagToUpdate = { tag };

    const numberOfValues = Object.values(tagToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
        return res.status(400).json({
        error: {
          message: `Request body must contain a tag name`
        }
      });
    };

    TagsService.updateTag(
        req.app.get('db'),
        req.params.tag_id,
        tagToUpdate
      )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  });

module.exports = tagsRouter;
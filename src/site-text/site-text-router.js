const express = require('express');
const xss = require('xss');
const path = require('path');
const { requireAuth } = require('../middleware/jwt-auth');
const SiteTextService = require('./site-text-service');

const siteTextRouter = express.Router();
const jsonParser = express.json();

const serializeSiteText = t => ({
  id: t.id,
  field: xss(t.field),
  body: xss(t.body)
});

siteTextRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    SiteTextService.getAllSiteText(knexInstance)
      .then(text => {
        res.json(text.map(serializeSiteText))
      })
      .catch(next)
  })
  .patch(requireAuth, jsonParser, (req, res, next) => {
    const updatedText = req.body;
    let insertCount = 0;

    updatedText.forEach(text => {
      const { field, body } = text;
      const newText = { field, body };

      for (const [key, value] of Object.entries(newText))
        if (value == null)
          return res.status(400).json({
            error: { message: `Missing '${key}' in request body` }
          });
    })
    
    updatedText.forEach(text => {
      const eachText = {
        id: text.id,
        field: text.field,
        body: text.body
      };

      SiteTextService.updateSiteText(
        req.app.get('db'),
        eachText.id,
        eachText
      )
      .then(() => {
        insertCount++;
      });
    })

    if(insertCount === updatedText.length) {
      return res
        .status(201)
        .end()
    }
  });

module.exports = siteTextRouter;
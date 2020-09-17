require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const usersRouter = require('./users/users-router');
const tagsRouter = require('./tags/tags-router');
const videosRouter = require('./videos/videos-router');
const vidTagsRouter = require('./vid-tags/vid-tags-router');
const vidResourcesRouter = require('./vid-resources/vid-resources-router');
const commentsRouter = require('./comments/comments-router');

const app = express();

app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common', {
  skip: () => NODE_ENV === 'test'
}));

app.use(helmet());
app.use(cors());

app.use('/api/users', usersRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/videos', videosRouter);
app.use('/api/vid-tags', vidTagsRouter);
app.use('/api/vid-resources', vidResourcesRouter);
app.use('/api/comments', commentsRouter);

app.get('/', (req, res) => {
  res.send('Hello, world!')
});

app.use(function errorHandler(error, req, res, next) {
   let response
   if (NODE_ENV === 'production') {
   response = { error: { message: 'server error' } }
     } else {
     console.error(error)
     response = { message: error.message, error }
   }
   res.status(500).json(response)
});

module.exports = app;
const express = require('express');
const xss = require('xss');
const path = require('path');
const UsersService = require('./users-service');
const AuthService = require('../auth/auth-service');
const { requireAuth } = require('../middleware/jwt-auth');

const usersRouter = express.Router();
const jsonParser = express.json();

const serializeUsers = u => ({
  id: u.id,
  name: xss(u.name),
  email: xss(u.email),
  about: xss(u.about),
  joined_date: new Date(u.joined_date).toISOString('en', { timeZone: 'UTC' })
});

const serializeNewUser = u => ({
  id: u.id,
  name: xss(u.name),
  email: xss(u.email),
  about: xss(u.about),
  joined_date: new Date(u.joined_date).toISOString('en', { timeZone: 'UTC' }),
  authToken: u.authToken
});

usersRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    UsersService.getAllUsers(knexInstance)
      .then(user => {
        res.json(user.map(serializeUsers))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { name, email, password } = req.body;
    const newUser = { name, email, password };

    for (const [key, value] of Object.entries(newUser))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
    
    const passwordError = UsersService.validatePassword(password);
    if (passwordError)
      return res.status(400).json({ error: passwordError });
    
    UsersService.hasUserWithUserEmail(
      req.app.get('db'),
      email
    )
      .then(hasUserWithUserEmail => {
        if (hasUserWithUserEmail)
          return res.status(400).json({ error: `User email already taken` })
    
          return UsersService.hashPassword(password)
          .then(hashedPassword => {
            const newUser = {
              name,
              email,
              password: hashedPassword
            };

            UsersService.insertUser(
              req.app.get('db'),
              newUser
            )
              .then(user => {
                const sub = user.email;
                const payload = { user_id: user.id };
                const authToken = AuthService.createJwt(sub, payload);
                user.authToken = authToken;
                res
                  .status(201)
                  .location(path.posix.join(req.originalUrl, `/${user.id}`)) 
                  .json(serializeNewUser(user));
              })
            })
      })
      .catch(next)
  });

usersRouter
  .route('/:user_id')
  .all((req, res, next) => {
    UsersService.getById(
      req.app.get('db'),
      req.params.user_id
    )
      .then(user => {
        if (!user) {
          return res.status(404).json({
            error: { message: `User doesn't exist` }
          })
        }
        res.user = user
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeUsers(res.user))
  })
  .delete(requireAuth, (req, res, next) => {
    UsersService.deleteUser(
      req.app.get('db'),
      req.params.user_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(requireAuth, jsonParser, (req, res, next) => {
    const { id, name, about, email, password } = req.body;
    const userToUpdate = { id, name, about, email, password };

    
    if(userToUpdate.password) {
      const reqFields = { id, email, password };
      const numberOfValues = Object.values(reqFields).filter(Boolean).length;
      if (numberOfValues === 0) {
          return res.status(400).json({
          error: {
            message: `Request body must contain an id, email, and password`
          }
        });
      };

      return UsersService.hashPassword(password)
        .then(hashedPassword => {
            const updatedUser = {
              id: userToUpdate.id,
              name: userToUpdate.name,
              email: userToUpdate.email,
              password: hashedPassword
            };

            UsersService.updateUser(
              req.app.get('db'),
              req.params.user_id,
              updatedUser
            )
            .then(numRowsAffected => {
              res.status(204).end()
            })
            .catch(next)
        })
    }
    else {
      if (!userToUpdate.id) {
          return res.status(400).json({
          error: {
            message: `Request body must contain an id`
          }
        });
      };

      UsersService.updateUser(
        req.app.get('db'),
        req.params.user_id,
        userToUpdate
      )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
    }
  });

module.exports = usersRouter;
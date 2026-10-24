const express = require('express');
const xss = require('xss');
const path = require('path');
const UsersService = require('./users-service');
const AuthService = require('../auth/auth-service');
const { requireAuth, optionalAuth, isAdmin } = require('../middleware/jwt-auth');

const usersRouter = express.Router();
const jsonParser = express.json();

function adjDate(dte) {
  let d = dte;
  d.setHours(dte.getHours() - 8);
  return d.toISOString('en', { timeZone: 'UTC' });
};

const serializeUsers = u => ({
  id: u.id,
  name: xss(u.name),
  about: xss(u.about),
  joined_date: adjDate(u.joined_date)
});

const serializePrivateUser = u => ({
  ...serializeUsers(u),
  email: xss(u.email)
});

function canManageUser(reqUser, userId) {
  return !!reqUser && (reqUser.id === userId || isAdmin(reqUser));
};

const serializeNewUser = u => ({
  id: u.id,
  name: xss(u.name),
  email: xss(u.email),
  about: xss(u.about),
  joined_date: adjDate(u.joined_date),
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
    const { name, email, password, joined_date} = req.body;
    const newUser = { name, email, password, joined_date };
    
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
              password: hashedPassword,
              joined_date: req.body.joined_date
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
  .get(optionalAuth, (req, res, next) => {
    const serialize = canManageUser(req.user, res.user.id) ? serializePrivateUser : serializeUsers;
    res.json(serialize(res.user))
  })
  .delete(requireAuth, (req, res, next) => {
    if (!canManageUser(req.user, res.user.id))
      return res.status(403).json({ error: 'You can only delete your own account' });

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
    if (!canManageUser(req.user, res.user.id))
      return res.status(403).json({ error: 'You can only edit your own account' });

    const { name, about, email, password } = req.body;
    const userToUpdate = { name, about, email };

    if (Object.values({ ...userToUpdate, password }).filter(Boolean).length === 0) {
      return res.status(400).json({
        error: {
          message: `Request body must contain a name, about, email, or password`
        }
      });
    };

    if (password) {
      const passwordError = UsersService.validatePassword(password);
      if (passwordError)
        return res.status(400).json({ error: passwordError });
    }

    const db = req.app.get('db');
    const emailCheck = (email && email !== res.user.email)
      ? UsersService.hasUserWithUserEmail(db, email)
      : Promise.resolve(false);

    emailCheck
      .then(emailTaken => {
        if (emailTaken)
          return res.status(400).json({ error: `User email already taken` });

        return (password ? UsersService.hashPassword(password) : Promise.resolve(undefined))
          .then(hashedPassword => {
            // knex skips undefined fields, so anything not sent stays as it was
            return UsersService.updateUser(db, res.user.id, { ...userToUpdate, password: hashedPassword })
          })
          .then(() => {
            res.status(204).end()
          })
      })
      .catch(next)
  });

module.exports = usersRouter;
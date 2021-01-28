const express = require('express');
const xss = require('xss');
const path = require('path');
const ResetPasswordService = require('./reset-password-service');
const { requireAuth } = require('../middleware/jwt-auth');

const resetPasswordRouter = express.Router();
const jsonParser = express.json();

const serializeTempPass = u => ({
    id: u.id,
    uid: u.uid,
    email: xss(u.email),
    password: xss(u.password)
});

resetPasswordRouter
  .route('/')
  .post(jsonParser, (req, res, next) => {
    const { uid, email, password } = req.body;
    const newReq = { uid, email, password };

    for (const [key, value] of Object.entries(newReq))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
    
    return ResetPasswordService.hashPassword(password)
        .then(hashedPassword => {
            const newPass = {
                uid,
                email,
                password: hashedPassword
        };

    ResetPasswordService.insertTempPass(
        req.app.get('db'),
        newPass
    )
        .then(pass => {
            const sub = pass.email;
            const payload = { pass_id: pass.uid };
            const authToken = ResetPasswordService.createJwt(sub, payload);
            pass.authToken = authToken;
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${pass.id}`)) 
                .json(serializeTempPass(pass));
            })
    })
      .catch(next)
  });

resetPasswordRouter
  .route('/:pass_id')
  .all((req, res, next) => {
    ResetPasswordService.getById(
      req.app.get('db'),
      req.params.pass_id
    )
      .then(pass => {
        if (!pass) {
          return res.status(404).json({
            error: { message: `Temporary password doesn't exist` }
          })
        }
        res.pass = pass
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeTempPass(res.pass))
  })
  .post(jsonParser, (req, res, next) => {
    const { id, uid, email, password } = req.body;
    const loginUser = { id, uid, email, password };
    
    for (const [key, value] of Object.entries(loginUser))
        if (value == null)
            return res.status(400).json({
                error: `Missing '${key}' in request body`
            })

    ResetPasswordService.getById(
        req.app.get('db'),
        req.params.pass_id
        )
        .then(dbUser => {
            if (!dbUser)
            return res.status(400).json({
                error: 'Incorrect email or password',
            })
    
            return ResetPasswordService.comparePasswords(loginUser.password, dbUser.password)
            .then(compareMatch => {
                if (!compareMatch) {
                    return res.status(400).json({
                        error: 'Incorrect email or password',
                    });
                }
                
                const sub = loginUser.email;
                const payload = { id: loginUser.uid };
                res.send({
                    authToken: ResetPasswordService.createJwt(sub, payload),
                });
            })
        })
        .catch(next)
  })
  .delete(requireAuth, (req, res, next) => {
    ResetPasswordService.deleteTempPass(
      req.app.get('db'),
      req.params.pass_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  });

module.exports = resetPasswordRouter;
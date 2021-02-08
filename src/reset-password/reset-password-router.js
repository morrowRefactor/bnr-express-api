const express = require('express');
const xss = require('xss');
const path = require('path');
const ResetPasswordService = require('./reset-password-service');
const { requireAuth } = require('../middleware/jwt-auth');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const config = require('../config');

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

    // send  reset email
    ResetPasswordService.getUserById(req.app.get('db'), uid).then(user => {
      const firstName = user.name.split(" ");
      let defaultClient = SibApiV3Sdk.ApiClient.instance;
      let apiKey = defaultClient.authentications['api-key'];
      apiKey.apiKey = config.EMAIL_API_KEY;
      let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
      let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      
      sendSmtpEmail.subject = "Your temporary password";
      sendSmtpEmail.htmlContent = `<html><body><p>Hi ${firstName[0]},</p><p>Here is the temporary password you requested: <strong>${password}</strong></p><p>If you did not request a password reset, please reply to this email with your concerns.</p><p>Beer and News Report</p></body></html>`;
      sendSmtpEmail.sender = {"name":"Beer and News Report","email":"beerandnewsreport@gmail.com"};
      sendSmtpEmail.to = [{"email": `${user.email}`,"name":`${user.name}`}];
      sendSmtpEmail.replyTo = {"email":"beerandnewsreport@gmail.com","name":"Beer and News Report"};
      sendSmtpEmail.headers = {"Password Reset":"unique-id-1234"};
      
      apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
        console.log('API called successfully. Returned data: ' + JSON.stringify(data));
      }, function(error) {
        console.error(error);
      });
    })
    
    
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
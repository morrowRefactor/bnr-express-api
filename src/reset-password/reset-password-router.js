const express = require('express');
const crypto = require('crypto');
const ResetPasswordService = require('./reset-password-service');
const { escapeHtml } = require('../utils/escape-html');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const config = require('../config');

const resetPasswordRouter = express.Router();
const jsonParser = express.json();

const TEMP_PASS_LIFETIME_MS = 60 * 60 * 1000;

// Same response whether or not the email has an account, so this can't be used to look up users
const RESET_REQUESTED_MESSAGE = 'If an account exists for that email, a temporary password has been sent to it.';

function generateTempPassword() {
    return crypto.randomBytes(12).toString('hex');
};

function sendTempPasswordEmail(user, password) {
    const firstName = user.name.split(" ");
    let defaultClient = SibApiV3Sdk.ApiClient.instance;
    let apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = config.EMAIL_API_KEY;
    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = "Your temporary password";
    sendSmtpEmail.htmlContent = `<html><body><p>Hi ${escapeHtml(firstName[0])},</p><p>Here is the temporary password you requested: <strong>${password}</strong></p><p>It expires in one hour and can only be used once.</p><p>If you did not request a password reset, please reply to this email with your concerns.</p><p>Beer and News Report</p></body></html>`;
    sendSmtpEmail.sender = {"name":"Beer and News Report","email":"beerandnewsreport@gmail.com"};
    sendSmtpEmail.to = [{"email": `${user.email}`,"name":`${user.name}`}];
    sendSmtpEmail.replyTo = {"email":"beerandnewsreport@gmail.com","name":"Beer and News Report"};
    sendSmtpEmail.headers = {"Password Reset":"unique-id-1234"};

    apiInstance.sendTransacEmail(sendSmtpEmail).then(function() {
      console.log('Temporary password email sent');
    }, function(error) {
      console.error(error);
    });
};

resetPasswordRouter
  .route('/')
  .post(jsonParser, (req, res, next) => {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({
        error: { message: `Missing 'email' in request body` }
      });

    const db = req.app.get('db');
    ResetPasswordService.getUserByEmail(db, email)
      .then(user => {
        if (!user) return;

        // The server picks the temporary password and only ever sends it to the account's own email
        const tempPassword = generateTempPassword();
        return ResetPasswordService.deleteTempPassesForUser(db, user.id)
          .then(() => ResetPasswordService.hashPassword(tempPassword))
          .then(hashedPassword => ResetPasswordService.insertTempPass(db, {
            uid: user.id,
            email: user.email,
            password: hashedPassword
          }))
          .then(() => sendTempPasswordEmail(user, tempPassword));
      })
      .then(() => {
        res.status(202).json({ message: RESET_REQUESTED_MESSAGE });
      })
      .catch(next)
  });

resetPasswordRouter
  .route('/login')
  .post(jsonParser, (req, res, next) => {
    const { email, password } = req.body;
    for (const [key, value] of Object.entries({ email, password }))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });

    const db = req.app.get('db');
    ResetPasswordService.getTempPassByEmail(db, email)
      .then(tempPass => {
        const expired = tempPass && (Date.now() - new Date(tempPass.created_at).getTime() > TEMP_PASS_LIFETIME_MS);
        if (!tempPass || expired)
          return res.status(400).json({ error: 'Incorrect email or temporary password' });

        return ResetPasswordService.comparePasswords(password, tempPass.password)
          .then(compareMatch => {
            if (!compareMatch)
              return res.status(400).json({ error: 'Incorrect email or temporary password' });

            // One-time use: remove it before handing out the login token
            return ResetPasswordService.deleteTempPassesForUser(db, tempPass.uid)
              .then(() => ResetPasswordService.getUserById(db, tempPass.uid))
              .then(user => {
                res.send({
                  uid: user.id,
                  authToken: ResetPasswordService.createJwt(user.email, { id: user.id }),
                });
              });
          });
      })
      .catch(next)
  });

module.exports = resetPasswordRouter;

const express = require('express');
const xss = require('xss');
const path = require('path');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const config = require('../config');

const contactUsRouter = express.Router();
const jsonParser = express.json();

contactUsRouter
  .route('/')
  .post(jsonParser, (req, res, next) => {
    const { name, email, message } = req.body;
    const newReq = { name, email, message };

    for (const [key, value] of Object.entries(newReq))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });

    // send  email
    let defaultClient = SibApiV3Sdk.ApiClient.instance;
    let apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = config.EMAIL_API_KEY;
    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    
    sendSmtpEmail.subject = "Contact Us Form Message";
    sendSmtpEmail.htmlContent = `<html><body><p>New message submitted through Contact Us form.</p><p><strong>Name: </strong>${name}</p><p><strong>Email: </strong>${email}</p><p><strong>Message: </strong>${message}</p></body></html>`;
    sendSmtpEmail.sender = {"name":"BNR Form Alert","email":"beerandnewsreport@gmail.com"};
    sendSmtpEmail.to = [{"email":"beerandnewsreport@gmail.com","name":"Beer and News Report"}];
    sendSmtpEmail.replyTo = {"email":"beerandnewsreport@gmail.com","name":"Beer and News Report"};
    sendSmtpEmail.headers = {"Contact Us Message":"unique-id-2345"};
    
    apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
    console.log('API called successfully. Returned data: ' + JSON.stringify(data));
    }, function(error) {
    console.error(error);
    });
    
    return res
        .status(201)
        .end()
  });

module.exports = contactUsRouter;
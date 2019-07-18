import { Request, Response, NextFunction } from 'express';
import { SignupRequest } from '../types/types';
const sendMail = require('../mailer/transporter').sendMail;

const QuickEncrypt = require('quick-encrypt')
const keys = QuickEncrypt.generate(1024) // Use either 2048 bits or 1024 bits.
import { mailParams } from '../types/types';

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');


/* POST to request signup of email address */
router.post('/signup/request', async function (req: Request, res: Response, next: NextFunction) {
    const requestData: SignupRequest = req.body;
    console.log(requestData.emailAddress);
    const encrypted = QuickEncrypt.encrypt(requestData.emailAddress, keys.public);
    let link = 'https://api.alethena.com/user/signup/complete/';
    link += requestData.emailAddress;
    link += '/';
    link += encrypted;
    link += '/';
    link += requestData.contractAddress;

    const style = fs.readFileSync(path.join(__dirname, '../mailer/templates/mailTemplates/overallCSS/basic.html'));
    const renderedHtml = await ejs.renderFile(path.join(__dirname, '../mailer/templates/mailTemplates/signup/signup.ejs'), { 'link': link, 'style': style });

    const mailProps: mailParams = {
        'to': [requestData.emailAddress],
        'subject': 'verify your email address',
        'html': renderedHtml,
    };

    try {
        await sendMail(mailProps);
        res.json({ 'message': 'Email sent' });
    } catch (error) {
        res.status(500);
        res.json({ 'error': 'Could not send email' });
    }
});

/* GET to complete signup of email address */
router.get('/signup/complete/:email/:enc/:contractaddress', function (req: Request, res: Response, next: NextFunction) {
    const email = req.params.email;
    const enc = req.params.enc;
    const contractAddress = req.params.contractaddress;
  
    let check = QuickEncrypt.decrypt(enc, keys.private);
  
    if (check === email) {
      const sql = `INSERT INTO notifications VALUES(?,?);`;
  
      let dataToInsert = [
        contractAddress,
        email
      ];
      console.log(sql, dataToInsert);
      res.send('You are now registered!');

  
    //   db.query(sql, dataToInsert).then(() => {
    //     res.send('You are now registered!');
    //   }, (error) => {
    //     res.status(500).send(error);
    //   });
    } else {      res.render('error');
    }
  });


module.exports = router;

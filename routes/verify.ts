import { Request, Response, NextFunction } from 'express';
import { MailParams } from '../types/types';
import { readFileSync } from 'fs';
const uuidv4 = require('uuid/v4');
const md5 = require('md5');
const sendMail = require('../mailer/transporter');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

const Raven = require('raven');
Raven.config('https://859b08c222a44baf887d309907267edc@sentry.io/1860345').install();

const express = require('express');
const router = express.Router();

/* POST a request to verify email address*/
router.post('/', async function (req: Request, res: Response, next: NextFunction) {
    const userMail = req.body.email;
    const userCode = generateCode();

    const style = fs.readFileSync(path.join(__dirname, '../mailer/templates/mailTemplates/overallCSS/basic.html'));
    const renderedHtml = await ejs.renderFile(path.join(__dirname, '../mailer/templates/mailTemplates/insiderVerification/insiderVerification.ejs'), { 'code': userCode, 'style': style });

    const mailProps: MailParams = {
        'to': [userMail],
        'subject': 'Verify Your Email Address',
        'html': renderedHtml,
    };

    try {
        await sendMail(mailProps);
        res.json({ 'hashedvalue': md5(userCode + userMail) });
    } catch (error) {
        Raven.captureException(error);
        res.status(500);
        res.json({ 'error': 'An error occured' });
    }
});

function generateCode() {
    return uuidv4().slice(0, 4).toUpperCase();
}

module.exports = router;

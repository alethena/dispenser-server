import { Request, Response, NextFunction } from 'express';
import { mailParams } from '../types/types';
import { readFileSync } from 'fs';
const uuidv4 = require('uuid/v4');
const md5 = require('md5');
const sendMail = require('../mailer/transporter').sendMail;
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

const express = require('express');
const router = express.Router();

/* POST a request to verify email address*/
router.post('/', async function (req: Request, res: Response, next: NextFunction) {
    const userMail = req.body.email;
    const userCode = generateCode();

    const style = fs.readFileSync(path.join(__dirname, '../mailer/templates/mailTemplates/overallCSS/basic.html'));
    const renderedHtml = await ejs.renderFile(path.join(__dirname, '../mailer/templates/mailTemplates/insiderVerification/insiderVerification.ejs'), { 'code': userCode, 'style': style });

    const mailProps: mailParams = {
        'to': [userMail],
        'subject': 'verify your email address',
        'html': renderedHtml,
    };

    try {
        await sendMail(mailProps);
        res.json({ 'hashedvalue': md5(userCode + userMail) });
    } catch (error) {
        res.status(500);
        res.json({ 'error': 'A fuckup happened' });
    }
});

function generateCode() {
    return uuidv4().slice(0, 4).toUpperCase();
}

module.exports = router;

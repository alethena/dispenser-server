import { Request, Response, NextFunction } from 'express';

const uuidv4 = require('uuid/v4');
const md5 = require('md5');
const sendMail = require('../mailer/confirmationCode').sendCode;

const express = require('express');
const router = express.Router();

/* POST a request to verify email address*/
router.post('/', async function (req: Request, res: Response, next: NextFunction) {
    const userMail = req.body.email;
    const userCode = generateCode();
    await sendMail(userCode, [userMail]);
    res.json({ 'hashedvalue': md5(userCode + userMail) });
    res.render('index', { title: 'Alethena API' });
});

function generateCode() {
    return uuidv4().slice(0, 4).toUpperCase();
}

module.exports = router;

import { Request, Response, NextFunction } from 'express';

const db = require('../database/dbConnection');
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
// const writeToDB = require('../database/writeTrade').main;
const htmlToPDF = require('../mailer/generatePDF');
const ejs = require('ejs');

const Raven = require('raven');
Raven.config('https://859b08c222a44baf887d309907267edc@sentry.io/1860345').install();

import { InsiderRequest } from '../types/types';

/* POST a request to verify email address*/
router.post('/', async function (req: Request, res: Response, next: NextFunction) {
    const insiderRequest: InsiderRequest = req.body;
    // console.log(insiderRequest);

    const sql = `insert into insiderTrades (sessionID, emailAddress, insiderInformation) values (?,?,?);`;
    const values = [insiderRequest.sessionID, insiderRequest.emailAddress, insiderRequest.insiderInformation];

    try {
        await db.query(sql, values);
        const renderedHtml = await ejs.renderFile(path.join(__dirname, '../mailer/templates/pdfTemplates/insiderPDF/insiderPDF.ejs'), { 'text': insiderRequest.insiderInformation });
        const pdfFile = await htmlToPDF(renderedHtml);
        fs.writeFileSync(path.join(__dirname, '../public/insiderPDFs/' + insiderRequest.sessionID + '.pdf'), pdfFile);
        res.json({ 'msg': 'Trade was registered' });

    } catch (error) {
        Raven.captureException(error);
    }
});


module.exports = router;

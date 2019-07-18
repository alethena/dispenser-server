import { Company } from "../types/types";

const db = require('../database/db');
const async = require('async');
const sendMail = require('../mailer/SDNotificationMail').sendSDNotification;
const convertToCSV = require('../helpers/formatCSV').convertToCSV;
var Raven = require('raven');
Raven.config('https://853db40d557b42189a6b178ba7428001@sentry.io/1470742').install();

async function main() {
    const sql1 = `SELECT SDAddress, lastBlockReported FROM companies WHERE SDActive = 1;`;

    try {
        const companies = await db.query(sql1, []);
        companies.forEach(async (company: Company) => {
            const sql2 = `SELECT * FROM SDTransactions WHERE contractAddress = ? AND blockNumber > ?;`;
            const txnsToReport = await db.query(sql2, [company.SDAddress, company.lastBlockReported]);
            const txnCSV = await convertToCSV(txnsToReport);

            // Format correctly and send out to recipients
            const sql3 = `SELECT emailAddress FROM notifications WHERE contractAddress = ?`
            const rawRecipients = await db.query(sql3, [company.SDAddress]);
            let recipients: object[] = [];
            rawRecipients.forEach((recipient: any) => {
                recipients.push(recipient.emailAddress);
            });

            if (recipients[0] != undefined && txnsToReport[0] != undefined) {
                const lastBlockReported = await db.query(`SELECT blockNumber from SDTransactions ORDER BY blockNumber DESC LIMIT 1;`, []);
                await db.query(`UPDATE companies SET lastBlockReported = ? WHERE SDAddress =?;`, [lastBlockReported[0].blockNumber, company.SDAddress]);
                await sendMail(company.SDAddress + '.csv', txnCSV, recipients);
            }
        })
    } catch (error) {
        Raven.captureException(error);
    }
}

module.exports.SDReport = main;

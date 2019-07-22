import { Company, MailParams } from "../types/types";

const db = require('../database/dbConnection');
const convertToCSV = require('../csv/insiderCSV');
const sendMail = require('../mailer/transporter');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const Raven = require('raven');
Raven.config('https://c62c738ee3954263a16c3f53af05a4e8@sentry.io/1510309').install();

async function main() {
    const sql1 = `SELECT SDAddress, lastBlockReported FROM companies WHERE SDActive = 1;`;

    try {
        const companies = await db.query(sql1, []);
        companies.forEach(async (company: Company) => {
            const sql2 = `SELECT * FROM SDTransactions LEFT JOIN insiderTrades ON SDTransactions.txhash = insiderTrades.txHash WHERE contractAddress = ? AND blockNumber > ?;`;
            const txnsToReport = await db.query(sql2, [company.SDAddress, company.lastBlockReported]);

            let outputFile: any = [];
            txnsToReport.forEach((logItem: any) => {
                outputFile.push({
                    "timestamp": new Date(logItem.timestamp).toISOString(),
                    "blockNumber": logItem.blockNumber,
                    "txhash": logItem.txhash,
                    "contractAddress": logItem.contractAddress,
                    "buy": logItem.buy === 1,
                    "sell": logItem.buy === 0,
                    "amount": logItem.amount,
                    "price": Math.floor(logItem.price / 10 ** 16 / logItem.amount) / 100,
                    "volume": Math.floor(logItem.price / 10 ** 16) / 100,
                    "insider": (logItem.sessionID) ? logItem.insiderInformation : 'Nein',
                    "user": logItem.user
                })
            });

            const CSV = await convertToCSV(outputFile);

            // // Format correctly and send out to recipients
            const sql3 = `SELECT emailAddress FROM notifications WHERE contractAddress = ?`
            const rawRecipients = await db.query(sql3, [company.SDAddress]);
            let recipients: string[] = [];
            rawRecipients.forEach((recipient: any) => {
                recipients.push(recipient.emailAddress);
            });

            if (recipients[0] != undefined && txnsToReport[0] != undefined) {
                const lastBlockReported = await db.query(`SELECT blockNumber from SDTransactions ORDER BY blockNumber DESC LIMIT 1;`, []);
                await db.query(`UPDATE companies SET lastBlockReported = ? WHERE SDAddress =?;`, [lastBlockReported[0].blockNumber, company.SDAddress]);


                const style = fs.readFileSync(path.join(__dirname, '../mailer/templates/mailTemplates/overallCSS/basic.html'));
                const renderedHtmlMail = await ejs.renderFile(path.join(__dirname, '../mailer/templates/mailTemplates/transactionNotification/transactionNotification.ejs'), { 'style': style });

                const mailParams: MailParams = {
                    'to': recipients,
                    'subject': 'Transaction Notification',
                    'html': renderedHtmlMail,
                    'attachments': [{ 'filename': 'TransactionNotification.csv', 'content': CSV }]
                }

                await sendMail(mailParams);
            }
        })
    } catch (error) {
        Raven.captureException(error);
        console.log(error);
    }
}

module.exports = main;

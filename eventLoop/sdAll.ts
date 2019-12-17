import { Company } from "../types/types";
import { EventLog } from "web3/types";

const db = require('../database/dbConnection');
const fs = require('fs');
const path = require('path');
const outputPath = '../public/log';
// var Raven = require('raven');
const convertToCSV = require('../csv/insiderCSV');

const Raven = require('raven');
Raven.config('https://859b08c222a44baf887d309907267edc@sentry.io/1860345').install();

async function generateSDAll() {
    // select * from SDTransactions left join insiderTrades on SDTransactions.txhash = insiderTrades.txHash
    const sql1 = `SELECT SDAddress, tokenSymbol FROM companies WHERE SDActive = 1;`;
    const companies = await db.query(sql1, []);
    //console.log(companies);
    companies.forEach(async (company: Company) => {
        //console.log(company.SDAddress);
        let outputFile: any = [];
        let outputFile2: any = [];
        let outputFile3: any = [];

        const sql2 = `select * from SDTransactions left join insiderTrades on SDTransactions.txhash = insiderTrades.txHash order by timestamp DESC;`;
        db.query(sql2, [company.SDAddress]).then(async (log: EventLog[]) => {
            log.forEach((logItem: any) => {
                outputFile.push({
                    "timestamp": new Date(logItem.timestamp).getTime(),
                    "type": (logItem.buy === 0) ? "Verkauf" : "Kauf",
                    "amount": logItem.amount,
                    "price": Math.floor(logItem.price / 10 ** 16) / 100,
                    "insider": (logItem.sessionID) ? "https://sh.alethena.com/insiderPDFs/" + logItem.sessionID + ".pdf" : 'Nein'
                })
            });
            fs.writeFileSync(path.join(__dirname, '../public/dispenser/' + company.tokenSymbol + 'SD.json'), JSON.stringify(outputFile));

            log.forEach((logItem: any) => {
                outputFile3.push({
                    "timestamp": new Date(logItem.timestamp).getTime(),
                    "type": (logItem.buy === 0) ? "Verkauf" : "Kauf",
                    "amount": logItem.amount,
                    "price": Math.floor(logItem.price / 10 ** 16) / 100,
                    "insider": (logItem.sessionID) ? logItem.insiderInformation  : 'Nein'
                })
            });
            fs.writeFileSync(path.join(__dirname, '../public/dispenser/' + company.tokenSymbol + 'SDText.json'), JSON.stringify(outputFile3));

            log.forEach((logItem: any) => {
                outputFile2.push({
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
            const newCSV = await convertToCSV(outputFile2);
            fs.writeFileSync(path.join(__dirname, '../public/dispenser/' + company.tokenSymbol + 'SD.csv'), newCSV);
        });
    })
}

module.exports = generateSDAll;



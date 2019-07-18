import { Company } from "../types/types";
import { EventLog } from "web3/types";

const db = require('../database/db');
const fs = require('fs');
const path = require('path');
const outputPath = '../public/log';
var Raven = require('raven');
const convertToCSV = require('../helpers/formatInsiderCSV').convertToCSV;

Raven.config('https://853db40d557b42189a6b178ba7428001@sentry.io/1470742').install();

async function generateSDAll() {
    // select * from SDTransactions left join insiderTrades on SDTransactions.txhash = insiderTrades.txHash
    const sql1 = `SELECT SDAddress, tokenSymbol FROM companies WHERE SDActive = 1;`;
    const companies = await db.query(sql1, []);
    //console.log(companies);
    companies.forEach(async (company: Company) => {
	//console.log(company.SDAddress);
        let outputFile: any = [];
        const sql2 = `select * from SDTransactions left join insiderTrades on SDTransactions.txhash = insiderTrades.txHash order by timestamp DESC;`;
        db.query(sql2, [company.SDAddress]).then((log: EventLog[]) => {
            log.forEach(async (logItem: any) => {
                outputFile.push({
                    "timestamp": new Date(logItem.timestamp).getTime(),
                    "type": (logItem.buy === 0) ? "Verkauf" : "Kauf",
                    "amount": logItem.amount,
                    "price": Math.floor(logItem.price/10**16)/100,
                    "insider": (logItem.sessionID) ? "https://api-dev.alethena.com/insider/static/" + logItem.sessionID + ".pdf" : 'Nein'
                })
        fs.writeFileSync(path.join(__dirname, '../public/' + company.tokenSymbol + '_SD.json'), JSON.stringify(outputFile));
        const newCSV = await convertToCSV(outputFile);
        fs.writeFileSync(path.join(__dirname, '../public/' + company.tokenSymbol + '_SD.csv'), newCSV);

            });
        });
        //fs.writeFileSync(path.join(__dirname, '../public/' + company.tokenSymbol + '_SD.json'), JSON.stringify(outputFile));
    })
}

module.exports.generateSDAll = generateSDAll;



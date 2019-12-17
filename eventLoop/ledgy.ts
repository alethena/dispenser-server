import { Company } from "../types/types";
import { EventLog } from "web3/types";

const db = require('../database/dbConnection');
const fs = require('fs');
const path = require('path');
const outputPath = '../public/log';

const Raven = require('raven');
Raven.config('https://859b08c222a44baf887d309907267edc@sentry.io/1860345').install();

async function generateLedgyLog() {
    const sql1 = `SELECT equityAddress, tokenSymbol FROM companies WHERE equityActive = 1;`;
    try {
        const companies = await db.query(sql1, []);

        companies.forEach(async (company: Company) => {
            let outputFile: any = [];
            const sql2 = `SELECT * FROM equityTransactions WHERE contractAddress = ? ORDER BY timestamp ASC;`;
            db.query(sql2, [company.equityAddress]).then((log: EventLog[]) => {
                log.forEach((logItem: any) => {
                    if (logItem.event === 'Transfer' && logItem.value != 0) {
                        outputFile.push({
                            "address": logItem.contractAddress,
                            "blockNumber": logItem.blockNumber,
                            "transactionHash": logItem.txHash,
                            "transactionIndex": logItem.transactionIndex,
                            "logIndex": logItem.logIndex,
                            "event": "Transfer",
                            "from": logItem.sender,
                            "to": logItem.receiver,
                            "value": logItem.value.toString(),
                            "timestamp": new Date(logItem.timestamp).getTime() / 1000
                        });
                    } else if (logItem.event === 'Mint') {
                        outputFile.push({
                            "address": logItem.contractAddress,
                            "blockNumber": logItem.blockNumber,
                            "transactionHash": logItem.txHash,
                            "transactionIndex": logItem.transactionIndex,
                            "logIndex": logItem.logIndex,
                            "event": "Mint",
                            "shareholder": logItem.shareholder,
                            "amount": logItem.amount.toString(),
                            "message": logItem.message,
                            "timestamp": new Date(logItem.timestamp).getTime() / 1000
                        });
                    }
                });
                fs.writeFileSync(path.join(__dirname, '../public/logs/' + company.tokenSymbol + '.json'), JSON.stringify(outputFile))
                // fs.writeFileSync(outputPath + company.tokenSymbol + '.json', JSON.stringify(outputFile));
                // console.log(outputFile);
            });
            return;
        });
    } catch (error) {
        Raven.captureException(error);
    }
}

module.exports = generateLedgyLog;
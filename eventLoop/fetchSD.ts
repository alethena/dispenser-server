import { Company } from "../types/types";
import { EventLog } from "web3/types";

const db = require('../database/db');
const async = require('async');
const fetchEvents = require('../web3/fetchEvents').fetchEvents;
const getLatestBlockNumber = require('../web3/getLatestBlockNumber').getLatestBlockNumber;
const stripLog = require('../helpers/stripSDLog').stripLog;
const SDABI = require('../abis/SDABI.json');
//Queries
var Raven = require('raven');
Raven.config('https://853db40d557b42189a6b178ba7428001@sentry.io/1470742').install();

async function fetchSD() {
    try {
        const sql1 = `SELECT SDAddress, SDLastBlock FROM companies WHERE SDActive = 1;`;
        var latestBlock = await getLatestBlockNumber();
        var companies = await db.query(sql1, []);

        companies.forEach(async (company: Company) => {
            const logs = await fetchEvents(SDABI, company.SDAddress, company.SDLastBlock);
            length = logs.length;
            async.each(logs.filter(isSDTransaction), function (logEntry: EventLog, callback:any) {
                stripLog(logEntry, company).then((dataToInsert: any) => {
                    console.log(dataToInsert);
                    callback;
                    db.query(sqlInsertTx, dataToInsert).then(callback);
                });
            }, async () => {
                await writeLastBlock(latestBlock, company.SDAddress);
                return
            });

        });
    } catch (error) {
        Raven.captureException(error);
    }
}

async function writeLastBlock(latestBlock: number, SDAddress: string) {
    const sqlLastBlock = `UPDATE companies SET SDLastBlock = ? WHERE SDAddress = ?;`;
    db.query(sqlLastBlock, [latestBlock, SDAddress]).then((answ: any) => {
        return true
    }, (err: Error) => {
        throw (err);
    });
}

const sqlInsertTx =
    `REPLACE INTO SDTransactions 
        (txHash,
        contractAddress,
        buy,
        sell,
        price,
        fee,
        lastPrice,
        user,
        amount,
        blockNumber,
        timestamp
        ) 
        VALUES(?,?,?,?,?,?,?,?,?,?,?);`;


function isSDTransaction(logEntry: EventLog) {
    return (logEntry.event === 'SharesPurchased' || logEntry.event === 'SharesSold');
}

module.exports = fetchSD;
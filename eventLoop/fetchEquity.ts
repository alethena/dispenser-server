import { EventLog, Callback } from 'web3/types';
import { Company } from '../types/types';
import { resolve } from 'dns';

const db = require('../database/dbConnection');
const fetchEvents = require('../web3/helpers/fetchevents').fetchEvents;
const blockNumberToTimestamp = require('../web3/helpers/blockNumberToTimestamp').blockNumberToTimestamp;
const getLatestBlockNumber = require('../web3/helpers/getLatestBlockNumber').getLatestBlockNumber;

const ALEQABI = require('../abis/ALEQ.json');
const async = require('async');
const stripLog = require('../helpers/stripEquityLog').stripLog;


// FIX 'data to insert type'

async function fetchEquity() {
    return new Promise(async (resolve, reject) => {
        const sql1 = `SELECT equityAddress, equityLastBlock FROM companies WHERE equityActive = 1;`;
        try {
            const latestBlock = await getLatestBlockNumber();
            let companies = await db.query(sql1, []);
            console.log(companies[0]);
            companies.forEach(async (company: Company) => {
                const logs = await fetchEvents(ALEQABI, company.equityAddress, company.equityLastBlock);
                async.each(logs.filter(isEquityEvent), function (logEntry: Event, callback: any) {
                    stripLog(logEntry, company).then((dataToInsert: any) => {
                        db.query(sqlInsertTx, dataToInsert).then(callback);
                    });
                }, () => {
                    writeLastBlock(latestBlock, company.equityAddress);
                    resolve();
                });
            });
        } catch (error) {
            console.log(error);
            reject(error);
        }
    })
}


function isEquityEvent(logEntry: EventLog): boolean {
    return (logEntry.event === 'Transfer' || logEntry.event === 'Mint')
}

async function writeLastBlock(latestBlock: number, equityAddress: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const sqlLastBlock = `UPDATE companies SET equityLastBlock = ? WHERE equityAddress = ?;`;
        db.query(sqlLastBlock, [latestBlock, equityAddress]).then((answ: any) => {
            resolve(true);
        }, (err: Error) => {
            reject(err);
        });
    })

}

const sqlInsertTx = `REPLACE INTO equityTransactions (txHash, event, contractAddress, timestamp, blockNumber, transactionIndex, logIndex, sender, receiver, value, shareholder, amount, message) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?);`;

module.exports = fetchEquity;
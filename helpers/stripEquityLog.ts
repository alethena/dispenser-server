import { Company } from "../types/types";

const blockNumberToTimestamp = require('../web3/helpers/blockNumberToTimestamp').blockNumberToTimestamp;

async function stripLog(logEntry: any, company: Company) {
    return new Promise(async (resolve, reject) => {
        try {
            const timestamp = await blockNumberToTimestamp(logEntry.blockNumber);
            // console.log(logEntry);
            if (logEntry.event === "Transfer") {
                resolve([
                    logEntry.transactionHash,
                    logEntry.event,
                    company.equityAddress,
                    timestamp,
                    logEntry.blockNumber,
                    logEntry.transactionIndex,
                    logEntry.logIndex,
                    logEntry.returnValues.from,
                    logEntry.returnValues.to,
                    Number(logEntry.returnValues.value.toString()),
                    logEntry.returnValues.shareholder,
                    logEntry.returnValues.amount,
                    logEntry.returnValues.message
                ]);
            } else {
                resolve([
                    logEntry.transactionHash,
                    logEntry.event,
                    company.equityAddress,
                    timestamp,
                    logEntry.blockNumber,
                    logEntry.transactionIndex,
                    logEntry.logIndex,
                    logEntry.returnValues.from,
                    logEntry.returnValues.to,
                    logEntry.returnValues.value,
                    logEntry.returnValues.shareholder,
                    Number(logEntry.returnValues.amount.toString()),
                    logEntry.returnValues.message
                ]);
            }

        } catch (error) {
            reject(error);
        }
    });
}

module.exports.stripLog = stripLog;

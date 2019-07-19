import { Company } from "../types/types";

const blockNumberToTimestamp = require('../web3/helpers/blockNumberToTimestamp').blockNumberToTimestamp;

async function stripLog(logEntry: any, company: Company) {
    return new Promise(async (resolve, reject) => {
        try {
            const timestamp = await blockNumberToTimestamp(logEntry.blockNumber);
            let user;
            let buy;
            let totalPrice;
            if (logEntry.event === "SharesPurchased") {
                user = logEntry.returnValues.buyer;
                buy = true;
                totalPrice = logEntry.returnValues.totalPrice;

            } else {
                user = logEntry.returnValues.seller;
                buy = false;
                totalPrice = logEntry.returnValues.buyBackPrice;
            }

            resolve([
                logEntry.transactionHash,
                company.SDAddress,
                buy,
                !buy,
                Number(totalPrice.toString()),
                0,
                Number(logEntry.returnValues.nextPrice.toString()),
                user,
                Number(logEntry.returnValues.amount.toString()),
                logEntry.blockNumber,
                timestamp
            ]);
        } catch (error) {
            reject(error);
        }
    });
}

module.exports.stripLog = stripLog;
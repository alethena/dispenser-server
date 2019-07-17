import { TransactionReceipt } from 'web3/types';

const web3 = require('../web3Connection').web3;

async function fetchTransactionReceipt(txHash: string): Promise<TransactionReceipt> {
    return new Promise(async function (resolve, reject) {
        try {
            const receipt = await web3.eth.getTransactionReceipt(txHash);
            resolve(receipt);
        } catch (error) {
            reject(error);
        }
    })
}

module.exports.fetchTransactionReceipt = fetchTransactionReceipt;
export { };

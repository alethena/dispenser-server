const web3 = require('../web3Connection').web3;

async function blockNumberToTimestamp(blockNumber: number): Promise<Date> {
    return new Promise(async function(resolve, reject) {
        try {
            const block = await web3.eth.getBlock(blockNumber);
            let timestamp = new Date (block.timestamp*1000);
            resolve(timestamp);
        } catch (error) {
            reject(error);
        }
    })
}

module.exports.blockNumberToTimestamp = blockNumberToTimestamp;
export {};
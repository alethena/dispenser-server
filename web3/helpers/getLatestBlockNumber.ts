
const web3 = require('./gethConnection').web3;

async function getLatestBlockNumber(): Promise<number> {
    return new Promise(async function (resolve, reject) {
        try {
            const block = await web3.eth.getBlock('latest');
            resolve(block.number);
        } catch (error) {
            reject(error);
        }
    })
}

module.exports.getLatestBlockNumber = getLatestBlockNumber;
export { };
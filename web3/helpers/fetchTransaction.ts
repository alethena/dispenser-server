const web3 = require('../web3Connection').web3;

async function fetchTransaction(txHash: string): Promise<any> {
    return new Promise(async function (resolve, reject) {
        try {
            const tx = await web3.eth.getTransaction(txHash);
            resolve(tx);
        } catch (error) {
            reject(error);
        }
    })
}

module.exports = fetchTransaction;

export { };

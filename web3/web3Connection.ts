const Web3 = require('web3');
const net = require('net');
const config = require('./web3Config');
var web3;


try {
    web3 = new Web3(
        new Web3.providers.IpcProvider(
            config.IpcPath,
            net
        )
    );

} catch (error) {
    console.log(error);
}

module.exports.web3 = web3;
import { Request, Response, NextFunction } from 'express';
import { XCHFBuyData, XCHFSellData, PaymentData } from '../types/types';
import { TransactionReceipt } from 'web3/types';

const fetchTransactionReceipt = require('../web3/helpers/fetchTransactionReceipt');

const express = require('express');
const router = express.Router();
const BN = require('bn.js');

const web3 = require('../web3/web3Connection').web3;
const contract = require('truffle-contract');

const SDABI = require('../abis/ShareDispenserRaw.json');
const SDAddress = '0x874f721dD3224491fe936B2a3779148Dcd95774E';

const CoinbasePW = require('../web3/web3Config').CoinbasePW;

/* POST a request to verify email address*/
router.post('/crypto/buy', async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    const buyData: XCHFBuyData = req.body;

    try {
        const receipt = await fetchTransactionReceipt(buyData.txhash);
        if (!receipt) {
            throw 'Approval transaction does not exist';
        }
        else if (receipt.status !== true) {
            // HERE WE COULD CHECK ADDITIONAL STUFF!!!!
            throw 'Approval transactiondid not succeed';
        }

        const SDAbstraction = await contract(SDABI);
        SDAbstraction.setProvider(web3.currentProvider);
        const SDInstance = await SDAbstraction.at(SDAddress);

        const coinbase = await web3.eth.getCoinbase();
        const unlocked = await web3.eth.personal.unlockAccount(coinbase, CoinbasePW, 10);

        SDInstance.buyShares.sendTransaction(
            receipt.from.toString(),
            new BN(buyData.numberofshares),
            { from: coinbase, gasPrice: 20 * 10 ** 9 }
        )
            .on('transactionHash', (hash: string) => {
                // HERE ANSWER WITH THE TX HASH
                res.json({ txHash: hash });
            })
            .on('receipt', (receipt: TransactionReceipt) => {
                // HERE SEND EMAIL!
            })
            .on('error', (error: Error) => {
                // SEND FAIL MAIL INCLUDE ETHERSCAN LINK IF APPROPRIATE
                
            });
    } catch (error) {
        res.json({ 'error': error.message })
    }

});

router.post('/crypto/sell', async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const buyData: XCHFSellData = req.body;
        let receipt = await fetchTransactionReceipt(buyData.txhash);

        // console.log('TRANSACTION RECEIPT FOR ALLOW ', receipt);

        if (receipt.status !== true) {
            // HERE WE COULD CHECK ADDITIONAL STUFF!!!!
            throw 'Tx does not exist or did not succeed';
        }

        const SDAbstraction = await contract(SDABI);
        SDAbstraction.setProvider(web3.currentProvider);
        const SDInstance = await SDAbstraction.at(SDAddress);

        const buyEnabled = await SDInstance.buyEnabled.call();
        console.log(buyEnabled);
        res.json({ message: 'All good in da hood!' });
    } catch (error) {
        res.status(500);
        res.json({ error: error });
    }
});

router.post('/fiat', async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const buyData: PaymentData = req.body;
        res.json({ message: 'All good in da hood!' });
    } catch (error) {
        res.status(500);
        res.json({ error: error });
    }
});

module.exports = router;

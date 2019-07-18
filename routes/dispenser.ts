import { Request, Response, NextFunction } from 'express';
import { XCHFBuyData, XCHFSellData, PaymentData } from '../types/types';

const fetchTransactionReceipt = require('../web3/helpers/fetchTransactionReceipt');

const express = require('express');
const router = express.Router();

const web3 = require('../web3/web3Connection').web3;
const contract = require('truffle-contract');

const SDABI = require('../abis/ShareDispenserRaw.json');
const SDAddress = '0x874f721dD3224491fe936B2a3779148Dcd95774E';

/* POST a request to verify email address*/
router.post('/crypto/buy', async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const buyData: XCHFBuyData = req.body;
        let receipt = await fetchTransactionReceipt(buyData.txhash);

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

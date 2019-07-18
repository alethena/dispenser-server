import { Request, Response, NextFunction } from 'express';
import { XCHFBuyData, XCHFSellData, PaymentData, XCHFPDFData, MailParams } from '../types/types';
import { TransactionReceipt } from 'web3/types';
const sendMail = require('../mailer/transporter');
const htmlToPDF= require('../mailer/generatePDF');
const path = require('path');

const ejs = require('ejs');

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
                res.json({ txHash: hash });
            })
            .on('receipt', async (receipt: any) => {
                // FIRST RENDER PDF
                const price = receipt.logs[0].args.totalPrice.toString();

                const PDFData: XCHFPDFData = {
                    'now': new Date(),
                    'type': 'Buy',
                    'etherscanLink': 'https://rinkeby.etherscan.io/tx/' + receipt.transactionHash,
                    'price': price,
                    'numberOfShares': buyData.numberofshares,
                    'walletAddress': receipt.from.toString(),
                    'emailAddress': 'b.rickenbacher@intergga.ch'
                };

                const renderedHtmlPDF = await ejs.renderFile(path.join(__dirname, '../mailer/templates/pdfTemplates/xchfBuyPDF/xchBuyPDF.ejs'), PDFData);
                const pdfFile = await htmlToPDF(renderedHtmlPDF);

                // THEN RENDER MAIL
                const renderedHtmlMail = await ejs.renderFile(path.join(__dirname, '../mailer/templates/mailTemplates/xchfBuy/xchfBuy.ejs'), {});

                // THEN SEND EMAIL!
                const mailParams: MailParams = {
                    'to': ['b.rickenbacher@intergga.ch'],
                    'subject': 'Your share transaction',
                    'html': renderedHtmlMail,
                    'attachments': [{'filename': 'ShareTransaction.pdf', 'content': pdfFile}]
                }
                await sendMail(mailParams);
            })
            .on('error', async (error: Error) => {
                console.log(error);
                const renderedHtmlMail = await ejs.renderFile(path.join(__dirname, '../mailer/templates/mailTemplates/transactionFail/transactionFail.ejs'), {});

                const mailParams: MailParams = {
                    'to': ['b.rickenbacher@intergga.ch'],
                    'subject': 'Your share transaction failed',
                    'html': renderedHtmlMail,
                }
                
                await sendMail(mailParams);
                
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

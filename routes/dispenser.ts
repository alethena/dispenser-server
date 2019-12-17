import { Request, Response, NextFunction } from 'express';
import { XCHFBuyData, XCHFSellData, PaymentData, XCHFPDFData, MailParams, EtherPDFData } from '../types/types';
import { TransactionReceipt } from 'web3/types';
const sendMail = require('../mailer/transporter');
const htmlToPDF = require('../mailer/generatePDF');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const updateTradeID = require('../database/insider/updateTradeID');
const generatePaymentReference = require('../helpers/referenceGenerator');

var cors = require('cors');


// const whitelist = ['https://dev.alethena.com'];
const whitelist = ['*'];

const corsOptions = {
    origin: function (origin: any, callback: any) {
        if (whitelist.indexOf(origin) !== -1 && origin) {
            callback(null, true)
        } else {
            // overriding cors block for now
            callback(null, true)
            // callback(new Error('Not allowed by CORS'))
        }
    }
}

const fetchTransactionReceipt = require('../web3/helpers/fetchTransactionReceipt');
const fetchTransaction = require('../web3/helpers/fetchTransaction');

const express = require('express');
const router = express.Router();
const BN = require('bn.js');

const web3 = require('../web3/web3Connection').web3;
const contract = require('truffle-contract');

const SDABI = require('../abis/ShareDispenserRaw.json');
const SDAddress = '0x6666f4aAc97c9a9d40Ef04f086805a6fB54de395';

const CoinbasePW = require('../web3/web3Config').CoinbasePW;

const Raven = require('raven');
Raven.config('https://859b08c222a44baf887d309907267edc@sentry.io/1860345').install();

/* POST a request to verify email address*/
router.post('/crypto/buy', cors(corsOptions), async function (
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
            throw 'Approval transaction did not succeed';
        }

        const SDAbstraction = await contract(SDABI);
        SDAbstraction.setProvider(web3.currentProvider);
        const SDInstance = await SDAbstraction.at(SDAddress);
        const user = receipt.from.toString();

        const coinbase = await web3.eth.getCoinbase();
        const unlocked = await web3.eth.personal.unlockAccount(coinbase, CoinbasePW, 1000);

        // console.log(receipt.from.toString(), buyData.numberofshares);
        SDInstance.buyShares.sendTransaction(
            receipt.from.toString(),
            new BN(buyData.numberofshares),
            { from: coinbase, gasPrice: 40 * 10 ** 9 }
        )
            .on('transactionHash', (hash: string) => {
                res.json({ txhash: hash });
            })
            .on('receipt', async (receipt: any) => {
                if (buyData.sessionid) {
                    try {
                        await updateTradeID(buyData.sessionid, receipt.transactionHash);
                    } catch (error) {
                        console.log(error);
                    }
                };

                // FIRST RENDER PDF
                const price = Math.ceil(receipt.logs[0].args.totalPrice / 10 ** 18);
                const etherscanLink = 'https://etherscan.io/tx/' + receipt.transactionHash;
                const now = new Date();

                const PDFData: XCHFPDFData = {
                    'now': now.toDateString(),
                    'type': 'Buy',
                    'etherscanLink': etherscanLink,
                    'price': price.toString(),
                    'numberOfShares': buyData.numberofshares,
                    'walletAddress': user,
                    'emailAddress': buyData.emailAddress
                };

                const renderedHtmlPDF = await ejs.renderFile(path.join(__dirname, '../mailer/templates/pdfTemplates/xchfBuyPDF/xchBuyPDF.ejs'), PDFData);
                const pdfFile = await htmlToPDF(renderedHtmlPDF);

                // THEN RENDER MAIL
                const style = fs.readFileSync(path.join(__dirname, '../mailer/templates/mailTemplates/overallCSS/basic.html'));

                const renderedHtmlMail = await ejs.renderFile(path.join(__dirname, '../mailer/templates/mailTemplates/xchfBuy/xchfBuy.ejs'), { 'style': style });

                // THEN SEND EMAIL!
                const mailParams: MailParams = {
                    'to': [buyData.emailAddress],
                    'subject': 'Your Share Transaction',
                    'html': renderedHtmlMail,
                    'attachments': [{ 'filename': 'ShareTransaction.pdf', 'content': pdfFile }]
                }
                await sendMail(mailParams);
            })
            .on('error', async (error: Error) => {
                Raven.captureException(error);
                console.log(error);
                const style = fs.readFileSync(path.join(__dirname, '../mailer/templates/mailTemplates/overallCSS/basic.html'));

                const renderedHtmlMail = await ejs.renderFile(path.join(__dirname, '../mailer/templates/mailTemplates/transactionFail/transactionFail.ejs'), { 'style': style });

                const mailParams: MailParams = {
                    'to': [buyData.emailAddress],
                    'subject': 'Your Share Transaction Failed',
                    'html': renderedHtmlMail,
                }

                await sendMail(mailParams);

            });
    } catch (error) {
        Raven.captureException(error);
        res.json({ 'error': 'An error occured, sorry!' })
    }

});

router.post('/crypto/sell', cors(corsOptions), async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    const sellData: XCHFSellData = req.body;
    console.log(sellData);
    try {
        const receipt = await fetchTransactionReceipt(sellData.txhash);
        if (!receipt) {
            throw 'Approval transaction does not exist';
        }
        else if (receipt.status !== true) {
            // HERE WE COULD CHECK ADDITIONAL STUFF!!!!
            throw 'Approval transactiondid not succeed';
        }
        const user = receipt.from.toString();

        const SDAbstraction = await contract(SDABI);
        SDAbstraction.setProvider(web3.currentProvider);
        const SDInstance = await SDAbstraction.at(SDAddress);

        const coinbase = await web3.eth.getCoinbase();
        const unlocked = await web3.eth.personal.unlockAccount(coinbase, CoinbasePW, 1000);
        console.log(sellData.pricelimit);
        SDInstance.sellShares.sendTransaction(
            receipt.from.toString(),
            new BN(sellData.numberofshares),
            new BN(sellData.pricelimit),
            { from: coinbase, gasPrice: 40 * 10 ** 9 }
        )
            .on('transactionHash', (hash: string) => {
                res.json({ txhash: hash });
            })
            .on('receipt', async (receipt: any) => {
                if (sellData.sessionid) {
                    try {
                        await updateTradeID(sellData.sessionid, receipt.transactionHash);
                    } catch (error) {
                        console.log(error);
                    }
                };

                // FIRST RENDER PDF
                const price = Math.floor(receipt.logs[0].args.buyBackPrice / 10 ** 18);
                const etherscanLink = 'https://etherscan.io/tx/' + receipt.transactionHash;
                const now = new Date();

                const PDFData: XCHFPDFData = {
                    'now': now.toDateString(),
                    'type': 'Sell',
                    'etherscanLink': etherscanLink,
                    'price': price.toString(),
                    'numberOfShares': sellData.numberofshares,
                    'walletAddress': user,
                    'emailAddress': sellData.emailAddress
                };

                const renderedHtmlPDF = await ejs.renderFile(path.join(__dirname, '../mailer/templates/pdfTemplates/xchfBuyPDF/xchBuyPDF.ejs'), PDFData);
                const pdfFile = await htmlToPDF(renderedHtmlPDF);

                // THEN RENDER MAIL
                const style = fs.readFileSync(path.join(__dirname, '../mailer/templates/mailTemplates/overallCSS/basic.html'));

                const renderedHtmlMail = await ejs.renderFile(path.join(__dirname, '../mailer/templates/mailTemplates/xchfBuy/xchfBuy.ejs'), { 'style': style });

                // THEN SEND EMAIL!
                const mailParams: MailParams = {
                    'to': [sellData.emailAddress],
                    'subject': 'Your Share Transaction',
                    'html': renderedHtmlMail,
                    'attachments': [{ 'filename': 'ShareTransaction.pdf', 'content': pdfFile }]
                }
                await sendMail(mailParams);
            })
            .on('error', async (error: Error) => {
                Raven.captureException(error);
                console.log(error);
                const style = fs.readFileSync(path.join(__dirname, '../mailer/templates/mailTemplates/overallCSS/basic.html'));

                const renderedHtmlMail = await ejs.renderFile(path.join(__dirname, '../mailer/templates/mailTemplates/transactionFail/transactionFail.ejs'), { 'style': style });

                const mailParams: MailParams = {
                    'to': [sellData.emailAddress],
                    'subject': 'Your Share Transaction Failed',
                    'html': renderedHtmlMail,
                }

                await sendMail(mailParams);

            });
    } catch (error) {
        Raven.captureException(error);
        res.json({ 'error': 'An error occured, sorry!' })
    }
});

router.post('/fiat/', cors(corsOptions), async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const requestData: PaymentData = req.body;
        const paymentReference = generatePaymentReference(requestData);

        const now = new Date();

        const PDFData: any = {
            'now': now.toDateString(),
            'type': 'Sell',
            'paymentReference': paymentReference,
            'price': requestData.price,
            'numberOfShares': requestData.numberOfShares,
            'walletAddress': requestData.walletAddress,
            'emailAddress': requestData.emailAddress
        };


        const renderedHtmlPDF = await ejs.renderFile(path.join(__dirname, '../mailer/templates/pdfTemplates/fiatBuyPDF/fiatBuyPDF.ejs'), PDFData);
        const pdfFile = await htmlToPDF(renderedHtmlPDF);
        fs.writeFileSync(path.join(__dirname, '../public/fiat/' + paymentReference + '.pdf'), pdfFile);

        const style = fs.readFileSync(path.join(__dirname, '../mailer/templates/mailTemplates/overallCSS/basic.html'));
        const renderedHtmlMail = await ejs.renderFile(path.join(__dirname, '../mailer/templates/mailTemplates/fiatBuy/fiatBuy.ejs'), { 'style': style });

        const mailParams: MailParams = {
            'to': [requestData.emailAddress],
            'subject': 'Your Share Purchase',
            'html': renderedHtmlMail,
            'attachments': [{ 'filename': 'Invoice.pdf', 'content': pdfFile }]
        }
        await sendMail(mailParams);

        res.contentType('application/json');
        res.send({
            "message": 'Trade registered',
            "paymentReference": paymentReference
        });

    } catch (error) {
        Raven.captureException(error);
        res.status(500);
        res.send({ 'error': 'An error occured, sorry!' })
    }

});

router.post('/ether/buy', cors(corsOptions), async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const buyData: XCHFBuyData = req.body;
        const receipt = await fetchTransactionReceipt(buyData.txhash);
        const txn = await fetchTransaction(buyData.txhash);
        const etherAmount = txn.value;
        if (!receipt) {
            throw 'Approval transaction does not exist';
        }
        else if (receipt.status !== true) {
            // HERE WE COULD CHECK ADDITIONAL STUFF!!!!
            throw 'Approval transactiondid not succeed';
        }

        // console.log(receipt.logs[0]);

        // FIRST RENDER PDF

        const price2 = new BN(web3.eth.abi.decodeParameter('uint256', receipt.logs[2].data));
        const xchfPrice = Math.ceil(web3.utils.fromWei(price2) * 100) / 100;
        const etherscanLink = 'https://etherscan.io/tx/' + buyData.txhash;
        const now = new Date();
        const etherPrice = Math.ceil(web3.utils.fromWei(etherAmount) * 100) / 100;

        const PDFData: EtherPDFData = {
            'now': now.toDateString(),
            'type': 'Buy',
            'etherscanLink': etherscanLink,
            'price': xchfPrice.toString(),
            'numberOfShares': buyData.numberofshares,
            'walletAddress': receipt.from.toString(),
            'emailAddress': buyData.emailAddress,
            'etherPrice': etherPrice.toString()
        };

        const renderedHtmlPDF = await ejs.renderFile(path.join(__dirname, '../mailer/templates/pdfTemplates/etherBuyPDF/etherBuyPDF.ejs'), PDFData);
        const pdfFile = await htmlToPDF(renderedHtmlPDF);

        // THEN RENDER MAIL
        const style = fs.readFileSync(path.join(__dirname, '../mailer/templates/mailTemplates/overallCSS/basic.html'));

        const renderedHtmlMail = await ejs.renderFile(path.join(__dirname, '../mailer/templates/mailTemplates/xchfBuy/xchfBuy.ejs'), { 'style': style });

        // THEN SEND EMAIL!
        const mailParams: MailParams = {
            'to': [buyData.emailAddress],
            'subject': 'Your Share Transaction',
            'html': renderedHtmlMail,
            'attachments': [{ 'filename': 'ShareTransaction.pdf', 'content': pdfFile }]
        }
        await sendMail(mailParams);

        res.json({ txhash: buyData.txhash });

    } catch (error) {
        console.log(error);
    }

});

module.exports = router;

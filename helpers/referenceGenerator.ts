const uuidv4 = require('uuid/v4');
const md5 = require('md5');
import { PaymentData } from '../types/types';


function generatePaymentReference(paymentData: PaymentData) {
    let preHash = 
    paymentData.numberOfShares.toString() +
    paymentData.buy +
    paymentData.sell +
    paymentData.insider +
    paymentData.emailAddress +
    paymentData.crypto +
    paymentData.price.toString() +
    paymentData.walletAddress

    return formatReference(md5(preHash + uuidv4()));
}

function formatReference(hashOutput: string) {
    let formatted = hashOutput.slice(0, 4);
    formatted += '-';
    formatted += hashOutput.slice(4, 8);
    formatted += '-';
    formatted += hashOutput.slice(8, 12);
    formatted += '-';
    formatted += hashOutput.slice(12, 16);
    return formatted.toUpperCase()
}

module.exports = generatePaymentReference;
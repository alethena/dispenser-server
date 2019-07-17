const nodeoutlook = require('nodejs-nodemailer-outlook');

const config = require('./config').mailConfig;

import { mailParams } from '../types/types';

async function sendMail(mailParams: mailParams) {
  return new Promise((resolve, reject) => {
    nodeoutlook.sendEmail({
      auth: config.auth,
      from: 'noreply@alethena.com',
      to: mailParams.to,
      subject: mailParams.subject,
      html: mailParams.html,
      attachments: mailParams.attachments,
      onError: (error: Error) => {
        reject(error);
      },
      onSuccess: (information: any) => {
        resolve(information);
      }
    });
  });
}

module.exports.sendMail = sendMail;
 
import { Request, Response, NextFunction } from "express";

const express = require('express');
const router = express.Router();

const cors = require('cors');

// const corsOptions = {
//     origin: 'https://dev.alethena.com',
//     optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// };

const db = require('../database/dbConnection');

router.get('/prices/:contractAddress', function (req: Request, res: Response, next: NextFunction) {
    const contract = req.params.contractAddress;
    const sqlQuery = `SELECT timestamp, lastPrice FROM SDTransactions WHERE contractAddress = ? ORDER BY timestamp ASC;`

    db.query(sqlQuery, [contract]).then((prices: any) => {
        if (prices[0] !== undefined) {
            let outputArray: any = [];
            outputArray.push([1568891535, 301]);
            prices.forEach((price: any) => {
                outputArray.push([new Date(price.timestamp).getTime(), price.lastPrice / 10 ** 18])
            });
            res.send(outputArray);
        } else {
            res.send([[1568891535000, 301]]);
            // res.status(400);
            // res.send('No data available')
        }
    });
});

module.exports = router;

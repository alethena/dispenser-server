import { Request, Response, NextFunction } from "express";

const express = require('express');
const router = express.Router();
const db = require('../database/dbConnection');


router.get('/prices/:contractAddress', function (req: Request, res: Response, next: NextFunction) {
    const contract = req.params.contractAddress;
    const sqlQuery = `SELECT timestamp, lastPrice FROM SDTransactions WHERE contractAddress = ? ORDER BY timestamp ASC;`

    db.query(sqlQuery, [contract]).then((prices: any) => {
        if (prices[0] !== undefined) {
            let outputArray: any = [];
            prices.forEach((price: any) => {
                outputArray.push([new Date(price.timestamp).getTime(), price.lastPrice / 10 ** 18])
            });
            res.send(outputArray);
        } else {
            res.status(400);
            res.send('Contract does not exist')
        }
    });
});

module.exports = router;

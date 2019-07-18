const db = require('./dbConnection');
import { MysqlError } from 'mysql';
import { InsiderTrade } from '../../types/types';

async function getTrades(): Promise<InsiderTrade[]> {
    const sql = `select * from insiderTrades`;
    return new Promise((resolve, reject) => {
        db.query(sql, []).then((res: any) => {
            resolve(res);
        }, (err: MysqlError) => {
            reject(err);
        })
    })
}

module.exports = getTrades;

main();
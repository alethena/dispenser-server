const db = require('./dbConnection');
import { MysqlError } from 'mysql';

async function updateTradeIDs(sessionID: string, txHash: string) {
    const sql = `update insiderTrades set txHash=? where sessionID=?;`;
    const values = [txHash, sessionID];
    return new Promise((resolve, reject) => {
        db.query(sql, values).then((res: any) => {
            resolve(res);
        }, (err: MysqlError) => {
            reject(err);
        })
    })
}

module.exports = updateTradeIDs;

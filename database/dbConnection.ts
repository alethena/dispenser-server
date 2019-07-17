import { MysqlError, FieldInfo } from "mysql";

const mysql = require('mysql');
const config = require('./dbConfig').config;

const pool = mysql.createPool(config.mysqlString);

module.exports = {
    query: (queryText: string, params: any[]) => {
        return new Promise((resolve, reject) => {
            pool.query(queryText, params, (err: MysqlError, results: any, fields: FieldInfo) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(results);
                };
            });
        })
    }
}
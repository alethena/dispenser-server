const schedule = require('node-schedule');
const fetchEquity = require('./fetchEquity');
const fetchSD = require('./fetchSD');
const ledgyLog = require('./ledgy');
const SDAll = require('./sdAll');

async function main() {
    var j = schedule.scheduleJob('*/1 * * * *', async function () {
        console.log(new Date());
        try {
            await fetchEquity();
        } catch (error) {
            console.log(error)
        }

        try {
            await fetchSD();
        } catch (error) {
            console.log(error)
        }
        // // await SDReport();

        try {
            await ledgyLog();
        } catch (error) {
            console.log(error)
        }

        try {
            await SDAll();
        } catch (error) {
            console.log(error)
        }

        // SD REPORT STILL MISSING !!!

    });
}

module.exports = main;
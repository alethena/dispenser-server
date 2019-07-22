const schedule = require('node-schedule');
const fetchEquity = require('./fetchEquity');
const fetchSD = require('./fetchSD');
const ledgyLog = require('./ledgy');
const SDAll = require('./sdAll');
const SDReport = require('./sdReport');

async function main() {
    var j = schedule.scheduleJob('*/1 * * * *', async function () {
        console.log(new Date());
        
        try {
            await Promise.all([fetchEquity(), fetchSD()]);
        } catch (error) {
            console.log(error)
        }

        try {
            await Promise.all([SDReport(), ledgyLog(), SDAll()])
        } catch (error) {
            console.log(error)
        }

    });
}

module.exports = main;

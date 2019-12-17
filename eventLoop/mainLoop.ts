const schedule = require('node-schedule');
const fetchEquity = require('./fetchEquity');
const fetchSD = require('./fetchSD');
const ledgyLog = require('./ledgy');
const SDAll = require('./sdAll');
const SDReport = require('./sdReport');

const Raven = require('raven');
Raven.config('https://859b08c222a44baf887d309907267edc@sentry.io/1860345').install();

async function main() {
    var j = schedule.scheduleJob('*/1 * * * *', async function () {
        console.log(new Date(), 'Started');

        try {
	//   await fetchEquity();
          await Promise.all([fetchEquity(), fetchSD()]);
          console.log('Done');
        } catch (error) {
            Raven.captureException(error);
        }

        try {
          await Promise.all([SDReport(), ledgyLog(), SDAll()])
        } catch (error) {
            Raven.captureException(error);
        }

    });
}

module.exports = main;

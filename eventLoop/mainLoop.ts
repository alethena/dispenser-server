const schedule = require('node-schedule');
const fetchEquity = require('./fetchEquity');
const fetchSD = require('./fetchSD');
const ledgyLog = require('./ledgy');
const SDAll = require('./sdAll');
const SDReport = require('./sdReport');

const Raven = require('raven');
Raven.config('https://c62c738ee3954263a16c3f53af05a4e8@sentry.io/1510309').install();

async function main() {
    var j = schedule.scheduleJob('*/1 * * * *', async function () {
        console.log(new Date());

        try {
	  await fetchEquity();
          await Promise.all([fetchEquity(), fetchSD()]);
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

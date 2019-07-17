const schedule = require('node-schedule');

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
        // await SDReport();

        try {
            await generateLedgyLog();
        } catch (error) {
            console.log(error)
        }

        try {
            await generateSDAll();
        } catch (error) {
            console.log(error)
        }

    });
}
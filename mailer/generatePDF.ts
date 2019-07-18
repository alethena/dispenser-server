const puppeteer = require('puppeteer');

async function htmlToPDF(renderedHtml: string) {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
            const page = await browser.newPage();

            await page.setContent(renderedHtml);
            await page.emulateMedia('screen');

            let pdfOutput = await page.pdf({
                format: 'A4',
                printBackground: true
            });
            await browser.close();
            resolve(pdfOutput);

        } catch (error) {
            reject(error);
        }
    })

}

module.exports = htmlToPDF;

export { };

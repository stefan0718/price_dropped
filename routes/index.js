const router = require('express').Router();
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const url_coles = 'https://shop.coles.com.au/a/alexandria/everything/search/';

// function writeHtml(html) {
//     const fs = require('fs');
//     fs.writeFile('test.html', html, err => {
//         if (err) throw err;
//         console.log('Saved!');
//     });
// }

router.get('/', (req, res) => {
    res.render('main', {title: 'Compare and Get the Lowest Price'});
});

router.post('/', (req, res) => {
    (async () => {
        const browser = await puppeteer.launch();
        const page_coles = await browser.newPage();
        await page_coles.setUserAgent(req.body.userAgent);
        await page_coles.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
        });
        await page_coles.goto(url_coles + req.body.query);
        // wait until page full loaded
        await page_coles.waitForNavigation({
            waitUntil: 'networkidle0',
        });
        const metadata = await page_coles.evaluate(() => {
            const results = {};
            document.querySelectorAll('span.product-name').forEach((item, i) => {
                results[i] = { 'ProductName': item.innerText };
            });
            return results;
        });
        console.log(metadata);
        res.send(metadata);
        await browser.close();
    })();
});

module.exports = router;


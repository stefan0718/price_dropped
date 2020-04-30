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
    // (async () => {
    //     const browser = await puppeteer.launch();
    //     const page_coles = await browser.newPage();
    //     await page_coles.setUserAgent(req.body.userAgent);
    //     await page_coles.evaluateOnNewDocument(() => {
    //         Object.defineProperty(navigator, 'webdriver', {
    //             get: () => undefined,
    //         });
    //     });
    //     await page_coles.goto(url_coles + req.body.query);
    //     // wait until page full loaded
    //     await page_coles.waitForNavigation({
    //         waitUntil: 'networkidle0',
    //     });
    //     const metadata = await page_coles.evaluate(() => {
    //         const results = {};
    //         results['fromColes'] = [];
    //         const itemMain = document.querySelectorAll('header.product-header');
    //         itemMain.forEach((item, i) => {
    //             results['fromColes'].push({
    //                 "itemSKU": item.querySelector('h3.product-title').getAttribute('data-partnumber'),
    //                 "itemImage": item.querySelector('a.product-image-link img').getAttribute('src'),
    //                 "itemBrand": item.querySelector('span.product-brand').innerText,
    //                 "itemName": item.querySelector('span.product-name').innerText,
    //                 "itemDollar": parseInt(item.querySelector('span.dollar-value').innerText),
    //                 "itemCent": parseFloat(item.querySelector('span.cent-value').innerText),
    //                 "itemSize": item.querySelector('span.package-size').innerText,
    //                 "itemPackagePrice": item.querySelector('span.package-price').innerText,
    //                 "itemPromoQty": (item.querySelector('.icon-discount') !== null) ? parseInt(item.querySelector('span.promo-txt-line1').innerText.charAt(0)) : 0,
    //                 "itemPromoPrice": (item.querySelector('.icon-discount') !== null) ? parseFloat(item.querySelector('span.promo-txt-line2').innerText.replace('$', '')) : 0,
    //                 "itemSaving": (item.querySelector('span.saving-container') !== null) ? parseFloat(item.querySelector('.product-save-value').innerText.replace('$', '')) : 0
    //             });
    //         });
    //         return results;
    //     });
    //     res.send(metadata);
    //     await browser.close();
    // })();

    const fs = require('fs');
    fs.readFile('fromColes.json', 'utf-8', (err, data) => {
        if (err) throw err;
        res.send(JSON.parse(data));
    });
});

module.exports = router;
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
        const metadata = {};
        try {
            const fromColes = await page_coles.evaluate(() => {
                const results = [];
                const itemMain = document.querySelectorAll('header.product-header');
                for (let i = 0; i < itemMain.length; i++){
                    if (itemMain[i].querySelector('span.dollar-value') === null) continue; // product unavailable
                    results.push({
                        "itemSKU": itemMain[i].querySelector('h3.product-title').getAttribute('data-partnumber'),
                        "itemImage": itemMain[i].querySelector('a.product-image-link img').getAttribute('src'),
                        "itemBrand": itemMain[i].querySelector('span.product-brand').innerText,
                        "itemName": itemMain[i].querySelector('span.product-name').innerText,
                        "itemDollar": parseInt(itemMain[i].querySelector('span.dollar-value').innerText),
                        "itemCent": parseFloat(itemMain[i].querySelector('span.cent-value').innerText),
                        "itemSize": itemMain[i].querySelector('span.package-size').innerText,
                        "itemPackagePrice": itemMain[i].querySelector('span.package-price').innerText,
                        "itemPromoQty": (itemMain[i].querySelector('.icon-discount') !== null) ? parseInt(itemMain[i].querySelector('span.promo-txt-line1').innerText.charAt(0)) : 0,
                        "itemPromoPrice": (itemMain[i].querySelector('.icon-discount') !== null) ? parseFloat(itemMain[i].querySelector('span.promo-txt-line2').innerText.replace('$', '')) : 0,
                        "itemSaving": (itemMain[i].querySelector('span.saving-container') !== null) ? parseFloat(itemMain[i].querySelector('.product-save-value').innerText.replace('$', '')) : 0
                    });
                }
                return results;
            });
            metadata.fromColes = fromColes;
        }
        catch (e) { console.log(e); }
        res.send(metadata);
        await browser.close();
    })();

    // const fs = require('fs');
    // fs.readFile('fromColes.json', 'utf-8', (err, data) => {
    //     if (err) throw err;
    //     res.send(JSON.parse(data));
    // });
});

module.exports = router;
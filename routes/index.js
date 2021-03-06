const router = require('express').Router();
const puppeteer = require('puppeteer');
const urlColes = 'https://shop.coles.com.au/online/COLRSSearchDisplay?storeId=20503&catalogId=37101&tabType=everything&searchTerm=';

router.get('/', (req, res) => {
    res.render('main');
});

router.post('/search', (req, res) => {
    (async () => {
        const browser = await puppeteer.launch({args: ['--no-sandbox']});
        const page_coles = await browser.newPage();
        await page_coles.setUserAgent(req.body.userAgent);
        await page_coles.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
        });
        await page_coles.goto(urlColes + req.body.query);
        // wait until page full loaded
        await page_coles.waitForNavigation({
            waitUntil: 'networkidle0',
        });
        const metadata = {};
        try {
            const fromColes = await page_coles.evaluate(() => {
                const result = document.querySelector("div[data-colrs-bind='colrsCatalogEntryListWidget_Data_2_3074457345618260154_3074457345618264559']").innerHTML;
                return JSON.parse(result).products;
            });
            metadata.fromColes = fromColes;
        }
        catch (e) { console.log(e); }
        res.send(metadata);
        await browser.close();
    })();
});

router.get('/about', (req, res) => {
    res.render('about');
});

router.get('/contact', (req, res) => {
    res.render('contact');
});

router.get('/featured', (req, res) => {
    res.render('featured');
});

module.exports = router;
const router = require('express').Router();
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const url_coles = "https://shop.coles.com.au/a/alexandria/everything/search/";
const coles_cookie = '__utma=179916539.713185499.1586391230.1586391230.1586391230.1; WC_PERSISTENT=GFQE%2B4nYy66N4u9BLp%2Fkgd%2FON9M%3D%0A%3B2020-04-09+11%3A07%3A08.963_1586391610805-22858_20503; UID=-1002|20503|null|G; sqshowmaintenance.772312=MVDuE4YXvLlzjS2odNY0; WC_SESSION_ESTABLISHED=true; AMCV_0B3D037254C7DE490A4C98A6%40AdobeOrg=1585540135%7CMCIDTS%7C18366%7CMCMID%7C06182394341834867310530185453848009328%7CMCAAMLH-1587448204%7C8%7CMCAAMB-1587448204%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1586850604s%7CNONE%7CMCAID%7C2BEB3A35052C355E-400000C1C000B7BE%7CvVersion%7C4.4.0; mk_asd=85f5953f-f08d-4a2e-31f9-c65d36dc790a;';
const user_agent = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Mobile Safari/537.36';

// function writeHtml(html) {
//     const fs = require('fs');
//     fs.writeFile('book.html', html, err => {
//         if (err) throw err;
//         console.log('Saved!');
//     });
// }

function processSearch(url, element, callback) {
    puppeteer.launch().then(browser => {
        return browser.newPage();
    }).then(page => {
        //only shops.coles.com.au needs cookie
        if (url.includes(url_coles)){
            page.setExtraHTTPHeaders({ 
                cookie: coles_cookie,
                'User-Agent': user_agent
            });
        }
        return page.goto(url).then(() =>{
            return page.content();
        });
    }).then(html => {
        const $ = cheerio.load(html);
        const metadata = {};
        $(element).each((i, elem) => {
            metadata[i] = { productName: $(elem).text() };
        });
        callback(metadata);
    }).catch(err => {
        console.log(err);
    });
}

router.get('/', (req, res) => {
    res.render('main', {title: "Compare and Get the Lowest Price"});
});

router.post('/', (req, res) => {
    processSearch(url_coles + req.body.query.trim(), 'span.product-name', data => {
        console.log(data);
        res.render('main', {title: "Compare and Get the Lowest Price", data: JSON.stringify(data)});
    });
});

module.exports = router;


const express = require('express');

const router = express.Router();
const requestp = require('request-promise');
const $ = require('cheerio');

const url_coles = "https://shop.coles.com.au/a/alexandria/everything/search/";

router.get('/', (req, res) => {
    res.render('main', {title: "Compare and Get the Lowest Price"});
});

router.post('/', (req, res) => {
    console.log(req.body);
    //rp(url_coles + req)
    res.render('main', {title: "Compare and Get the Lowest Price"})
});

module.exports = router;


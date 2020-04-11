const express = require('express');
const routes = require('./routes/index');
const bodyparser = require('body-parser');

const app = express();

app.set('view engine', 'pug');
app.use(bodyparser.urlencoded({extended: true}));
app.use('/', routes);
app.use(express.static('css'));

const server = app.listen(7180, () => {
    console.log(`Server is running on port ${server.address().port}`);
})
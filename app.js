const express = require('express');
const app = express();
const bodyparser = require('body-parser');

app.set('view engine', 'pug');
app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static('public'));

app.use('/', require('./routes/index'));

const server = app.listen(7180, () => {
    console.log(`Server is running on port ${server.address().port}`);
})
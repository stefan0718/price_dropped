const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const PORT = process.env.PORT || 3000;

app.set('view engine', 'pug');
app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static('public'));

app.use('/', require('./routes/index'));

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${server.address().port}`);
})
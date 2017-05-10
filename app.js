'use strict';

const express = require('express'); // app server
const bodyParser = require('body-parser'); // parser for post requests

const app = express();

// Bootstrap application settings
app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit: 50000}));

app.get('/upload', (req, res) => {
    res.send('In Upload');
});


module.exports = app;

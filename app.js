'use strict';

const express = require('express'); // app server
const bodyParser = require('body-parser'); // parser for post requests
const multer  = require('multer');
const upload = require('./lib/doc_upload');

const app = express();

const fs = require('fs');
const dir = './discoveryUploads';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

const multerUpload = multer({ dest: 'discoveryUploads/' });

// Bootstrap application settings
app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit: 50000}));

app.post('/upload',  multerUpload.single('file'), upload.uploadToDiscovery);


module.exports = app;

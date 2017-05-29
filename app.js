'use strict';

const express = require('express'); // app server
const bodyParser = require('body-parser'); // parser for post requests
const cors = require('cors')
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
app.use(cors());
app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit: 50000}));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.post('/upload',  multerUpload.single('file'), upload.uploadToDiscovery);
app.get('/appList', upload.getAppList);


module.exports = app;

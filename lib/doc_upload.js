/**
 * Created by iSmile on 5/10/2017.
 */
'use strict';
const config = require('./../config/config');
const nodeUtil = require('util');
const rp = require('request-promise');
const fs = require('fs');
const mammoth = require('mammoth');
const striptags = require('striptags');
const cloudant = require('ihelp').cloudant;
const uuidV1 = require('uuid/v1');


/*
 * This method adds documents to Watson Discovery Collection
 *
 * @method - POST
 * @sample-paylod:
 *   {
 *       file: {ReaderStream} The document which needs to the added to discovery collection
 *   }
 * */
//TODO: Need to handle more error cases
const uploadToDiscovery = (req, res) => {
    console.log(req.file);
    console.log(req.body);
    var appName = req.body.appName;
    var sectionName = req.body.sectionName;
    var isNewApp = req.body.isNewApp;
    var tmp_path = req.file.path;
    var filename = req.file.originalname;
    // The original name of the uploaded file stored in the variable "originalname".
    var target_path = tmp_path + '-' + req.file.originalname;
    var src = fs.createReadStream(tmp_path);
    src.pipe(fs.createWriteStream(target_path));
    src.on('end', (() => {
        fs.unlinkSync(tmp_path);
        mammoth.convertToHtml({path: target_path})
            .then((result) => {
                fs.unlinkSync(target_path);
                let listOfSplitDocs = docSplitter(result.value, appName);
                var current = Promise.resolve();
                Promise.all(listOfSplitDocs.map(function (doc) {
                    current = current.then(() => pushToDiscovery(doc))
                        .then(result => Promise.resolve(result));
                    return current;
                })).then(function (results) {
                    console.log('OH YESSSS', results);
                    res.status(200).json(results);
                });
            })
            .done();
    }));
    src.on('error', ((err) => {
        console.log(`pipe error :::: ${err}`);
        res.status(400).json({success: false})
    }));

};


const docSplitter = (doc, appName) => {
    let h1s = doc.split('<h1>');
    let splitDocArray = [];
    console.log(h1s.length > 0);
    if (h1s.length > 0) {
        h1s.forEach(section => {
            let array = section.split('</h1>');
            if (array.length > 1) {
                splitDocArray.push({
                    "Item Name": striptags(array[0].trim()),
                    "Documentation with HTML": array[1],
                    "Documentation": striptags(array[1], [], ' '),
                    "metadata": {
                        "applicationName": appName
                    }
                });
            } else {
                return;
            }
        });
        return splitDocArray;
    }
};


const pushToDiscovery = file => {
    return new Promise((resolve, reject) => {
        console.log(`pushToDiscovery :::::::::::::::::: ${file}`);
        const writerStream = fs.createWriteStream('discoveryUploads/' + file["Item Name"] + '.json');
        writerStream.write(JSON.stringify(file, 0, 2), 'UTF8');
        writerStream.end();
        writerStream.on('finish', function () {
            rp({
                method: 'POST',
                url: nodeUtil.format(config.watsonDiscovery.updateDocUrl, config.watsonDiscovery.environment_id, config.watsonDiscovery.collection_id, uuidV1()),
                headers: {
                    authorization: 'Basic ' + config.watsonDiscovery.auth,
                    'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
                },
                formData: {
                    file: {
                        value: fs.createReadStream('discoveryUploads/' + file["Item Name"] + '.json'),
                        options: {
                            filename: file["Item Name"] + '.json',
                            contentType: null
                        }
                    }
                }
            }).then(data => {
                fs.unlinkSync('discoveryUploads/' + file["Item Name"] + '.json');
                console.log(`respnse from Discovery :::: ${data}`);
                resolve({success: true, data: data})
            }).catch(err => {
                fs.unlinkSync('discoveryUploads/' + file["Item Name"] + '.json');
                console.log(`error from Discovery :::: ${err}`);
                resolve({success: false, error: err})
            });

        });
        writerStream.on('error', function (err) {
            console.log(`write stream error :::: ${err}`);
            resolve({success: false, error: err});
        });
    })

};

//TODO: Need to decide what to do with the return, should we return or just console log
const updateAppList = appName => {
    return cloudant.searchBySelector('discovery-collection', {appName: 'list_of_application'})
        .then(doc => {
            let appList = doc[0].appList;
            let _id = doc[0]._id;
            let _rev = doc[0]._rev;
            if (!appList.includes(appName)) {
                appList.push(appName);
                return cloudant.createDoc('discovery-collection', {
                    _id: _id,
                    _rev: _rev,
                    appName: 'list_of_application',
                    appList: appList
                })
            } else {
                return Promise.resolve();
            }
        })
        .then(data => Promise.resolve(data))
        .catch(err => Promise.reject(err))
};


module.exports = {
    uploadToDiscovery: uploadToDiscovery,
    updateAppList: updateAppList
};
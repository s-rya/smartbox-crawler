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
const uploadToDiscovery = (req, res, next) => {
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
                let listOfSplitDocs = docSplitter(result.value, appName, filename);
                console.log('listOfSplitDocs length ::::', listOfSplitDocs.length);
                var current = Promise.resolve();
                Promise.all(listOfSplitDocs.map(function (doc) {
                    current = current.then(() => pushToDiscovery(doc))
                        .then(result => Promise.resolve(result));
                    return current;
                })).then(function (results) {
                    console.log('OH YESSSS', results);
                    return updateAppList(appName);
                }).then(cloudantData => {
                    res.status(200).json({
                        success: true
                    });
                    next();
                }).catch(err => {
                    res.status(200).json({
                        success: false
                    });
                    next();
                });
            })
            .done();
    }));
    src.on('error', ((err) => {
        console.log(`pipe error :::: ${err}`);
        res.status(400).json({success: false});
        next();
    }));

};

//TODO: What needs to be done if there are no H1 headers in the document
const docSplitter = (doc, appName, filename) => {
    let h1s = doc.split('<h1>');
    let h2s = doc.split('<h2>');
    let splitDocArray = [];
    console.log(h1s.length > 0);
    if (h1s.length > 1) {
        console.log('##################3');
        h1s.forEach(section => {
            let array = section.split('</h1>');
            if (array.length > 1) {
                let innerContent = array[1];
                let head2 = innerContent.split('<h2>');
                if (head2.length > 1) {
                    console.log('22222222222222Heading');
                    head2.forEach(section => {
                        let array = section.split('</h2>');
                        if (array.length > 1) {
                            console.log(`Heading 2 :::: ${array[0].trim()}`);
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
                } else {
                    console.log(`Heading 1 :::: ${array[0].trim()}`);
                    splitDocArray.push({
                        "Item Name": striptags(array[0].trim()),
                        "Documentation with HTML": array[1],
                        "Documentation": striptags(array[1], [], ' '),
                        "metadata": {
                            "applicationName": appName
                        }
                    });
                }
            } else {
                return;
            }
        });
        return splitDocArray;
    } else if (h2s.length > 1) {
        console.log('2222222222222222222222222222222');
        h2s.forEach(section => {
            let array = section.split('</h2>');
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
    } else {
        console.log('3333333333333333333333333333333333');
        splitDocArray.push({
            "Item Name": filename.split('.')[0],
            "Documentation with HTML": doc,
            "Documentation": striptags(doc, [], ' '),
            "metadata": {
                "applicationName": appName
            }
        });
        return splitDocArray;
    }
};


const pushToDiscovery = file => {
    return new Promise((resolve, reject) => {
        console.log(`pushToDiscovery :::::::::::::::::: ${file}`);
        const writerStream = fs.createWriteStream('discoveryUploads/' + file["Item Name"].replace(/\//g, " or ").replace(/[":*?<>|]/g, '') + '.json');
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
                        value: fs.createReadStream('discoveryUploads/' + file["Item Name"].replace(/\//g, " or ").replace(/[":*?<>|]/g, '') + '.json'),
                        options: {
                            filename: file["Item Name"] + '.json',
                            contentType: null
                        }
                    }
                }
            }).then(data => {
                fs.unlinkSync('discoveryUploads/' + file["Item Name"].replace(/\//g, " or ").replace(/[":*?<>|]/g, '') + '.json');
                console.log(`respnse from Discovery :::: ${data}`);
                resolve({success: true, data: data})
            }).catch(err => {
                fs.unlinkSync('discoveryUploads/' + file["Item Name"].replace(/\//g, " or ").replace(/[":*?<>|]/g, '') + '.json');
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
            let nameArray = [];
            appList.forEach(app => {
                nameArray.push(app.name.toLowerCase());
            });
            if (!nameArray.includes(appName.toLowerCase())) {
                appList.push({
                    name: appName,
                    shortName: appName.toLowerCase()
                });
                return cloudant.createDoc('discovery-collection', doc[0])
            } else {
                return Promise.resolve();
            }
        })
        .then(data => {
            if (data) {
                return addNewAppNameEntity({
                    value: appName,
                    synonyms: [appName.toLowerCase()]
                });
            } else {
                return Promise.resolve(data)
            }
        })
        .catch(err => Promise.reject(err))
};

/*
 * This method adds new Value in the app-name entity.
 *
 * @METHOD: POST
 * @payload: {Object}
 * @sample-paylod:
 * {
 *   "value" : "Honda MDM" //The value of the entity to be created
 *   "synonyms" : ["mdm"] //Synonyms for the value mentioned above
 * }
 * */
const addNewAppNameEntity = entityValue => {
    console.log('********* Inside addNewAppNameEntity *********');
    return rp({
        method: 'POST',
        url: config.watsonCoversation.url + `/v1/workspaces/${config.watsonCoversation.workspaceId}/entities/app-name/values?version=${config.watsonCoversation.version_date}`,
        headers: {
            authorization: `Basic ${config.watsonCoversation.authToken}`,
            'content-type': 'application/json'
        },
        body: JSON.stringify(entityValue)
    }).then(data => Promise.resolve()).catch(err => Promise.resolve());
};

const getAppList = (req, res, next) => {
    let appList = '';
    cloudant.searchBySelector('discovery-collection', {appName: 'list_of_application'})
        .then(doc => {
            appList = doc[0].appList;
            res.status(200).json(appList);
            next();
        })
        .catch(err => {
            res.send(200).json(appList);
            next();
        })
};

module.exports = {
    uploadToDiscovery: uploadToDiscovery,
    updateAppList: updateAppList,
    getAppList: getAppList
};
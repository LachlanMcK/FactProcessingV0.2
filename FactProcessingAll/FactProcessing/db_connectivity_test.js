myLog.info('In db_connectivity_test.js')
var mongoClient = require('mongodb');

fs = require('fs');
const ca = [fs.readFileSync('C:/Users/vacan/OneDrive/Work/factProcessing-Jan2020/FactProcessingAll/FactProcessing/rds-combined-ca-bundle.pem')];
myLog.debug('ca is: ');
myLog.debug(ca);

var MongoClient = require('mongodb').MongoClient;
//var client = MongoClient.connect(process.env.DB,
//    { ssl: true, sslCA: ca },

const cs = process.env.DB
var client = MongoClient.connect(cs,
    function (err, client) {
        myLog.debug('In connect callback function');
        if (err)
            throw err;

        db = client.db('FactsV1');

        myLog.debug('db is:');
        myLog.debug(db);

        col = db.collection('forms');

        myLog.debug('collection is:');
        myLog.debug(col);

        myLog.debug('About to try to insert document');
        col.insertOne({
            'ClientInternalId': 88888888,
            'FormType': 'myFT6',
            'TransactionId': 987654321
        }, function (err, result) {

            myLog.debug('In insert call back function');
            if (err)
                throw err;

            myLog.debug('Resule is: ' + result);
            col.findOne({ 'TransactionId': 987654321 }, function (err, result) {
                myLog.debug('In find call back function');
                if (err)
                    throw err;

                myLog.debug('found it' + result);
                col.deleteOne({ 'TransactionId': 987654321 }, function (err, result) {
                    myLog.debug('In remove call back function');
                    if (err)
                        throw err;
    
                    myLog.debug('Deleted it' + result);
                    myLog.info('Connectivity good.');
                })
            })
        })
    })
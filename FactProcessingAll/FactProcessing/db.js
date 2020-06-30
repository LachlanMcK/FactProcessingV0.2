myLog.debug("in db.js");

//Architectural Decision:
//  This PoC is implemented using MongoDB.  Currently using mongoose to abstract some aspects of mongo; haven't yet decided if it brings enought to the solution to justify.  May also want to investigate Typegoose.
const mongoose = require('mongoose');

myLog.debug('Database provider is: ' + process.env.DBProvider);
myLog.debug('about to connect to ' + process.env.DB);


//Architectural Decision:
//  This PoC doesn't really if it is a 'real' Mongo implementation or an emulated one like AWS DocumentDB/ CosmosDB.  
//
//  The main differences between real mongo (local or cloud - Atlas) and AWS DocumentDB is 
//  -   AWS DocumentDB has no external endpoints outside of its VPC.  This means:
//      ** Lambda functions have to have permission to talk to the VPC DocumentDB is in.
//      ** Cant run RoboDB/ MongoShell locally, have to have an EC2 instance inside the VPC to run MongoShell.  So far this is a major pain as ATO Winner network doesn't allow SSH connections to EC2 instances.

//Architectural Decision:
//  At the moment I'm hosting both the product level "Payroll" microservice and the building-block level "Fact Processing" microservice in the same Lambda function.  This smells a little monolithic (old habits die hard?).
//  This means that they would share the same mongo connection string.  This is probably bad.  I don't think it automatically means they are breaking encapsulation, but it does mean encapsulation isn't 
//  being enforced by the database.
//  At the moment the Payroll microservice has no database.  So it is a moot point; hence haven't made the effort to separate.

if (process.env.DBProvider == 'TestDB') {
    require('./db_connectivity_test');
}

if (process.env.DBProvider == 'DocDB') {

    //Connecting to AWS DocumentDB via TLS requires this 'pem' file.  Presumably if connected to Atlas via TLS would need to do similar with their 'pem' file.  So far avoided that headace for non-AWS solutions.
    const fs = require('fs');
    const ca=[fs.readFileSync("rds-combined-ca-bundle.pem")]; 
    //myLog.debug('caBundle is:' + ca);
    mongoose.connect(process.env.DB, { useMongoClient: true, ssl: true, sslCA: ca });
} else {
    const options = {
        connectTimeoutMS: 5000, 
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 60000, // Close sockets after 60 seconds of inactivity
        useMongoClient: true
      };
    mongoose.connect(process.env.DB, options);
}
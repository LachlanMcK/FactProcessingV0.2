myLog=require("../myLog");
myLog.debug('In server.js, dir:' + __dirname + ", " + module.path);

const dotenv = require('dotenv');

dotenv.config({ path: './FactProcessingAll/FactProcessing/.env' });

myLog.info("Hi there");
myLog.debug('Environment variables:');
myLog.debug('\tDBProvider: ' + process.env.DBProvider);
myLog.debug('\tDB: ' + process.env.DB);
myLog.debug('\truntimeEnvironment: ' + process.env.runtimeEnvironment);
myLog.debug('\tmockAuthnModule: ' + process.env.mockAuthnModule);
myLog.debug('\tmockAuthzModule: ' + process.env.mockAuthzModule);

if (!process.env.DB) throw ("!!!Failed as missing connection string!!!");

var app = require('./app');
var port = process.env.PORT || 3000;
var ip = process.env.IP || "unknown IP";

myLog.debug('Connection string: ' + process.env.DB);
var server = app.listen(port, function() {
  myLog.info('Express server listening on port ' + ip + ":" + port);
});

module.exports = app  //added this for serverless
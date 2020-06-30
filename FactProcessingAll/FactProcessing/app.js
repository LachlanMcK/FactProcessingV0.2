myLog=require("../myLog");
myLog.debug("in app from 24 Jan 2020.js");//LM
//LM fudge assumed globals until get the windows dependency removed
const { addMissingBrowserStuff } = require("./addMissingBrowserStuff");
addMissingBrowserStuff();

//Architectural Decision:
//  Why use express?  Isn't it an antipattern to use express in Lambda?  Won't it bloat code and slow start up?
//  Yes - but ...
//  Express brings portability and familiarity.  Because Express is ubquitous it would be equally possible to move the solution to:
//  - AWS Fargate, or Azure, On-prem or even onto the mainframe.
//
//  The code bloat may slow start-up, but probably not significantly.  ToDo: We'll need to do some timings to verify this!!
//
//  When ready, the solution could be refactored to remove Express.
//
var express = require('express');
var app = express();
var fs = require('fs')
var morgan = require('morgan');

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

// todo: evaluate amdrequire (http://arqex.com/874/reusing-require-js-modules-node-js) or similar vs amd-loader (https://github.com/ajaxorg/node-amd-loader)
// so far picked https://www.npmjs.com/package/amd-loader as more weekly downloads -- moo  https://www.npmjs.com/package/requirejs
// or 'amdefine'

// create a write stream (in append mode)
// var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'})  //LM 13-1-2020 commented out as throwing error and I guess I don't need in lambda as it is logged anyway

// setup the logger
// app.use(morgan('combined', {stream: accessLogStream}))
// myLog.debug('Logging to: ' + accessLogStream.path);
// app.use(morgan('dev')) //LM 13-1-2020 commented out as I'm not really sure what it is doing.

var secureCodingCheck = require('./Security/doSecureCodingChecks').doCleanInputCheck;
var checkAuthentication = require('./Security/checkAuthentication').checkAuthentication;
var checkAuthorisation = require('./Security/checkAuthorisation').checkAuthorisation;

//ToDo: remove this dodgy code
//In my AM security checks I wanted to simulate another 'out of process' call.  Rather than copying this into a separate lambda implementations, I just "snuck" this in here.  Very naughty, it it is just a POC.
var aMMock = require('./mocks/mockCheckAuthorisation');

app.all('/api/v1/Client/:ClientIdentifierType/:ClientIdentifierValue/Authorisations', aMMock.overEngineeredMock);
//app.all(/^\/api\/v1\/Clients\/.*\/Authorisations.*/, aMMock.router);

app.disable('x-powered-by')

var db = require('./db');

// const realConsoleWarn = console.warn; //override console.warn because I'm not going to touch the jsre code and it is warning moment is depricated
// console.warn = myLog.warn;
// var stp = require('./jsre/forms/oTH_PAYROLL_EVENT_CHILDValidate');
// console.warn = realConsoleWarn;

var options = function (opt) {
    return function (err,request, response,next){
        next();
    }
}

//this is just me playing around with idea of options
app.use(options({opt:1}));

app.param('ClientIdentifierType', function(req,res, next, ClientIdentifierType){
    myLog.debug('In app.js/ param for ClientIdentifierType: ' + ClientIdentifierType);
    //todo: dodgy
    // req.Client = {ClientInternalId: 12345};
    next();
})

myLog.debug('Inside app.js');
//app.use('/forms', [secureCodingCheck.doCleanInputCheck, checkAuthentication, checkAuthorisation], FormController);

//todo: can't send everything to forms controller
//app.use('/api/v1/Clients', [secureCodingCheck.doCleanInputCheck, checkAuthentication, checkAuthorisation], FormController);

app.all('*',function (req, res, next){
    myLog.debug('+++++++++++ Processing:' + req.method + ' ' + req.url + '+++++++++++');
    next();
})

app.all('/*', function fudgetest1(req, res, next) {
    //myLog.info("--------------------------->>>>in fudgetest1 test", req.body);
    //res.status(200).send("fudged");
    next();
})

//using app.all doesn't capture the url, so the params & url are available to the router
var PayrollController = require('./Payroll/PayrollController');
myLog.debug(PayrollController.getRoutes);
app.all( PayrollController.getRoutes,  [secureCodingCheck, checkAuthentication, checkAuthorisation], PayrollController.router);

//app.all(/^\/api\/v1\/Clients\/.*\/Payroll.*/, [secureCodingCheck, checkAuthentication, checkAuthorisation], PayrollController.router);

app.all('/*', function fudgetest2(req, res, next) {
    //myLog.info("--------------------------->>>>in fudgetest2 test", req.body);
    //res.status(200).send("fudged");
    next();
})

//using app.use captures the matching url (up to "/api/v1/Clients"), but everything after that is availalbe
//to the router.  the above Payroll doesn't fall through to here because the above does a res.send
var FormController = require('./form/FormController');
app.use('/api/v1/Clients', FormController);

app.use('/ping', function pingTest(req, res, next) {
    myLog.info("in Ping test");
    res.status(200).send("Pinged");
})

module.exports = app;
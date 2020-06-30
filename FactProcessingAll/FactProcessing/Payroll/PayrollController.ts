import * as myLog from '../../myLog';
import * as express from 'express';
myLog.debug('Inside PayrollController');
export var router = express.Router({ mergeParams: true });
import * as bodyParser from 'body-parser';

import { amqpSendMessage, Channel, Message } from '../messaging/amqpSend';
import { amqpGetMessages, closeAMQPConnection, channel } from '../messaging/amqpReceive';
import { httpInterface } from '../messaging/httpInterface';

import xml2js from 'xml2js'; //alternatives were: https://www.npmjs.com/package/camaro or https://www.npmjs.com/package/xml2json  xml2js seemed best

const BusinessInterfacePayroll = "BI????", InterfaceComponentIdGetAll = "IC????", InterfaceComponentGetPayroll = "IC????", InterfaceComponentPutPayroll = "IC????", InterfaceComponentDeletePayroll = "IC????";

// *****************************************************************************
// invoke middleware functions - express ceremonyto make the payload available on req.body
// *****************************************************************************
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));


router.param('ClientIdentifierType', function (req, res, next, ClientIdentifierType) {
    myLog.log('In PayrollController.ts/ param for ClientIdentifierType: ' + ClientIdentifierType);
    //todo: dodgy
    // req.Client = {ClientInternalId: 12345};
    next();
})

router.use(function (req: any, res: any, next: any) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

router.use(function (req: any, res: any, next: any) {
    myLog.debug('In PayrollController.ts/ use-anon1')
    next();
})
router.all('*', function (req: any, res: any, next: any) {
    myLog.debug('In PayrollController.ts/ all-cross-cutting concerns');
    //checkAuthorisation(req,res,next);
    next();
})

// *****************************************************************************
// register the routes offered in this controller
// *****************************************************************************
const myRoutes: { route: string; get?: any, put?: any, post?: any, delete?: any }[] = [

    // STP Child Forms are always posted at the role level.  So don't need all CARPAT permutations.
    { route: '/api/v1/Clients/All/Payrolls', get: getAllPayrollsTestingUseOnly },
    // Have a dodgy resource to start polling AMQP
    { route: '/api/v1/AMQPListener/Payrolls/:threadId', put: createListener },
    { route: '/api/v1/Clients/:ClientIdentifierType/:ClientIdentifierValue/Accounts/:AccountSequenceNumber/Roles/:RoleTypeShortDecode/Payrollsxxx/:FormTypeMung/:TransactionId', put: experiment, },

    // An STP form can be identified either:
    // * explicitly with the tran id, or
    // * by specifying the (daily) Period start date.
    // * The code to handle a Get/Put/ Delete is almost identical as we just pass the request through.  I could have a common middleware function to do this
    // * but so far have chosen not to.
    { route: '/api/v1/Clients/:ClientIdentifierType/:ClientIdentifierValue/Accounts/:AccountSequenceNumber/Roles/:RoleTypeShortDecode/Payrolls/:FormTypeMung', get: getPayroll },
    { route: '/api/v1/Clients/:ClientIdentifierType/:ClientIdentifierValue/Accounts/:AccountSequenceNumber/Roles/:RoleTypeShortDecode/Payrolls/:FormTypeMung/:TransactionId', get: getPayroll, put: putPayroll, delete: deletePayroll },
    { route: '/api/v1/Clients/:ClientIdentifierType/:ClientIdentifierValue/Accounts/:AccountSequenceNumber/Roles/:RoleTypeShortDecode/PeriodStartDt/:PeriodStartDt/Payrolls/:FormTypeMung', get: getPayroll, put: putPayroll, delete: deletePayroll },
    // These routes will list the STP forms in the role (query strings may be present to limit forms to be returned)
    { route: '/api/v1/Clients/:ClientIdentifierType/:ClientIdentifierValue/Accounts/:AccountSequenceNumber/Roles/:RoleTypeShortDecode/Payrolls/:FormTypeMung', get: getPayroll }]
    //todo: extend retension period, link to case

//now load above routes 
myRoutes.map((r) => {
    if (r.get) router.get(r.route, r.get);
    if (r.put) router.put(r.route, r.put);
    if (r.post) router.post(r.route), r.post;
    if (r.delete) router.delete(r.route, r.delete);
});

export const getRoutes = myRoutes.map((r) => r.route);

// *****************************************************************************
// Get Methods
// *****************************************************************************
// RETURNS ALL THE Payrolls IN THE DATABASE
async function getAllPayrollsTestingUseOnly(req: express.Request, res: express.Response, next: express.NextFunction) {
    myLog.debug('Inside getAllPayrollsTestingUseOnly');

    await httpInterface(BusinessInterfacePayroll, InterfaceComponentIdGetAll, req.protocol, req.hostname, req.socket.localPort, req.headers, req.method,   req.originalUrl.replace('/Payroll', '/Form'))
        .then((response) => {
            myLog.debug("Number of forms: " + JSON.parse(response.body).length);
            res.status(response.statusCode).send(JSON.parse(response.body));
        })
        .catch((reason) => {
            myLog.error("In PayrollController.ts/ getAllPayrollsTestingUseOnly, encountered failure reason:" + reason);
            res.status(500).send("Internal Error encountered (0002)");
        });
};

async function getPayroll(req: express.Request, res: express.Response, next: express.NextFunction) {
    myLog.debug('Inside getPayroll');
    await httpInterface(BusinessInterfacePayroll, InterfaceComponentGetPayroll, req.protocol, req.hostname, req.socket.localPort, req.headers, req.method,   req.originalUrl.replace('/Payroll', '/Form'))
        .then((response) => {
            myLog.debug('Got resonse: ', response.statusCode);
            if (response.statusCode == 200) return res.status(response.statusCode).send(JSON.parse(response.body));
            return res.status(response.statusCode).send(response.statusMessage);
        })
        .catch((reason) => {
            myLog.error("In PayrollController.ts/ getPayroll, encountered failure reason: " + reason);
            res.status(500).send("Internal Error encountered (0003)");
        });
};

// Upserts the Payroll specified in the url into the database
export async function putPayroll(req: express.Request, res: express.Response, next: express.NextFunction) {
    myLog.debug("Inside putPayroll");
    await httpInterface(BusinessInterfacePayroll, InterfaceComponentPutPayroll, req.protocol, req.hostname, req.socket.localPort, req.headers, req.method,   req.originalUrl.replace('/Payroll', '/Form'), req.body)
        .then((response) => {
            res.status(response.statusCode).send(response.body);
        })
        .catch((reason) => {
            myLog.error("In PayrollController.ts/ putPayroll, encountered failure reason:" + reason);
            res.status(500).send("Internal Error encountered (0004)" + reason);
        });
};

// Deletes the Payroll specified in the url into the database
export async function deletePayroll(req: express.Request, res: express.Response, next: express.NextFunction) {
    myLog.debug("Inside deletePayroll");
    const url = "/api/v1/Clients/" + req.params.ClientIdentifierType + "/" + req.params.ClientIdentifierValue + "/Forms/" + req.params.FormTypeMung + "/" + req.params.TransactionId
    await httpInterface(BusinessInterfacePayroll, InterfaceComponentDeletePayroll, req.protocol, req.hostname, req.socket.localPort, req.headers, req.method,  url, req.body)
        .then((response) => {
            res.status(response.statusCode).send(response.body);
        })
        .catch((reason) => {
            myLog.error("In PayrollController.ts/ deletePayroll, encountered failure reason:" + reason);
            res.status(500).send("Internal Error encountered (0005)");
        });
};

import { transformFromSBR } from '../form/factSpecific/UniqueFormRules_10131Form';
// start pulling messages from a queue and invoke fact processing.
export async function createListener(req: express.Request, res: express.Response, next: express.NextFunction) {
    myLog.debug("Inside startPolling");
    const listenerDuration = req.body.listenerDuration || 60000;
    myLog.debug(`Will listen for messages for ${listenerDuration/1000} seconds`);

    const protocol = req.protocol, hostname = req.hostname, localPort = req.socket.localPort, headers =req.headers, urlBase = req.originalUrl.replace(/\/AMQPListener\/Payrolls\/(\d)+/, '');
    let payrollMessageCount = 0;
    async function payRollMessageHandler(msg: Message) {
        if (!channel) throw "It should be impossible for the channel to be null as we've just received a message, but typescript compiler is making me do this!";
        payrollMessageCount++;
        myLog.debug(`Inside payRollMessageHandler for the ${payrollMessageCount} time`);
        //by default request-promise-native just returns the body
        let [jsonpayload, err] = await parseXMLPayload(msg.content);
        if (err) {
            myLog.error('In PayrollController.ts/ parseXMLPayload, encountered error: ', err);
            return;
        }

        let body = transformFromSBR(jsonpayload);              //couldn't see value in https://github.com/dvdln/jsonpath-object-transform
        if (typeof body === 'string' ){
            myLog.error('In PayrollController.ts/ transformFromSBR, encountered error: ', body);
            return;
        }

        const tfn = body[10932][16560], abn = body[10932][25444];  //get payee ids
        const ClientExternalIdentifierType = tfn ? "TFN" : "ABN", ClientExternalIdentifierValue = tfn ? tfn : abn, AccountSequenceNumber = 1 /* this is my guess*/, RoleTypeShortDecode = 'IT';

        let url = urlBase + "/Clients/" + ClientExternalIdentifierType + "/" + ClientExternalIdentifierValue + "/Accounts/" + AccountSequenceNumber + "/Roles/" + RoleTypeShortDecode + "/Forms/10131Form/" + body.Transmission.BetNumber;
        myLog.debug('payRollMessageHandler - about to call...:' + url);
        let response = await httpInterface("BISBRSTP", "ICStep2-http", protocol, hostname, localPort, headers, 'PUT', url, body)
            .catch(async (err: any) => {
                myLog.error('In PayrollController.ts/ createListener, encountered error: ', err);
                closeAMQPConnection(channel);
                await new Promise(resolve => setTimeout(resolve, 250));  //I'm, sure a 1/4 sec wait to close that connection won't hurt.
                return res.status(500).send("Internal Error encountered, closed AMQPListener early, number of messages processed: " + payrollMessageCount);
            });
        myLog.debug(`payRollMessageHandler - response to:, ${url} was ${response.statusCode}`);
        
        myLog.debug(`payRollMessageHandler - About write response ${response}`);
        
        await writeResponseToQueue(channel, response);
        await channel.ack(msg);
        myLog.debug(`Leaving payRollMessageHandler for the ${payrollMessageCount} time`);
    }
    //close listener after 1 minute
    setTimeout(function () {
        myLog.debug('Closing AMQPConnection');
        closeAMQPConnection(channel);

        myLog.debug(`About wrap up here, processed ${payrollMessageCount} messages, sending http response.`);
        return res.status(201).send("Closed AMQPListener, number of messages processed: " + payrollMessageCount);
    }, listenerDuration);

    await amqpGetMessages("BISBRSTP", "ICStep1-Request", payRollMessageHandler);

    myLog.debug('waiting...');

    await new Promise(resolve => setTimeout(resolve, 1000));  //give 1/2 sec for connection to close

    myLog.debug('done waiting one sec...');
    myLog.debug(`Leaving createListener after ${payrollMessageCount} messages, this is not sending http response.`);
};

async function parseXMLPayload(payrollMessage: Buffer): Promise<[Object, Object?]> {
    var parser = new xml2js.Parser(/* options */);
    let error = null;
    let xml = payrollMessage.toString().replace(/tns:/gi, '');
    let jsonObj = await parser.parseStringPromise(xml)
        .catch(err => {
            error = err;
            myLog.error("Failed to parse xml payload with error:", err);
            return [{}, error];
        });
    myLog.debug("parseXMLPayload result is:", JSON.stringify(jsonObj));
    return [jsonObj];
}
let bindingPattern:(string|undefined)="BISBRSTP.ICStep3-Response";
async function writeResponseToQueue(channel: Channel, msg: any) {
    myLog.debug("Inside writeResponseToQueue");
    let data = Buffer.from(JSON.stringify(msg));
    await amqpSendMessage("BISBRSTP", "ICStep3-Response", data, undefined , bindingPattern);
    bindingPattern=undefined;
}

// Upserts the Payroll specified in the url into the database
export async function experiment(req: express.Request, res: express.Response, next: express.NextFunction) {
    debugger;
    myLog.debug("Inside experiment");

    const sbrForm = require('fs').readFileSync('./FactProcessing/Tests/sbrSTPForm.json');
    const sbrJson = JSON.parse(sbrForm.toString());

    await httpInterface(BusinessInterfacePayroll, "IC????", req.protocol, req.hostname, req.socket.localPort, req.headers, req.method,   req.originalUrl.replace('/Payrollsxxx', '/Forms'), sbrJson)
        .then((response) => {
            res.status(response.statusCode).send(response.body);
        })
        .catch((reason) => {
            myLog.error("In PayrollController.ts/ putPayroll, encountered failure reason:" + reason);
            res.status(500).send("Internal Error encountered (0004)");
        });
};
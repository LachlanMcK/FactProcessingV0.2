"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const myLog = __importStar(require("../../myLog"));
const express = __importStar(require("express"));
myLog.debug('Inside PayrollController');
exports.router = express.Router({ mergeParams: true });
const bodyParser = __importStar(require("body-parser"));
const amqpSend_1 = require("../messaging/amqpSend");
const amqpReceive_1 = require("../messaging/amqpReceive");
const httpInterface_1 = require("../messaging/httpInterface");
const xml2js_1 = __importDefault(require("xml2js")); //alternatives were: https://www.npmjs.com/package/camaro or https://www.npmjs.com/package/xml2json  xml2js seemed best
const BusinessInterfacePayroll = "BI????", InterfaceComponentIdGetAll = "IC????", InterfaceComponentGetPayroll = "IC????", InterfaceComponentPutPayroll = "IC????", InterfaceComponentDeletePayroll = "IC????";
// *****************************************************************************
// invoke middleware functions - express ceremonyto make the payload available on req.body
// *****************************************************************************
exports.router.use(bodyParser.json());
exports.router.use(bodyParser.urlencoded({ extended: true }));
exports.router.param('ClientIdentifierType', function (req, res, next, ClientIdentifierType) {
    myLog.log('In PayrollController.ts/ param for ClientIdentifierType: ' + ClientIdentifierType);
    //todo: dodgy
    // req.Client = {ClientInternalId: 12345};
    next();
});
exports.router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
exports.router.use(function (req, res, next) {
    myLog.debug('In PayrollController.ts/ use-anon1');
    next();
});
exports.router.all('*', function (req, res, next) {
    myLog.debug('In PayrollController.ts/ all-cross-cutting concerns');
    //checkAuthorisation(req,res,next);
    next();
});
// *****************************************************************************
// register the routes offered in this controller
// *****************************************************************************
const myRoutes = [
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
    { route: '/api/v1/Clients/:ClientIdentifierType/:ClientIdentifierValue/Accounts/:AccountSequenceNumber/Roles/:RoleTypeShortDecode/Payrolls/:FormTypeMung', get: getPayroll }
];
//todo: extend retension period, link to case
//now load above routes 
myRoutes.map((r) => {
    if (r.get)
        exports.router.get(r.route, r.get);
    if (r.put)
        exports.router.put(r.route, r.put);
    if (r.post)
        exports.router.post(r.route), r.post;
    if (r.delete)
        exports.router.delete(r.route, r.delete);
});
exports.getRoutes = myRoutes.map((r) => r.route);
// *****************************************************************************
// Get Methods
// *****************************************************************************
// RETURNS ALL THE Payrolls IN THE DATABASE
function getAllPayrollsTestingUseOnly(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        myLog.debug('Inside getAllPayrollsTestingUseOnly');
        yield httpInterface_1.httpInterface(BusinessInterfacePayroll, InterfaceComponentIdGetAll, req.protocol, req.hostname, req.socket.localPort, req.headers, req.method, req.originalUrl.replace('/Payroll', '/Form'))
            .then((response) => {
            myLog.debug("Number of forms: " + JSON.parse(response.body).length);
            res.status(response.statusCode).send(JSON.parse(response.body));
        })
            .catch((reason) => {
            myLog.error("In PayrollController.ts/ getAllPayrollsTestingUseOnly, encountered failure reason:" + reason);
            res.status(500).send("Internal Error encountered (0002)");
        });
    });
}
;
function getPayroll(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        myLog.debug('Inside getPayroll');
        yield httpInterface_1.httpInterface(BusinessInterfacePayroll, InterfaceComponentGetPayroll, req.protocol, req.hostname, req.socket.localPort, req.headers, req.method, req.originalUrl.replace('/Payroll', '/Form'))
            .then((response) => {
            myLog.debug('Got resonse: ', response.statusCode);
            if (response.statusCode == 200)
                return res.status(response.statusCode).send(JSON.parse(response.body));
            return res.status(response.statusCode).send(response.statusMessage);
        })
            .catch((reason) => {
            myLog.error("In PayrollController.ts/ getPayroll, encountered failure reason: " + reason);
            res.status(500).send("Internal Error encountered (0003)");
        });
    });
}
;
// Upserts the Payroll specified in the url into the database
function putPayroll(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        myLog.debug("Inside putPayroll");
        yield httpInterface_1.httpInterface(BusinessInterfacePayroll, InterfaceComponentPutPayroll, req.protocol, req.hostname, req.socket.localPort, req.headers, req.method, req.originalUrl.replace('/Payroll', '/Form'), req.body)
            .then((response) => {
            res.status(response.statusCode).send(response.body);
        })
            .catch((reason) => {
            myLog.error("In PayrollController.ts/ putPayroll, encountered failure reason:" + reason);
            res.status(500).send("Internal Error encountered (0004)" + reason);
        });
    });
}
exports.putPayroll = putPayroll;
;
// Deletes the Payroll specified in the url into the database
function deletePayroll(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        myLog.debug("Inside deletePayroll");
        const url = "/api/v1/Clients/" + req.params.ClientIdentifierType + "/" + req.params.ClientIdentifierValue + "/Forms/" + req.params.FormTypeMung + "/" + req.params.TransactionId;
        yield httpInterface_1.httpInterface(BusinessInterfacePayroll, InterfaceComponentDeletePayroll, req.protocol, req.hostname, req.socket.localPort, req.headers, req.method, url, req.body)
            .then((response) => {
            res.status(response.statusCode).send(response.body);
        })
            .catch((reason) => {
            myLog.error("In PayrollController.ts/ deletePayroll, encountered failure reason:" + reason);
            res.status(500).send("Internal Error encountered (0005)");
        });
    });
}
exports.deletePayroll = deletePayroll;
;
const UniqueFormRules_10131Form_1 = require("../form/factSpecific/UniqueFormRules_10131Form");
// start pulling messages from a queue and invoke fact processing.
function createListener(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        myLog.debug("Inside startPolling");
        const listenerDuration = req.body.listenerDuration || 60000;
        myLog.debug(`Will listen for messages for ${listenerDuration / 1000} seconds`);
        const protocol = req.protocol, hostname = req.hostname, localPort = req.socket.localPort, headers = req.headers, urlBase = req.originalUrl.replace(/\/AMQPListener\/Payrolls\/(\d)+/, '');
        let payrollMessageCount = 0;
        function payRollMessageHandler(msg) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!amqpReceive_1.channel)
                    throw "It should be impossible for the channel to be null as we've just received a message, but typescript compiler is making me do this!";
                payrollMessageCount++;
                myLog.debug(`Inside payRollMessageHandler for the ${payrollMessageCount} time`);
                //by default request-promise-native just returns the body
                let [jsonpayload, err] = yield parseXMLPayload(msg.content);
                if (err) {
                    myLog.error('In PayrollController.ts/ parseXMLPayload, encountered error: ', err);
                    return;
                }
                let body = UniqueFormRules_10131Form_1.transformFromSBR(jsonpayload); //couldn't see value in https://github.com/dvdln/jsonpath-object-transform
                if (typeof body === 'string') {
                    myLog.error('In PayrollController.ts/ transformFromSBR, encountered error: ', body);
                    return;
                }
                const tfn = body[10932][16560], abn = body[10932][25444]; //get payee ids
                const ClientExternalIdentifierType = tfn ? "TFN" : "ABN", ClientExternalIdentifierValue = tfn ? tfn : abn, AccountSequenceNumber = 1 /* this is my guess*/, RoleTypeShortDecode = 'IT';
                let url = urlBase + "/Clients/" + ClientExternalIdentifierType + "/" + ClientExternalIdentifierValue + "/Accounts/" + AccountSequenceNumber + "/Roles/" + RoleTypeShortDecode + "/Forms/10131Form/" + body.Transmission.BetNumber;
                myLog.debug('payRollMessageHandler - about to call...:' + url);
                let response = yield httpInterface_1.httpInterface("BISBRSTP", "ICStep2-http", protocol, hostname, localPort, headers, 'PUT', url, body)
                    .catch((err) => __awaiter(this, void 0, void 0, function* () {
                    myLog.error('In PayrollController.ts/ createListener, encountered error: ', err);
                    amqpReceive_1.closeAMQPConnection(amqpReceive_1.channel);
                    yield new Promise(resolve => setTimeout(resolve, 250)); //I'm, sure a 1/4 sec wait to close that connection won't hurt.
                    return res.status(500).send("Internal Error encountered, closed AMQPListener early, number of messages processed: " + payrollMessageCount);
                }));
                myLog.debug(`payRollMessageHandler - response to:, ${url} was ${response.statusCode}`);
                myLog.debug(`payRollMessageHandler - About write response ${response}`);
                yield writeResponseToQueue(amqpReceive_1.channel, response);
                yield amqpReceive_1.channel.ack(msg);
                myLog.debug(`Leaving payRollMessageHandler for the ${payrollMessageCount} time`);
            });
        }
        //close listener after 1 minute
        setTimeout(function () {
            myLog.debug('Closing AMQPConnection');
            amqpReceive_1.closeAMQPConnection(amqpReceive_1.channel);
            myLog.debug(`About wrap up here, processed ${payrollMessageCount} messages, sending http response.`);
            return res.status(201).send("Closed AMQPListener, number of messages processed: " + payrollMessageCount);
        }, listenerDuration);
        yield amqpReceive_1.amqpGetMessages("BISBRSTP", "ICStep1-Request", payRollMessageHandler);
        myLog.debug('waiting...');
        yield new Promise(resolve => setTimeout(resolve, 1000)); //give 1/2 sec for connection to close
        myLog.debug('done waiting one sec...');
        myLog.debug(`Leaving createListener after ${payrollMessageCount} messages, this is not sending http response.`);
    });
}
exports.createListener = createListener;
;
function parseXMLPayload(payrollMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        var parser = new xml2js_1.default.Parser( /* options */);
        let error = null;
        let xml = payrollMessage.toString().replace(/tns:/gi, '');
        let jsonObj = yield parser.parseStringPromise(xml)
            .catch(err => {
            error = err;
            myLog.error("Failed to parse xml payload with error:", err);
            return [{}, error];
        });
        myLog.debug("parseXMLPayload result is:", JSON.stringify(jsonObj));
        return [jsonObj];
    });
}
let bindingPattern = "BISBRSTP.ICStep3-Response";
function writeResponseToQueue(channel, msg) {
    return __awaiter(this, void 0, void 0, function* () {
        myLog.debug("Inside writeResponseToQueue");
        let data = Buffer.from(JSON.stringify(msg));
        yield amqpSend_1.amqpSendMessage("BISBRSTP", "ICStep3-Response", data, undefined, bindingPattern);
        bindingPattern = undefined;
    });
}
// Upserts the Payroll specified in the url into the database
function experiment(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        debugger;
        myLog.debug("Inside experiment");
        const sbrForm = require('fs').readFileSync('./FactProcessing/Tests/sbrSTPForm.json');
        const sbrJson = JSON.parse(sbrForm.toString());
        yield httpInterface_1.httpInterface(BusinessInterfacePayroll, "IC????", req.protocol, req.hostname, req.socket.localPort, req.headers, req.method, req.originalUrl.replace('/Payrollsxxx', '/Forms'), sbrJson)
            .then((response) => {
            res.status(response.statusCode).send(response.body);
        })
            .catch((reason) => {
            myLog.error("In PayrollController.ts/ putPayroll, encountered failure reason:" + reason);
            res.status(500).send("Internal Error encountered (0004)");
        });
    });
}
exports.experiment = experiment;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGF5cm9sbENvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJQYXlyb2xsQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtREFBcUM7QUFDckMsaURBQW1DO0FBQ25DLEtBQUssQ0FBQyxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUM3QixRQUFBLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7QUFDMUQsd0RBQTBDO0FBRTFDLG9EQUEwRTtBQUMxRSwwREFBeUY7QUFDekYsOERBQTJEO0FBRTNELG9EQUE0QixDQUFDLHVIQUF1SDtBQUVwSixNQUFNLHdCQUF3QixHQUFHLFFBQVEsRUFBRSwwQkFBMEIsR0FBRyxRQUFRLEVBQUUsNEJBQTRCLEdBQUcsUUFBUSxFQUFFLDRCQUE0QixHQUFHLFFBQVEsRUFBRSwrQkFBK0IsR0FBRyxRQUFRLENBQUM7QUFFL00sZ0ZBQWdGO0FBQ2hGLDBGQUEwRjtBQUMxRixnRkFBZ0Y7QUFDaEYsY0FBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUM5QixjQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBR3RELGNBQU0sQ0FBQyxLQUFLLENBQUMsc0JBQXNCLEVBQUUsVUFBVSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxvQkFBb0I7SUFDL0UsS0FBSyxDQUFDLEdBQUcsQ0FBQywyREFBMkQsR0FBRyxvQkFBb0IsQ0FBQyxDQUFDO0lBQzlGLGFBQWE7SUFDYiwwQ0FBMEM7SUFDMUMsSUFBSSxFQUFFLENBQUM7QUFDWCxDQUFDLENBQUMsQ0FBQTtBQUVGLGNBQU0sQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFRLEVBQUUs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TUFBTSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxNQUFNLEVBQUksR0FBRyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLFFBQVEsQ0FBQyxFQUFFLE9BQU8sQ0FBQzthQUMzTCxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtZQUNmLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEQsQ0FBQyxDQUFDO2FBQ0QsS0FBSyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7WUFDZCxLQUFLLENBQUMsS0FBSyxDQUFDLGtFQUFrRSxHQUFHLE1BQU0sQ0FBQyxDQUFDO1lBQ3pGLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLG1DQUFtQyxDQUFDLENBQUM7UUFDOUQsQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDO0NBQUE7QUFmRCxnQ0FlQztBQUFBLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBteUxvZyBmcm9tICcuLi8uLi9teUxvZyc7XHJcbmltcG9ydCAqIGFzIGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XHJcbm15TG9nLmRlYnVnKCdJbnNpZGUgUGF5cm9sbENvbnRyb2xsZXInKTtcclxuZXhwb3J0IHZhciByb3V0ZXIgPSBleHByZXNzLlJvdXRlcih7IG1lcmdlUGFyYW1zOiB0cnVlIH0pO1xyXG5pbXBvcnQgKiBhcyBib2R5UGFyc2VyIGZyb20gJ2JvZHktcGFyc2VyJztcclxuXHJcbmltcG9ydCB7IGFtcXBTZW5kTWVzc2FnZSwgQ2hhbm5lbCwgTWVzc2FnZSB9IGZyb20gJy4uL21lc3NhZ2luZy9hbXFwU2VuZCc7XHJcbmltcG9ydCB7IGFtcXBHZXRNZXNzYWdlcywgY2xvc2VBTVFQQ29ubmVjdGlvbiwgY2hhbm5lbCB9IGZyb20gJy4uL21lc3NhZ2luZy9hbXFwUmVjZWl2ZSc7XHJcbmltcG9ydCB7IGh0dHBJbnRlcmZhY2UgfSBmcm9tICcuLi9tZXNzYWdpbmcvaHR0cEludGVyZmFjZSc7XHJcblxyXG5pbXBvcnQgeG1sMmpzIGZyb20gJ3htbDJqcyc7IC8vYWx0ZXJuYXRpdmVzIHdlcmU6IGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL2NhbWFybyBvciBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS94bWwyanNvbiAgeG1sMmpzIHNlZW1lZCBiZXN0XHJcblxyXG5jb25zdCBCdXNpbmVzc0ludGVyZmFjZVBheXJvbGwgPSBcIkJJPz8/P1wiLCBJbnRlcmZhY2VDb21wb25lbnRJZEdldEFsbCA9IFwiSUM/Pz8/XCIsIEludGVyZmFjZUNvbXBvbmVudEdldFBheXJvbGwgPSBcIklDPz8/P1wiLCBJbnRlcmZhY2VDb21wb25lbnRQdXRQYXlyb2xsID0gXCJJQz8/Pz9cIiwgSW50ZXJmYWNlQ29tcG9uZW50RGVsZXRlUGF5cm9sbCA9IFwiSUM/Pz8/XCI7XHJcblxyXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4vLyBpbnZva2UgbWlkZGxld2FyZSBmdW5jdGlvbnMgLSBleHByZXNzIGNlcmVtb255dG8gbWFrZSB0aGUgcGF5bG9hZCBhdmFpbGFibGUgb24gcmVxLmJvZHlcclxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxucm91dGVyLnVzZShib2R5UGFyc2VyLmpzb24oKSk7XHJcbnJvdXRlci51c2UoYm9keVBhcnNlci51cmxlbmNvZGVkKHsgZXh0ZW5kZWQ6IHRydWUgfSkpO1xyXG5cclxuXHJcbnJvdXRlci5wYXJhbSgnQ2xpZW50SWRlbnRpZmllclR5cGUnLCBmdW5jdGlvbiAocmVxLCByZXMsIG5leHQsIENsaWVudElkZW50aWZpZXJUeXBlKSB7XHJcbiAgICBteUxvZy5sb2coJ0luIFBheXJvbGxDb250cm9sbGVyLnRzLyBwYXJhbSBmb3IgQ2xpZW50SWRlbnRpZmllclR5cGU6ICcgKyBDbGllbnRJZGVudGlmaWVyVHlwZSk7XHJcbiAgICAvL3RvZG86IGRvZGd5XHJcbiAgICAvLyByZXEuQ2xpZW50ID0ge0NsaWVudEludGVybmFsSWQ6IDEyMzQ1fTtcclxuICAgIG5leHQoKTtcclxufSlcclxuXHJcbnJvdXRlci51c2UoZnVuY3Rpb24gKHJlcTogYW55LCByZXM6IGFueSwgbmV4dDogYW55KSB7XHJcbiAgICByZXMuaGVhZGVyKFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIsIFwiKlwiKTtcclxuICAgIHJlcy5oZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzXCIsIFwiT3JpZ2luLCBYLVJlcXVlc3RlZC1XaXRoLCBDb250ZW50LVR5cGUsIEFjY2VwdFwiKTtcclxuICAgIG5leHQoKTtcclxufSk7XHJcblxyXG5yb3V0ZXIudXNlKGZ1bmN0aW9uIChyZXE6IGFueSwgcmVzOiBhbnksIG5leHQ6IGFueSkge1xyXG4gICAgbXlMb2cuZGVidWcoJ0luIFBheXJvbGxDb250cm9sbGVyLnRzLyB1c2UtYW5vbjEnKVxyXG4gICAgbmV4dCgpO1xyXG59KVxyXG5yb3V0ZXIuYWxsKCcqJywgZnVuY3Rpb24gKHJlcTogYW55LCByZXM6IGFueSwgbmV4dDogYW55KSB7XHJcbiAgICBteUxvZy5kZWJ1ZygnSW4gUGF5cm9sbENvbnRyb2xsZXIudHMvIGFsbC1jcm9zcy1jdXR0aW5nIGNvbmNlcm5zJyk7XHJcbiAgICAvL2NoZWNrQXV0aG9yaXNhdGlvbihyZXEscmVzLG5leHQpO1xyXG4gICAgbmV4dCgpO1xyXG59KVxyXG5cclxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuLy8gcmVnaXN0ZXIgdGhlIHJvdXRlcyBvZmZlcmVkIGluIHRoaXMgY29udHJvbGxlclxyXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5jb25zdCBteVJvdXRlczogeyByb3V0ZTogc3RyaW5nOyBnZXQ/OiBhbnksIHB1dD86IGFueSwgcG9zdD86IGFueSwgZGVsZXRlPzogYW55IH1bXSA9IFtcclxuXHJcbiAgICAvLyBTVFAgQ2hpbGQgRm9ybXMgYXJlIGFsd2F5cyBwb3N0ZWQgYXQgdGhlIHJvbGUgbGV2ZWwuICBTbyBkb24ndCBuZWVkIGFsbCBDQVJQQVQgcGVybXV0YXRpb25zLlxyXG4gICAgeyByb3V0ZTogJy9hcGkvdjEvQ2xpZW50cy9BbGwvUGF5cm9sbHMnLCBnZXQ6IGdldEFsbFBheXJvbGxzVGVzdGluZ1VzZU9ubHkgfSxcclxuICAgIC8vIEhhdmUgYSBkb2RneSByZXNvdXJjZSB0byBzdGFydCBwb2xsaW5nIEFNUVBcclxuICAgIHsgcm91dGU6ICcvYXBpL3YxL0FNUVBMaXN0ZW5lci9QYXlyb2xscy86dGhyZWFkSWQnLCBwdXQ6IGNyZWF0ZUxpc3RlbmVyIH0sXHJcbiAgICB7IHJvdXRlOiAnL2FwaS92MS9DbGllbnRzLzpDbGllbnRJZGVudGlmaWVyVHlwZS86Q2xpZW50SWRlbnRpZmllclZhbHVlL0FjY291bnRzLzpBY2NvdW50U2VxdWVuY2VOdW1iZXIvUm9sZXMvOlJvbGVUeXBlU2hvcnREZWNvZGUvUGF5cm9sbHN4eHgvOkZvcm1UeXBlTXVuZy86VHJhbnNhY3Rpb25JZCcsIHB1dDogZXhwZXJpbWVudCwgfSxcclxuXHJcbiAgICAvLyBBbiBTVFAgZm9ybSBjYW4gYmUgaWRlbnRpZmllZCBlaXRoZXI6XHJcbiAgICAvLyAqIGV4cGxpY2l0bHkgd2l0aCB0aGUgdHJhbiBpZCwgb3JcclxuICAgIC8vICogYnkgc3BlY2lmeWluZyB0aGUgKGRhaWx5KSBQZXJpb2Qgc3RhcnQgZGF0ZS5cclxuICAgIC8vICogVGhlIGNvZGUgdG8gaGFuZGxlIGEgR2V0L1B1dC8gRGVsZXRlIGlzIGFsbW9zdCBpZGVudGljYWwgYXMgd2UganVzdCBwYXNzIHRoZSByZXF1ZXN0IHRocm91Z2guICBJIGNvdWxkIGhhdmUgYSBjb21tb24gbWlkZGxld2FyZSBmdW5jdGlvbiB0byBkbyB0aGlzXHJcbiAgICAvLyAqIGJ1dCBzbyBmYXIgaGF2ZSBjaG9zZW4gbm90IHRvLlxyXG4gICAgeyByb3V0ZTogJy9hcGkvdjEvQ2xpZW50cy86Q2xpZW50SWRlbnRpZmllclR5cGUvOkNsaWVudElkZW50aWZpZXJWYWx1ZS9BY2NvdW50cy86QWNjb3VudFNlcXVlbmNlTnVtYmVyL1JvbGVzLzpSb2xlVHlwZVNob3J0RGVjb2RlL1BheXJvbGxzLzpGb3JtVHlwZU11bmcnLCBnZXQ6IGdldFBheXJvbGwgfSxcclxuICAgIHsgcm91dGU6ICcvYXBpL3YxL0NsaWVudHMvOkNsaWVudElkZW50aWZpZXJUeXBlLzpDbGllbnRJZGVudGlmaWVyVmFsdWUvQWNjb3VudHMvOkFjY291bnRTZXF1ZW5jZU51bWJlci9Sb2xlcy86Um9sZVR5cGVTaG9ydERlY29kZS9QYXlyb2xscy86Rm9ybVR5cGVNdW5nLzpUcmFuc2FjdGlvbklkJywgZ2V0OiBnZXRQYXlyb2xsLCBwdXQ6IHB1dFBheXJvbGwsIGRlbGV0ZTogZGVsZXRlUGF5cm9sbCB9LFxyXG4gICAgeyByb3V0ZTogJy9hcGkvdjEvQ2xpZW50cy86Q2xpZW50SWRlbnRpZmllclR5cGUvOkNsaWVudElkZW50aWZpZXJWYWx1ZS9BY2NvdW50cy86QWNjb3VudFNlcXVlbmNlTnVtYmVyL1JvbGVzLzpSb2xlVHlwZVNob3J0RGVjb2RlL1BlcmlvZFN0YXJ0RHQvOlBlcmlvZFN0YXJ0RHQvUGF5cm9sbHMvOkZvcm1UeXBlTXVuZycsIGdldDogZ2V0UGF5cm9sbCwgcHV0OiBwdXRQYXlyb2xsLCBkZWxldGU6IGRlbGV0ZVBheXJvbGwgfSxcclxuICAgIC8vIFRoZXNlIHJvdXRlcyB3aWxsIGxpc3QgdGhlIFNUUCBmb3JtcyBpbiB0aGUgcm9sZSAocXVlcnkgc3RyaW5ncyBtYXkgYmUgcHJlc2VudCB0byBsaW1pdCBmb3JtcyB0byBiZSByZXR1cm5lZClcclxuICAgIHsgcm91dGU6ICcvYXBpL3YxL0NsaWVudHMvOkNsaWVudElkZW50aWZpZXJUeXBlLzpDbGllbnRJZGVudGlmaWVyVmFsdWUvQWNjb3VudHMvOkFjY291bnRTZXF1ZW5jZU51bWJlci9Sb2xlcy86Um9sZVR5cGVTaG9ydERlY29kZS9QYXlyb2xscy86Rm9ybVR5cGVNdW5nJywgZ2V0OiBnZXRQYXlyb2xsIH1dXHJcbiAgICAvL3RvZG86IGV4dGVuZCByZXRlbnNpb24gcGVyaW9kLCBsaW5rIHRvIGNhc2VcclxuXHJcbi8vbm93IGxvYWQgYWJvdmUgcm91dGVzIFxyXG5teVJvdXRlcy5tYXAoKHIpID0+IHtcclxuICAgIGlmIChyLmdldCkgcm91dGVyLmdldChyLnJvdXRlLCByLmdldCk7XHJcbiAgICBpZiAoci5wdXQpIHJvdXRlci5wdXQoci5yb3V0ZSwgci5wdXQpO1xyXG4gICAgaWYgKHIucG9zdCkgcm91dGVyLnBvc3Qoci5yb3V0ZSksIHIucG9zdDtcclxuICAgIGlmIChyLmRlbGV0ZSkgcm91dGVyLmRlbGV0ZShyLnJvdXRlLCByLmRlbGV0ZSk7XHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IGdldFJvdXRlcyA9IG15Um91dGVzLm1hcCgocikgPT4gci5yb3V0ZSk7XHJcblxyXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4vLyBHZXQgTWV0aG9kc1xyXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4vLyBSRVRVUk5TIEFMTCBUSEUgUGF5cm9sbHMgSU4gVEhFIERBVEFCQVNFXHJcbmFzeW5jIGZ1bmN0aW9uIGdldEFsbFBheXJvbGxzVGVzdGluZ1VzZU9ubHkocmVxOiBleHByZXNzLlJlcXVlc3QsIHJlczogZXhwcmVzcy5SZXNwb25zZSwgbmV4dDogZXhwcmVzcy5OZXh0RnVuY3Rpb24pIHtcclxuICAgIG15TG9nLmRlYnVnKCdJbnNpZGUgZ2V0QWxsUGF5cm9sbHNUZXN0aW5nVXNlT25seScpO1xyXG5cclxuICAgIGF3YWl0IGh0dHBJbnRlcmZhY2UoQnVzaW5lc3NJbnRlcmZhY2VQYXlyb2xsLCBJbnRlcmZhY2VDb21wb25lbnRJZEdldEFsbCwgcmVxLnByb3RvY29sLCByZXEuaG9zdG5hbWUsIHJlcS5zb2NrZXQubG9jYWxQb3J0LCByZXEuaGVhZGVycywgcmVxLm1ldGhvZCwgICByZXEub3JpZ2luYWxVcmwucmVwbGFjZSgnL1BheXJvbGwnLCAnL0Zvcm0nKSlcclxuICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgbXlMb2cuZGVidWcoXCJOdW1iZXIgb2YgZm9ybXM6IFwiICsgSlNPTi5wYXJzZShyZXNwb25zZS5ib2R5KS5sZW5ndGgpO1xyXG4gICAgICAgICAgICByZXMuc3RhdHVzKHJlc3BvbnNlLnN0YXR1c0NvZGUpLnNlbmQoSlNPTi5wYXJzZShyZXNwb25zZS5ib2R5KSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goKHJlYXNvbikgPT4ge1xyXG4gICAgICAgICAgICBteUxvZy5lcnJvcihcIkluIFBheXJvbGxDb250cm9sbGVyLnRzLyBnZXRBbGxQYXlyb2xsc1Rlc3RpbmdVc2VPbmx5LCBlbmNvdW50ZXJlZCBmYWlsdXJlIHJlYXNvbjpcIiArIHJlYXNvbik7XHJcbiAgICAgICAgICAgIHJlcy5zdGF0dXMoNTAwKS5zZW5kKFwiSW50ZXJuYWwgRXJyb3IgZW5jb3VudGVyZWQgKDAwMDIpXCIpO1xyXG4gICAgICAgIH0pO1xyXG59O1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gZ2V0UGF5cm9sbChyZXE6IGV4cHJlc3MuUmVxdWVzdCwgcmVzOiBleHByZXNzLlJlc3BvbnNlLCBuZXh0OiBleHByZXNzLk5leHRGdW5jdGlvbikge1xyXG4gICAgbXlMb2cuZGVidWcoJ0luc2lkZSBnZXRQYXlyb2xsJyk7XHJcbiAgICBhd2FpdCBodHRwSW50ZXJmYWNlKEJ1c2luZXNzSW50ZXJmYWNlUGF5cm9sbCwgSW50ZXJmYWNlQ29tcG9uZW50R2V0UGF5cm9sbCwgcmVxLnByb3RvY29sLCByZXEuaG9zdG5hbWUsIHJlcS5zb2NrZXQubG9jYWxQb3J0LCByZXEuaGVhZGVycywgcmVxLm1ldGhvZCwgICByZXEub3JpZ2luYWxVcmwucmVwbGFjZSgnL1BheXJvbGwnLCAnL0Zvcm0nKSlcclxuICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgbXlMb2cuZGVidWcoJ0dvdCByZXNvbnNlOiAnLCByZXNwb25zZS5zdGF0dXNDb2RlKTtcclxuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1c0NvZGUgPT0gMjAwKSByZXR1cm4gcmVzLnN0YXR1cyhyZXNwb25zZS5zdGF0dXNDb2RlKS5zZW5kKEpTT04ucGFyc2UocmVzcG9uc2UuYm9keSkpO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyhyZXNwb25zZS5zdGF0dXNDb2RlKS5zZW5kKHJlc3BvbnNlLnN0YXR1c01lc3NhZ2UpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKChyZWFzb24pID0+IHtcclxuICAgICAgICAgICAgbXlMb2cuZXJyb3IoXCJJbiBQYXlyb2xsQ29udHJvbGxlci50cy8gZ2V0UGF5cm9sbCwgZW5jb3VudGVyZWQgZmFpbHVyZSByZWFzb246IFwiICsgcmVhc29uKTtcclxuICAgICAgICAgICAgcmVzLnN0YXR1cyg1MDApLnNlbmQoXCJJbnRlcm5hbCBFcnJvciBlbmNvdW50ZXJlZCAoMDAwMylcIik7XHJcbiAgICAgICAgfSk7XHJcbn07XHJcblxyXG4vLyBVcHNlcnRzIHRoZSBQYXlyb2xsIHNwZWNpZmllZCBpbiB0aGUgdXJsIGludG8gdGhlIGRhdGFiYXNlXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwdXRQYXlyb2xsKHJlcTogZXhwcmVzcy5SZXF1ZXN0LCByZXM6IGV4cHJlc3MuUmVzcG9uc2UsIG5leHQ6IGV4cHJlc3MuTmV4dEZ1bmN0aW9uKSB7XHJcbiAgICBteUxvZy5kZWJ1ZyhcIkluc2lkZSBwdXRQYXlyb2xsXCIpO1xyXG4gICAgYXdhaXQgaHR0cEludGVyZmFjZShCdXNpbmVzc0ludGVyZmFjZVBheXJvbGwsIEludGVyZmFjZUNvbXBvbmVudFB1dFBheXJvbGwsIHJlcS5wcm90b2NvbCwgcmVxLmhvc3RuYW1lLCByZXEuc29ja2V0LmxvY2FsUG9ydCwgcmVxLmhlYWRlcnMsIHJlcS5tZXRob2QsICAgcmVxLm9yaWdpbmFsVXJsLnJlcGxhY2UoJy9QYXlyb2xsJywgJy9Gb3JtJyksIHJlcS5ib2R5KVxyXG4gICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICByZXMuc3RhdHVzKHJlc3BvbnNlLnN0YXR1c0NvZGUpLnNlbmQocmVzcG9uc2UuYm9keSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goKHJlYXNvbikgPT4ge1xyXG4gICAgICAgICAgICBteUxvZy5lcnJvcihcIkluIFBheXJvbGxDb250cm9sbGVyLnRzLyBwdXRQYXlyb2xsLCBlbmNvdW50ZXJlZCBmYWlsdXJlIHJlYXNvbjpcIiArIHJlYXNvbik7XHJcbiAgICAgICAgICAgIHJlcy5zdGF0dXMoNTAwKS5zZW5kKFwiSW50ZXJuYWwgRXJyb3IgZW5jb3VudGVyZWQgKDAwMDQpXCIgKyByZWFzb24pO1xyXG4gICAgICAgIH0pO1xyXG59O1xyXG5cclxuLy8gRGVsZXRlcyB0aGUgUGF5cm9sbCBzcGVjaWZpZWQgaW4gdGhlIHVybCBpbnRvIHRoZSBkYXRhYmFzZVxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVsZXRlUGF5cm9sbChyZXE6IGV4cHJlc3MuUmVxdWVzdCwgcmVzOiBleHByZXNzLlJlc3BvbnNlLCBuZXh0OiBleHByZXNzLk5leHRGdW5jdGlvbikge1xyXG4gICAgbXlMb2cuZGVidWcoXCJJbnNpZGUgZGVsZXRlUGF5cm9sbFwiKTtcclxuICAgIGNvbnN0IHVybCA9IFwiL2FwaS92MS9DbGllbnRzL1wiICsgcmVxLnBhcmFtcy5DbGllbnRJZGVudGlmaWVyVHlwZSArIFwiL1wiICsgcmVxLnBhcmFtcy5DbGllbnRJZGVudGlmaWVyVmFsdWUgKyBcIi9Gb3Jtcy9cIiArIHJlcS5wYXJhbXMuRm9ybVR5cGVNdW5nICsgXCIvXCIgKyByZXEucGFyYW1zLlRyYW5zYWN0aW9uSWRcclxuICAgIGF3YWl0IGh0dHBJbnRlcmZhY2UoQnVzaW5lc3NJbnRlcmZhY2VQYXlyb2xsLCBJbnRlcmZhY2VDb21wb25lbnREZWxldGVQYXlyb2xsLCByZXEucHJvdG9jb2wsIHJlcS5ob3N0bmFtZSwgcmVxLnNvY2tldC5sb2NhbFBvcnQsIHJlcS5oZWFkZXJzLCByZXEubWV0aG9kLCAgdXJsLCByZXEuYm9keSlcclxuICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgcmVzLnN0YXR1cyhyZXNwb25zZS5zdGF0dXNDb2RlKS5zZW5kKHJlc3BvbnNlLmJvZHkpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKChyZWFzb24pID0+IHtcclxuICAgICAgICAgICAgbXlMb2cuZXJyb3IoXCJJbiBQYXlyb2xsQ29udHJvbGxlci50cy8gZGVsZXRlUGF5cm9sbCwgZW5jb3VudGVyZWQgZmFpbHVyZSByZWFzb246XCIgKyByZWFzb24pO1xyXG4gICAgICAgICAgICByZXMuc3RhdHVzKDUwMCkuc2VuZChcIkludGVybmFsIEVycm9yIGVuY291bnRlcmVkICgwMDA1KVwiKTtcclxuICAgICAgICB9KTtcclxufTtcclxuXHJcbmltcG9ydCB7IHRyYW5zZm9ybUZyb21TQlIgfSBmcm9tICcuLi9mb3JtL2ZhY3RTcGVjaWZpYy9VbmlxdWVGb3JtUnVsZXNfMTAxMzFGb3JtJztcclxuLy8gc3RhcnQgcHVsbGluZyBtZXNzYWdlcyBmcm9tIGEgcXVldWUgYW5kIGludm9rZSBmYWN0IHByb2Nlc3NpbmcuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjcmVhdGVMaXN0ZW5lcihyZXE6IGV4cHJlc3MuUmVxdWVzdCwgcmVzOiBleHByZXNzLlJlc3BvbnNlLCBuZXh0OiBleHByZXNzLk5leHRGdW5jdGlvbikge1xyXG4gICAgbXlMb2cuZGVidWcoXCJJbnNpZGUgc3RhcnRQb2xsaW5nXCIpO1xyXG4gICAgY29uc3QgbGlzdGVuZXJEdXJhdGlvbiA9IHJlcS5ib2R5Lmxpc3RlbmVyRHVyYXRpb24gfHwgNjAwMDA7XHJcbiAgICBteUxvZy5kZWJ1ZyhgV2lsbCBsaXN0ZW4gZm9yIG1lc3NhZ2VzIGZvciAke2xpc3RlbmVyRHVyYXRpb24vMTAwMH0gc2Vjb25kc2ApO1xyXG5cclxuICAgIGNvbnN0IHByb3RvY29sID0gcmVxLnByb3RvY29sLCBob3N0bmFtZSA9IHJlcS5ob3N0bmFtZSwgbG9jYWxQb3J0ID0gcmVxLnNvY2tldC5sb2NhbFBvcnQsIGhlYWRlcnMgPXJlcS5oZWFkZXJzLCB1cmxCYXNlID0gcmVxLm9yaWdpbmFsVXJsLnJlcGxhY2UoL1xcL0FNUVBMaXN0ZW5lclxcL1BheXJvbGxzXFwvKFxcZCkrLywgJycpO1xyXG4gICAgbGV0IHBheXJvbGxNZXNzYWdlQ291bnQgPSAwO1xyXG4gICAgYXN5bmMgZnVuY3Rpb24gcGF5Um9sbE1lc3NhZ2VIYW5kbGVyKG1zZzogTWVzc2FnZSkge1xyXG4gICAgICAgIGlmICghY2hhbm5lbCkgdGhyb3cgXCJJdCBzaG91bGQgYmUgaW1wb3NzaWJsZSBmb3IgdGhlIGNoYW5uZWwgdG8gYmUgbnVsbCBhcyB3ZSd2ZSBqdXN0IHJlY2VpdmVkIGEgbWVzc2FnZSwgYnV0IHR5cGVzY3JpcHQgY29tcGlsZXIgaXMgbWFraW5nIG1lIGRvIHRoaXMhXCI7XHJcbiAgICAgICAgcGF5cm9sbE1lc3NhZ2VDb3VudCsrO1xyXG4gICAgICAgIG15TG9nLmRlYnVnKGBJbnNpZGUgcGF5Um9sbE1lc3NhZ2VIYW5kbGVyIGZvciB0aGUgJHtwYXlyb2xsTWVzc2FnZUNvdW50fSB0aW1lYCk7XHJcbiAgICAgICAgLy9ieSBkZWZhdWx0IHJlcXVlc3QtcHJvbWlzZS1uYXRpdmUganVzdCByZXR1cm5zIHRoZSBib2R5XHJcbiAgICAgICAgbGV0IFtqc29ucGF5bG9hZCwgZXJyXSA9IGF3YWl0IHBhcnNlWE1MUGF5bG9hZChtc2cuY29udGVudCk7XHJcbiAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICBteUxvZy5lcnJvcignSW4gUGF5cm9sbENvbnRyb2xsZXIudHMvIHBhcnNlWE1MUGF5bG9hZCwgZW5jb3VudGVyZWQgZXJyb3I6ICcsIGVycik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBib2R5ID0gdHJhbnNmb3JtRnJvbVNCUihqc29ucGF5bG9hZCk7ICAgICAgICAgICAgICAvL2NvdWxkbid0IHNlZSB2YWx1ZSBpbiBodHRwczovL2dpdGh1Yi5jb20vZHZkbG4vanNvbnBhdGgtb2JqZWN0LXRyYW5zZm9ybVxyXG4gICAgICAgIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycgKXtcclxuICAgICAgICAgICAgbXlMb2cuZXJyb3IoJ0luIFBheXJvbGxDb250cm9sbGVyLnRzLyB0cmFuc2Zvcm1Gcm9tU0JSLCBlbmNvdW50ZXJlZCBlcnJvcjogJywgYm9keSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHRmbiA9IGJvZHlbMTA5MzJdWzE2NTYwXSwgYWJuID0gYm9keVsxMDkzMl1bMjU0NDRdOyAgLy9nZXQgcGF5ZWUgaWRzXHJcbiAgICAgICAgY29uc3QgQ2xpZW50RXh0ZXJuYWxJZGVudGlmaWVyVHlwZSA9IHRmbiA/IFwiVEZOXCIgOiBcIkFCTlwiLCBDbGllbnRFeHRlcm5hbElkZW50aWZpZXJWYWx1ZSA9IHRmbiA/IHRmbiA6IGFibiwgQWNjb3VudFNlcXVlbmNlTnVtYmVyID0gMSAvKiB0aGlzIGlzIG15IGd1ZXNzKi8sIFJvbGVUeXBlU2hvcnREZWNvZGUgPSAnSVQnO1xyXG5cclxuICAgICAgICBsZXQgdXJsID0gdXJsQmFzZSArIFwiL0NsaWVudHMvXCIgKyBDbGllbnRFeHRlcm5hbElkZW50aWZpZXJUeXBlICsgXCIvXCIgKyBDbGllbnRFeHRlcm5hbElkZW50aWZpZXJWYWx1ZSArIFwiL0FjY291bnRzL1wiICsgQWNjb3VudFNlcXVlbmNlTnVtYmVyICsgXCIvUm9sZXMvXCIgKyBSb2xlVHlwZVNob3J0RGVjb2RlICsgXCIvRm9ybXMvMTAxMzFGb3JtL1wiICsgYm9keS5UcmFuc21pc3Npb24uQmV0TnVtYmVyO1xyXG4gICAgICAgIG15TG9nLmRlYnVnKCdwYXlSb2xsTWVzc2FnZUhhbmRsZXIgLSBhYm91dCB0byBjYWxsLi4uOicgKyB1cmwpO1xyXG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IGh0dHBJbnRlcmZhY2UoXCJCSVNCUlNUUFwiLCBcIklDU3RlcDItaHR0cFwiLCBwcm90b2NvbCwgaG9zdG5hbWUsIGxvY2FsUG9ydCwgaGVhZGVycywgJ1BVVCcsIHVybCwgYm9keSlcclxuICAgICAgICAgICAgLmNhdGNoKGFzeW5jIChlcnI6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbXlMb2cuZXJyb3IoJ0luIFBheXJvbGxDb250cm9sbGVyLnRzLyBjcmVhdGVMaXN0ZW5lciwgZW5jb3VudGVyZWQgZXJyb3I6ICcsIGVycik7XHJcbiAgICAgICAgICAgICAgICBjbG9zZUFNUVBDb25uZWN0aW9uKGNoYW5uZWwpO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDI1MCkpOyAgLy9JJ20sIHN1cmUgYSAxLzQgc2VjIHdhaXQgdG8gY2xvc2UgdGhhdCBjb25uZWN0aW9uIHdvbid0IGh1cnQuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLnNlbmQoXCJJbnRlcm5hbCBFcnJvciBlbmNvdW50ZXJlZCwgY2xvc2VkIEFNUVBMaXN0ZW5lciBlYXJseSwgbnVtYmVyIG9mIG1lc3NhZ2VzIHByb2Nlc3NlZDogXCIgKyBwYXlyb2xsTWVzc2FnZUNvdW50KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgbXlMb2cuZGVidWcoYHBheVJvbGxNZXNzYWdlSGFuZGxlciAtIHJlc3BvbnNlIHRvOiwgJHt1cmx9IHdhcyAke3Jlc3BvbnNlLnN0YXR1c0NvZGV9YCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbXlMb2cuZGVidWcoYHBheVJvbGxNZXNzYWdlSGFuZGxlciAtIEFib3V0IHdyaXRlIHJlc3BvbnNlICR7cmVzcG9uc2V9YCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgYXdhaXQgd3JpdGVSZXNwb25zZVRvUXVldWUoY2hhbm5lbCwgcmVzcG9uc2UpO1xyXG4gICAgICAgIGF3YWl0IGNoYW5uZWwuYWNrKG1zZyk7XHJcbiAgICAgICAgbXlMb2cuZGVidWcoYExlYXZpbmcgcGF5Um9sbE1lc3NhZ2VIYW5kbGVyIGZvciB0aGUgJHtwYXlyb2xsTWVzc2FnZUNvdW50fSB0aW1lYCk7XHJcbiAgICB9XHJcbiAgICAvL2Nsb3NlIGxpc3RlbmVyIGFmdGVyIDEgbWludXRlXHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBteUxvZy5kZWJ1ZygnQ2xvc2luZyBBTVFQQ29ubmVjdGlvbicpO1xyXG4gICAgICAgIGNsb3NlQU1RUENvbm5lY3Rpb24oY2hhbm5lbCk7XHJcblxyXG4gICAgICAgIG15TG9nLmRlYnVnKGBBYm91dCB3cmFwIHVwIGhlcmUsIHByb2Nlc3NlZCAke3BheXJvbGxNZXNzYWdlQ291bnR9IG1lc3NhZ2VzLCBzZW5kaW5nIGh0dHAgcmVzcG9uc2UuYCk7XHJcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoMjAxKS5zZW5kKFwiQ2xvc2VkIEFNUVBMaXN0ZW5lciwgbnVtYmVyIG9mIG1lc3NhZ2VzIHByb2Nlc3NlZDogXCIgKyBwYXlyb2xsTWVzc2FnZUNvdW50KTtcclxuICAgIH0sIGxpc3RlbmVyRHVyYXRpb24pO1xyXG5cclxuICAgIGF3YWl0IGFtcXBHZXRNZXNzYWdlcyhcIkJJU0JSU1RQXCIsIFwiSUNTdGVwMS1SZXF1ZXN0XCIsIHBheVJvbGxNZXNzYWdlSGFuZGxlcik7XHJcblxyXG4gICAgbXlMb2cuZGVidWcoJ3dhaXRpbmcuLi4nKTtcclxuXHJcbiAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgMTAwMCkpOyAgLy9naXZlIDEvMiBzZWMgZm9yIGNvbm5lY3Rpb24gdG8gY2xvc2VcclxuXHJcbiAgICBteUxvZy5kZWJ1ZygnZG9uZSB3YWl0aW5nIG9uZSBzZWMuLi4nKTtcclxuICAgIG15TG9nLmRlYnVnKGBMZWF2aW5nIGNyZWF0ZUxpc3RlbmVyIGFmdGVyICR7cGF5cm9sbE1lc3NhZ2VDb3VudH0gbWVzc2FnZXMsIHRoaXMgaXMgbm90IHNlbmRpbmcgaHR0cCByZXNwb25zZS5gKTtcclxufTtcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHBhcnNlWE1MUGF5bG9hZChwYXlyb2xsTWVzc2FnZTogQnVmZmVyKTogUHJvbWlzZTxbT2JqZWN0LCBPYmplY3Q/XT4ge1xyXG4gICAgdmFyIHBhcnNlciA9IG5ldyB4bWwyanMuUGFyc2VyKC8qIG9wdGlvbnMgKi8pO1xyXG4gICAgbGV0IGVycm9yID0gbnVsbDtcclxuICAgIGxldCB4bWwgPSBwYXlyb2xsTWVzc2FnZS50b1N0cmluZygpLnJlcGxhY2UoL3RuczovZ2ksICcnKTtcclxuICAgIGxldCBqc29uT2JqID0gYXdhaXQgcGFyc2VyLnBhcnNlU3RyaW5nUHJvbWlzZSh4bWwpXHJcbiAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICAgIGVycm9yID0gZXJyO1xyXG4gICAgICAgICAgICBteUxvZy5lcnJvcihcIkZhaWxlZCB0byBwYXJzZSB4bWwgcGF5bG9hZCB3aXRoIGVycm9yOlwiLCBlcnIpO1xyXG4gICAgICAgICAgICByZXR1cm4gW3t9LCBlcnJvcl07XHJcbiAgICAgICAgfSk7XHJcbiAgICBteUxvZy5kZWJ1ZyhcInBhcnNlWE1MUGF5bG9hZCByZXN1bHQgaXM6XCIsIEpTT04uc3RyaW5naWZ5KGpzb25PYmopKTtcclxuICAgIHJldHVybiBbanNvbk9ial07XHJcbn1cclxubGV0IGJpbmRpbmdQYXR0ZXJuOihzdHJpbmd8dW5kZWZpbmVkKT1cIkJJU0JSU1RQLklDU3RlcDMtUmVzcG9uc2VcIjtcclxuYXN5bmMgZnVuY3Rpb24gd3JpdGVSZXNwb25zZVRvUXVldWUoY2hhbm5lbDogQ2hhbm5lbCwgbXNnOiBhbnkpIHtcclxuICAgIG15TG9nLmRlYnVnKFwiSW5zaWRlIHdyaXRlUmVzcG9uc2VUb1F1ZXVlXCIpO1xyXG4gICAgbGV0IGRhdGEgPSBCdWZmZXIuZnJvbShKU09OLnN0cmluZ2lmeShtc2cpKTtcclxuICAgIGF3YWl0IGFtcXBTZW5kTWVzc2FnZShcIkJJU0JSU1RQXCIsIFwiSUNTdGVwMy1SZXNwb25zZVwiLCBkYXRhLCB1bmRlZmluZWQgLCBiaW5kaW5nUGF0dGVybik7XHJcbiAgICBiaW5kaW5nUGF0dGVybj11bmRlZmluZWQ7XHJcbn1cclxuXHJcbi8vIFVwc2VydHMgdGhlIFBheXJvbGwgc3BlY2lmaWVkIGluIHRoZSB1cmwgaW50byB0aGUgZGF0YWJhc2VcclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4cGVyaW1lbnQocmVxOiBleHByZXNzLlJlcXVlc3QsIHJlczogZXhwcmVzcy5SZXNwb25zZSwgbmV4dDogZXhwcmVzcy5OZXh0RnVuY3Rpb24pIHtcclxuICAgIGRlYnVnZ2VyO1xyXG4gICAgbXlMb2cuZGVidWcoXCJJbnNpZGUgZXhwZXJpbWVudFwiKTtcclxuXHJcbiAgICBjb25zdCBzYnJGb3JtID0gcmVxdWlyZSgnZnMnKS5yZWFkRmlsZVN5bmMoJy4vRmFjdFByb2Nlc3NpbmcvVGVzdHMvc2JyU1RQRm9ybS5qc29uJyk7XHJcbiAgICBjb25zdCBzYnJKc29uID0gSlNPTi5wYXJzZShzYnJGb3JtLnRvU3RyaW5nKCkpO1xyXG5cclxuICAgIGF3YWl0IGh0dHBJbnRlcmZhY2UoQnVzaW5lc3NJbnRlcmZhY2VQYXlyb2xsLCBcIklDPz8/P1wiLCByZXEucHJvdG9jb2wsIHJlcS5ob3N0bmFtZSwgcmVxLnNvY2tldC5sb2NhbFBvcnQsIHJlcS5oZWFkZXJzLCByZXEubWV0aG9kLCAgIHJlcS5vcmlnaW5hbFVybC5yZXBsYWNlKCcvUGF5cm9sbHN4eHgnLCAnL0Zvcm1zJyksIHNickpzb24pXHJcbiAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIHJlcy5zdGF0dXMocmVzcG9uc2Uuc3RhdHVzQ29kZSkuc2VuZChyZXNwb25zZS5ib2R5KTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaCgocmVhc29uKSA9PiB7XHJcbiAgICAgICAgICAgIG15TG9nLmVycm9yKFwiSW4gUGF5cm9sbENvbnRyb2xsZXIudHMvIHB1dFBheXJvbGwsIGVuY291bnRlcmVkIGZhaWx1cmUgcmVhc29uOlwiICsgcmVhc29uKTtcclxuICAgICAgICAgICAgcmVzLnN0YXR1cyg1MDApLnNlbmQoXCJJbnRlcm5hbCBFcnJvciBlbmNvdW50ZXJlZCAoMDAwNClcIik7XHJcbiAgICAgICAgfSk7XHJcbn07Il19
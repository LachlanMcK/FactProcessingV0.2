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
Object.defineProperty(exports, "__esModule", { value: true });
const myLog = __importStar(require("../../myLog"));
const express = __importStar(require("express"));
exports.router = express.Router({ mergeParams: true });
//import * as bodyParser from 'body-parser';
//import * as mongoose from 'mongoose';
myLog.debug("Inside mock checkAuthorisaitons");
exports.checkAuthorisation = function (req, res, next) {
    simulatedAMRestCall(req, res, next);
};
//I just wanted to illustrate what I think an AM ReST API would look like.
const rp = require('request-promise-native');
function simulatedAMRestCall(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        myLog.debug('Doing simulatedAMRestCall');
        try {
            let factsEndpoint = { resolveWithFullResponse: true }; //by default request-promise-native just returns the body
            //failing here because req.params not set
            factsEndpoint.url = req.protocol + "://" + req.hostname + ":" + req.socket.localPort + '/api/v1/Client/' + req.params.ClientIdentifierType + "/" + req.params.ClientIdentifierValue + "/Authorisations?Authorisations.securityPrincipleId=" + req.params.securityPrincipleId + "&Authorisations.resource=" + req.params.FormTypeMung;
            ;
            factsEndpoint.headers = req.headers;
            factsEndpoint.method = req.method;
            // factsEndpoint.method = 'GET'; ///don't want this
            myLog.info("About to out of process call to: " + factsEndpoint.url);
            let response = yield rp(factsEndpoint);
            if (response.statusCode !== 200)
                res.status(401).send("Not Authorised");
            else {
                req.params.clientInternalId = JSON.parse(response.body).clientInternalId;
            }
            next();
        }
        catch (error) {
            myLog.debug('In PayrollController.ts/ passThrough, encountered error: ' + error);
            res.status(500).send("Internal Error encountered");
        }
    });
}
exports.router.get('/api/v1/Clients/:ClientIdentifierType/:ClientIdentifierValue/Accounts/:AccountSequenceNumber/Roles/:RoleTypeShortDecode/Authorisations', overEngineeredMock);
exports.router.get('/api/v1/Clients/:ClientIdentifierType/:ClientIdentifierValue/Accounts/:AccountSequenceNumber/Roles/:RoleTypeShortDecode/PeriodStartDt/:PeriodStartDt/Authorisations', overEngineeredMock);
function overEngineeredMock(req, res, next) {
    myLog.debug('Doing overEngineeredMock: ', req.method);
    //GETs will check there is a relationship between the user and subject, hence necessary to resolve subject's internal id, so may as well pass that back
    if (req.method == 'GET')
        res.status(200).json({ clientInternalId: 1234 });
    //PUTs just need to check the user has a 'represents' a client with an Employer role; No need to resolve subject's identity.
    if (req.method == 'PUT')
        res.status(200).send({});
    if (req.method == 'DELETE')
        res.status(200).send({});
    //todo: replace this with a more complete solution
}
exports.overEngineeredMock = overEngineeredMock;
;
//module.exports = router;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja0NoZWNrQXV0aG9yaXNhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1vY2tDaGVja0F1dGhvcmlzYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbURBQXFDO0FBQ3JDLGlEQUFtQztBQUN4QixRQUFBLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7QUFDMUQsNENBQTRDO0FBQzVDLHVDQUF1QztBQUV2QyxLQUFLLENBQUMsS0FBSyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7QUFFL0MsT0FBTyxDQUFDLGtCQUFrQixHQUFHLFVBQVUsR0FBb0IsRUFBRSxHQUFxQixFQUFFLElBQTBCO0lBQzFHLG1CQUFtQixDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDeEMsQ0FBQyxDQUFDO0FBRUYsMEVBQTBFO0FBQzFFLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQzdDLFNBQWUsbUJBQW1CLENBQUMsR0FBb0IsRUFBRSxHQUFxQixFQUFFLElBQTBCOztRQUN0RyxLQUFLLENBQUMsS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUM7UUFDekMsSUFBSTtZQUNBLElBQUksYUFBYSxHQUFRLEVBQUUsdUJBQXVCLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyx5REFBeUQ7WUFFckgseUNBQXlDO1lBQ3pDLGFBQWEsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLFFBQVEsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDLFFBQVEsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsaUJBQWlCLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsR0FBRyxxREFBcUQsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLG1CQUFtQixHQUFHLDJCQUEyQixHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDO1lBQUMsQ0FBQztZQUN2VSxhQUFhLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUM7WUFFcEMsYUFBYSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO1lBQ2xDLG1EQUFtRDtZQUVuRCxLQUFLLENBQUMsSUFBSSxDQUFDLG1DQUFtQyxHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUVwRSxJQUFJLFFBQVEsR0FBRyxNQUFNLEVBQUUsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUV2QyxJQUFJLFFBQVEsQ0FBQyxVQUFVLEtBQUssR0FBRztnQkFDM0IsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztpQkFDdEM7Z0JBQ0QsR0FBRyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQzthQUM1RTtZQUNELElBQUksRUFBRSxDQUFDO1NBQ1Y7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNaLEtBQUssQ0FBQyxLQUFLLENBQUMsMkRBQTJELEdBQUcsS0FBSyxDQUFDLENBQUM7WUFDakYsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsQ0FBQztTQUN0RDtJQUNMLENBQUM7Q0FBQTtBQUVELGNBQU0sQ0FBQyxHQUFHLENBQUMsd0lBQXdJLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztBQUN6SyxjQUFNLENBQUMsR0FBRyxDQUFDLHFLQUFxSyxFQUFFLGtCQUFrQixDQUFDLENBQUM7QUFFdE0sU0FBZ0Isa0JBQWtCLENBQUMsR0FBb0IsRUFBRSxHQUFxQixFQUFFLElBQTBCO0lBQ3RHLEtBQUssQ0FBQyxLQUFLLENBQUMsNEJBQTRCLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3RELHVKQUF1SjtJQUN2SixJQUFJLEdBQUcsQ0FBQyxNQUFNLElBQUksS0FBSztRQUNuQixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDckQsNEhBQTRIO0lBQzVILElBQUksR0FBRyxDQUFDLE1BQU0sSUFBSSxLQUFLO1FBQ25CLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUcsQ0FBQyxDQUFDO0lBQzlCLElBQUksR0FBRyxDQUFDLE1BQU0sSUFBSSxRQUFRO1FBQ3RCLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUcsQ0FBQyxDQUFDO0lBQzlCLGtEQUFrRDtBQUN0RCxDQUFDO0FBWEQsZ0RBV0M7QUFBQSxDQUFDO0FBRUYsMEJBQTBCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgbXlMb2cgZnJvbSAnLi4vLi4vbXlMb2cnO1xyXG5pbXBvcnQgKiBhcyBleHByZXNzIGZyb20gJ2V4cHJlc3MnO1xyXG5leHBvcnQgdmFyIHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKHsgbWVyZ2VQYXJhbXM6IHRydWUgfSk7XHJcbi8vaW1wb3J0ICogYXMgYm9keVBhcnNlciBmcm9tICdib2R5LXBhcnNlcic7XHJcbi8vaW1wb3J0ICogYXMgbW9uZ29vc2UgZnJvbSAnbW9uZ29vc2UnO1xyXG5cclxubXlMb2cuZGVidWcoXCJJbnNpZGUgbW9jayBjaGVja0F1dGhvcmlzYWl0b25zXCIpO1xyXG5cclxuZXhwb3J0cy5jaGVja0F1dGhvcmlzYXRpb24gPSBmdW5jdGlvbiAocmVxOiBleHByZXNzLlJlcXVlc3QsIHJlczogZXhwcmVzcy5SZXNwb25zZSwgbmV4dDogZXhwcmVzcy5OZXh0RnVuY3Rpb24pIHtcclxuICAgIHNpbXVsYXRlZEFNUmVzdENhbGwocmVxLCByZXMsIG5leHQpO1xyXG59O1xyXG5cclxuLy9JIGp1c3Qgd2FudGVkIHRvIGlsbHVzdHJhdGUgd2hhdCBJIHRoaW5rIGFuIEFNIFJlU1QgQVBJIHdvdWxkIGxvb2sgbGlrZS5cclxuY29uc3QgcnAgPSByZXF1aXJlKCdyZXF1ZXN0LXByb21pc2UtbmF0aXZlJyk7XHJcbmFzeW5jIGZ1bmN0aW9uIHNpbXVsYXRlZEFNUmVzdENhbGwocmVxOiBleHByZXNzLlJlcXVlc3QsIHJlczogZXhwcmVzcy5SZXNwb25zZSwgbmV4dDogZXhwcmVzcy5OZXh0RnVuY3Rpb24pIHtcclxuICAgIG15TG9nLmRlYnVnKCdEb2luZyBzaW11bGF0ZWRBTVJlc3RDYWxsJyk7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGxldCBmYWN0c0VuZHBvaW50OiBhbnkgPSB7IHJlc29sdmVXaXRoRnVsbFJlc3BvbnNlOiB0cnVlIH07IC8vYnkgZGVmYXVsdCByZXF1ZXN0LXByb21pc2UtbmF0aXZlIGp1c3QgcmV0dXJucyB0aGUgYm9keVxyXG5cclxuICAgICAgICAvL2ZhaWxpbmcgaGVyZSBiZWNhdXNlIHJlcS5wYXJhbXMgbm90IHNldFxyXG4gICAgICAgIGZhY3RzRW5kcG9pbnQudXJsID0gcmVxLnByb3RvY29sICsgXCI6Ly9cIiArIHJlcS5ob3N0bmFtZSArIFwiOlwiICsgcmVxLnNvY2tldC5sb2NhbFBvcnQgKyAnL2FwaS92MS9DbGllbnQvJyArIHJlcS5wYXJhbXMuQ2xpZW50SWRlbnRpZmllclR5cGUgKyBcIi9cIiArIHJlcS5wYXJhbXMuQ2xpZW50SWRlbnRpZmllclZhbHVlICsgXCIvQXV0aG9yaXNhdGlvbnM/QXV0aG9yaXNhdGlvbnMuc2VjdXJpdHlQcmluY2lwbGVJZD1cIiArIHJlcS5wYXJhbXMuc2VjdXJpdHlQcmluY2lwbGVJZCArIFwiJkF1dGhvcmlzYXRpb25zLnJlc291cmNlPVwiICsgcmVxLnBhcmFtcy5Gb3JtVHlwZU11bmc7IDsgXHJcbiAgICAgICAgZmFjdHNFbmRwb2ludC5oZWFkZXJzID0gcmVxLmhlYWRlcnM7XHJcblxyXG4gICAgICAgIGZhY3RzRW5kcG9pbnQubWV0aG9kID0gcmVxLm1ldGhvZDtcclxuICAgICAgICAvLyBmYWN0c0VuZHBvaW50Lm1ldGhvZCA9ICdHRVQnOyAvLy9kb24ndCB3YW50IHRoaXNcclxuICAgICAgIFxyXG4gICAgICAgIG15TG9nLmluZm8oXCJBYm91dCB0byBvdXQgb2YgcHJvY2VzcyBjYWxsIHRvOiBcIiArIGZhY3RzRW5kcG9pbnQudXJsKTtcclxuXHJcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgcnAoZmFjdHNFbmRwb2ludCk7XHJcblxyXG4gICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXNDb2RlICE9PSAyMDApXHJcbiAgICAgICAgICAgIHJlcy5zdGF0dXMoNDAxKS5zZW5kKFwiTm90IEF1dGhvcmlzZWRcIik7XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJlcS5wYXJhbXMuY2xpZW50SW50ZXJuYWxJZCA9IEpTT04ucGFyc2UocmVzcG9uc2UuYm9keSkuY2xpZW50SW50ZXJuYWxJZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgbmV4dCgpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBteUxvZy5kZWJ1ZygnSW4gUGF5cm9sbENvbnRyb2xsZXIudHMvIHBhc3NUaHJvdWdoLCBlbmNvdW50ZXJlZCBlcnJvcjogJyArIGVycm9yKTtcclxuICAgICAgICByZXMuc3RhdHVzKDUwMCkuc2VuZChcIkludGVybmFsIEVycm9yIGVuY291bnRlcmVkXCIpO1xyXG4gICAgfVxyXG59XHJcblxyXG5yb3V0ZXIuZ2V0KCcvYXBpL3YxL0NsaWVudHMvOkNsaWVudElkZW50aWZpZXJUeXBlLzpDbGllbnRJZGVudGlmaWVyVmFsdWUvQWNjb3VudHMvOkFjY291bnRTZXF1ZW5jZU51bWJlci9Sb2xlcy86Um9sZVR5cGVTaG9ydERlY29kZS9BdXRob3Jpc2F0aW9ucycsIG92ZXJFbmdpbmVlcmVkTW9jayk7XHJcbnJvdXRlci5nZXQoJy9hcGkvdjEvQ2xpZW50cy86Q2xpZW50SWRlbnRpZmllclR5cGUvOkNsaWVudElkZW50aWZpZXJWYWx1ZS9BY2NvdW50cy86QWNjb3VudFNlcXVlbmNlTnVtYmVyL1JvbGVzLzpSb2xlVHlwZVNob3J0RGVjb2RlL1BlcmlvZFN0YXJ0RHQvOlBlcmlvZFN0YXJ0RHQvQXV0aG9yaXNhdGlvbnMnLCBvdmVyRW5naW5lZXJlZE1vY2spO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG92ZXJFbmdpbmVlcmVkTW9jayhyZXE6IGV4cHJlc3MuUmVxdWVzdCwgcmVzOiBleHByZXNzLlJlc3BvbnNlLCBuZXh0OiBleHByZXNzLk5leHRGdW5jdGlvbikge1xyXG4gICAgbXlMb2cuZGVidWcoJ0RvaW5nIG92ZXJFbmdpbmVlcmVkTW9jazogJywgcmVxLm1ldGhvZCk7XHJcbiAgICAvL0dFVHMgd2lsbCBjaGVjayB0aGVyZSBpcyBhIHJlbGF0aW9uc2hpcCBiZXR3ZWVuIHRoZSB1c2VyIGFuZCBzdWJqZWN0LCBoZW5jZSBuZWNlc3NhcnkgdG8gcmVzb2x2ZSBzdWJqZWN0J3MgaW50ZXJuYWwgaWQsIHNvIG1heSBhcyB3ZWxsIHBhc3MgdGhhdCBiYWNrXHJcbiAgICBpZiAocmVxLm1ldGhvZCA9PSAnR0VUJykgXHJcbiAgICAgICAgcmVzLnN0YXR1cygyMDApLmpzb24oeyBjbGllbnRJbnRlcm5hbElkOiAxMjM0IH0pO1xyXG4gICAgLy9QVVRzIGp1c3QgbmVlZCB0byBjaGVjayB0aGUgdXNlciBoYXMgYSAncmVwcmVzZW50cycgYSBjbGllbnQgd2l0aCBhbiBFbXBsb3llciByb2xlOyBObyBuZWVkIHRvIHJlc29sdmUgc3ViamVjdCdzIGlkZW50aXR5LlxyXG4gICAgaWYgKHJlcS5tZXRob2QgPT0gJ1BVVCcpXHJcbiAgICAgICAgcmVzLnN0YXR1cygyMDApLnNlbmQoeyB9KTtcclxuICAgIGlmIChyZXEubWV0aG9kID09ICdERUxFVEUnKVxyXG4gICAgICAgIHJlcy5zdGF0dXMoMjAwKS5zZW5kKHsgfSk7XHJcbiAgICAvL3RvZG86IHJlcGxhY2UgdGhpcyB3aXRoIGEgbW9yZSBjb21wbGV0ZSBzb2x1dGlvblxyXG59O1xyXG5cclxuLy9tb2R1bGUuZXhwb3J0cyA9IHJvdXRlcjtcclxuIl19
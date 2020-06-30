import * as myLog from '../../myLog';
import * as express from 'express';
export var router = express.Router({ mergeParams: true });
//import * as bodyParser from 'body-parser';
//import * as mongoose from 'mongoose';

myLog.debug("Inside mock checkAuthorisaitons");

exports.checkAuthorisation = function (req: express.Request, res: express.Response, next: express.NextFunction) {
    simulatedAMRestCall(req, res, next);
};

//I just wanted to illustrate what I think an AM ReST API would look like.
const rp = require('request-promise-native');
async function simulatedAMRestCall(req: express.Request, res: express.Response, next: express.NextFunction) {
    myLog.debug('Doing simulatedAMRestCall');
    try {
        let factsEndpoint: any = { resolveWithFullResponse: true }; //by default request-promise-native just returns the body

        //failing here because req.params not set
        factsEndpoint.url = req.protocol + "://" + req.hostname + ":" + req.socket.localPort + '/api/v1/Client/' + req.params.ClientIdentifierType + "/" + req.params.ClientIdentifierValue + "/Authorisations?Authorisations.securityPrincipleId=" + req.params.securityPrincipleId + "&Authorisations.resource=" + req.params.FormTypeMung; ; 
        factsEndpoint.headers = req.headers;

        factsEndpoint.method = req.method;
        // factsEndpoint.method = 'GET'; ///don't want this
       
        myLog.info("About to out of process call to: " + factsEndpoint.url);

        let response = await rp(factsEndpoint);

        if (response.statusCode !== 200)
            res.status(401).send("Not Authorised");
        else {
            req.params.clientInternalId = JSON.parse(response.body).clientInternalId;
        }
        next();
    } catch (error) {
        myLog.debug('In PayrollController.ts/ passThrough, encountered error: ' + error);
        res.status(500).send("Internal Error encountered");
    }
}

router.get('/api/v1/Clients/:ClientIdentifierType/:ClientIdentifierValue/Accounts/:AccountSequenceNumber/Roles/:RoleTypeShortDecode/Authorisations', overEngineeredMock);
router.get('/api/v1/Clients/:ClientIdentifierType/:ClientIdentifierValue/Accounts/:AccountSequenceNumber/Roles/:RoleTypeShortDecode/PeriodStartDt/:PeriodStartDt/Authorisations', overEngineeredMock);

export function overEngineeredMock(req: express.Request, res: express.Response, next: express.NextFunction) {
    myLog.debug('Doing overEngineeredMock: ', req.method);
    //GETs will check there is a relationship between the user and subject, hence necessary to resolve subject's internal id, so may as well pass that back
    if (req.method == 'GET') 
        res.status(200).json({ clientInternalId: 1234 });
    //PUTs just need to check the user has a 'represents' a client with an Employer role; No need to resolve subject's identity.
    if (req.method == 'PUT')
        res.status(200).send({ });
    if (req.method == 'DELETE')
        res.status(200).send({ });
    //todo: replace this with a more complete solution
};

//module.exports = router;

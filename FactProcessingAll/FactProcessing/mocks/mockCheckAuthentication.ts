import * as myLog from '../../myLog';
import * as express from 'express';
myLog.debug("Inside mockcheckAuthentication");
let baseCheckAuthentication: any; //I wonder if I can turn NodeModule;

export const base = function (_baseCheckAuthentication: any):any {
    baseCheckAuthentication = _baseCheckAuthentication;
    return checkAuthentication;
}

export const checkAuthentication = function (req: express.Request, res: express.Response, next: express.NextFunction) {
    let atoIDPAccessToken = {
        clientInternalId: 1234,
        clientExternalIdentifier: {
            type: 'ABN',
            value: '1234567890'
        }
    }

    req.headers['atoIdpAccessToken'] = JSON.stringify(atoIDPAccessToken);

    baseCheckAuthentication(req, res, next);
    //next is called by parent.
};
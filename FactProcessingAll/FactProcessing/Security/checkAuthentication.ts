import * as myLog from '../../myLog';
import * as express from 'express';
 
myLog.debug("Inside checkAuthentication, runtimeEnvironment: " + (process.env.runtimeEnvironment || "") + " mockAuthzModule: " + (process.env.mockAuthnModule || "") );

//Architectural Decision:
//  It is expected this solution will sit behind an API gateway (maybe the AWS API Gateway).  The API consumer will
//  get a "transparent" OAuth token from the ATO IDP prior to invoking the API.  The gateway will talk to ISF to validate
//  the token.  So, authentication will take place upstream.
//  
//  It is expected all this module will need to do is access the transparent acccess token to extract the 
//  security principles identity.

//  ToDo: Agree with DCIS full defintion of atoIDPAccessToken and reference it here.
//        In the meantime, this defintion will do.
interface atoIDPAccessToken {
    clientExternalIdentifier?: {
        Type: string;
        Value: string;
    }
    clientInternalId?: string;
}  

export let checkAuthentication = function (req: express.Request, res: express.Response, next: express.NextFunction) {

    req.params.securityPrincipleId = <string> (JSON.parse( (req.headers['atoIdpAccessToken'] || "{}" ) as string) as atoIDPAccessToken).clientInternalId;
    
    next();
};

//Naturally don't allow mocks in 'PROD' enviornment
//Restrict mocks to coming from predetermined mock folder
//Mock will replace checkAuthentication, assume all it will do is populate atoIdpAccessToken header property
if ((process.env.runtimeEnvironment || 'unknown') !== 'PROD' && process.env.mockAuthnModule)
    checkAuthentication = require('../mocks/' + process.env.mockAuthnModule as string).base(checkAuthentication); 

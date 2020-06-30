import * as myLog from '../../myLog';
myLog.debug("Inside checkAuthorisaitons, runtimeEnvironment: " + (process.env.runtimeEnvironment || "")  + " mockAuthzModule: " + (process.env.mockAuthzModule || "") );

import * as express from 'express';

export var checkAuthorisation= function (req: express.Request, res: express.Response, next: express.NextFunction) {
    console.log("AM goes here - checks that the security principle (user) can act on subject (identified in the URI), I assume will call existing AM MQ API");

    const user = req.params.securityPrincipleId;
    const URI = req.originalUrl;

    //make MQ call to AM passing user & URI.  AM will do:
    //-verifySubjectClientLinks check that does:
    //  - a relationship existence check between the securityPrinciple (user) & URI (which embeds both the subject client & protected resource being accessed)

    //one day this MQ call may be turned into a ReST call.

    next();
};

//Restrict mocks to coming from predetermined mock folder
//Mock will replace checkAuthentication, assume all it will do is populate atoIdpAccessToken header property
if ((process.env.runtimeEnvironment || 'unknown') !== 'PROD' && process.env.mockAuthzModule) 
    checkAuthorisation = require('../mocks/' + process.env.mockAuthzModule as string).checkAuthorisation;
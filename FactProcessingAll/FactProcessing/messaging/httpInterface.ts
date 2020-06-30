import * as myLog from '../../myLog';
import { IncomingHttpHeaders } from 'http'
import {incrementBPCCount} from './bulkProcessControl';

const reqPromise = require('request-promise-native');
//todo: suspsect request-promise-native is depricated so investigate alternative, https://github.com/request/request/issues/3143, e.g. https://www.npmjs.com/package/node-fetch

export async function httpInterface(BI: String, IC: String, protocol: string = 'http', hostName: string = 'ato.gov.au', localPort: number = 3000, headers: IncomingHttpHeaders, method: string, url: string, body?: Object) {
    //reqPromise.debug = true;

    incrementBPCCount(BI + '.' + IC, url, body);

    try {
        let endpointDetails: any = { resolveWithFullResponse: true }; //by default request-promise-native just returns the body
        endpointDetails.url = protocol + "://" + hostName + ":" + localPort + url;
        endpointDetails.headers = headers;
        delete endpointDetails.headers["content-length"];
        endpointDetails.method = method
        if (method == 'PUT') {
            endpointDetails.body = body;
            endpointDetails.json = true;
        }

        myLog.debug("httpInterface - about to out of process call to: " + endpointDetails.url);
        myLog.debug("   headers: " + JSON.stringify(endpointDetails.headers));
        myLog.debug("   method: " + endpointDetails.method);
        myLog.debug("   body (start): " + JSON.stringify(endpointDetails.body || {}).substr(0, 80));

        let response = await reqPromise(endpointDetails);
        myLog.debug("httpInterface - response status code:" + response.statusCode);
        myLog.log(response);
        return response;
    }
    catch (error) {
        if (!(error.statusCode == 404 || error.statusCode == 304 || error.statusCode == 409 || error.statusCode == 500))
            myLog.error('In httpInterface.ts/ httpInterface, encountered unexpected error: ', error);
        return error.response;
    }
}
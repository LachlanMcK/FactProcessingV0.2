import * as myLog from '../../../myLog';
export const formMetaData = {};
export const formDef = {};
export const FormType = 'bulkTransmission', businessRulesLanguage = "", wireFormat = "JSRE";;

const schema = {};

const byId = {};

const byName = {};

export const lineItemsSchema_FormSpecific = schema, formMetaDataById = byId, formMetaDataByName = byName;


myLog.debug("Additional " + FormType + " line items schema definition " + JSON.stringify(lineItemsSchema_FormSpecific));

export function addToFormSpecificIdentityCriteria(identityCriteria: any, req: any, res: any): object {
    return identityCriteria;
}

export function confirmCanTakeIdentityFromPriorLodgment(FormTypeMung: string, req: any, foundForm: any, res: any): any {
    //because we found a matched form for corresponding details, we can make this form matched
    if (req.body.ClientInternalId && req.body.ClientInternalId > 0)
        req.body.subjectClient.MatchingStatus = "Matched";
    else
        req.body.subjectClient.MatchingStatus = "UnMatched";

    myLog.debug(`Client Internal Id ${JSON.stringify(req.body.ClientInternalId)}`);
    return req;
}

export async function postPutPreReturnHook(formTypeMung: string, req: any, res: any) {
    myLog.debug("Will do form specific fiddling here");
    return;
}

export async function decideWhatToPutInPrefill(formTypeMung: string, req: any, res: any) {
    myLog.debug("Will do form specific repliation here");
    return;
}

export async function bulkTransmissionTracking(formTypeMung: string, req: any, res: any, meaningfulNameForm: any): Promise<{ lookupFilter: any, upsertBody: any, schema:any  } | null> {
    return null;
}
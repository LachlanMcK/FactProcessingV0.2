import * as myLog from '../../../myLog';
export const formMetaData = {};
export const formDef = {};
export const FormType = 'prefillIITR', businessRulesLanguage = "", wireFormat = "";;

export const lineItemsSchema_FormSpecific = {}, formMetaDataById = {}, formMetaDataByName = {};

myLog.debug("Additional " + FormType + " line items schema definition " + JSON.stringify(lineItemsSchema_FormSpecific));

export function addToFormSpecificIdentityCriteria(identityCriteria: any, req: any, res: any): object {
    return identityCriteria;
}

export function confirmCanTakeIdentityFromPriorLodgment(FormTypeMung: string, req: any, foundForm: any, res: any): any {
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
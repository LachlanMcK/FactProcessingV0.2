import * as myLog from '../../../myLog';
myLog.debug('Inside FormIdentityValidator');
import { formQueryType } from '../FormURL2Query';

import * as mongoose from 'mongoose';
interface formSpecificFunctions {
    lineItemsSchema_FormSpecific: mongoose.Schema,
    addToFormSpecificIdentityCriteria: (identityCriteria: any, req: any, res: any) => Object,
    formLookupForIdentityUpdate: (req: any, res: any) => Object,
    confirmCanTakeIdentityFromPriorLodgment: (FormTypeMung: string, req: any, foundForm: any, res: any) => any,
    postPutPreReturnHook: (formTypeMung: string, req: any, res: any) => any,
    decideWhatToPutInPrefill: (formTypeMung: string, meaningfulNameForm: any) => any, // {preFillFormTypeMung:string, preFillSchema:any, preFillLookup:Object,  prefillUpdatePayload:Object },
    bulkTransmissionTracking: (formTypeMung: string, req: any, res: any, meaningfulNameForm: any) => any, //{lookup:string, update:string}
    formMetaData: any, formMetaDataById: any, formMetaDataByName: any, FormType: string
    businessRulesLanguage: string, wireFormat: string
};
export var formSpecific: { [index: string]: formSpecificFunctions } = {};

export let formMetaData: any, formMetaDataById: any, formMetaDataByName: any, lineItemsSchema_FormSpecific: mongoose.Schema, businessRulesLanguage: string, wireFormat: string;

export function getFactSpecificStuff(formTypeMung: string, next: any) {

    myLog.debug("Loading form specific stuff for " + formTypeMung);
    import("./UniqueFormRules_" + formTypeMung)
        .then((m: formSpecificFunctions) => {
            myLog.debug("Have loaded form specific stuff for " + formTypeMung);
            formSpecific[formTypeMung] = m;

            formMetaData = m.formMetaData;
            formMetaDataById = m.formMetaDataById;
            formMetaDataByName = m.formMetaDataByName;
            // priorLodgmentLookup = formSpecific.priorLodgmentLookup;
            // formIdLookup = formSpecific.formIdLookup;
            // confirmCanTakeIdentityFromPriorLodgment = formSpecific.confirmCanTakeIdentityFromPriorLodgment;

            lineItemsSchema_FormSpecific = m.lineItemsSchema_FormSpecific;
            businessRulesLanguage = m.businessRulesLanguage;
            wireFormat = m.wireFormat;
            next();
        }).catch((reason) => {
            myLog.error("Module load failed, because" + reason + " will try to carry on.");
            next();
        });
}
export function getPriorLodgmentLookupCriteria(formTypeMung: string, req: any, res: any): formQueryType {
    if (!formSpecific || !formSpecific[formTypeMung]) myLog.error('Curious', formSpecific);
    let identityCriteria = addCommonIdentityCriteria({ FormType: formSpecific[formTypeMung].FormType }, req, res);
    formSpecific[formTypeMung].addToFormSpecificIdentityCriteria(identityCriteria, req, res);

    return identityCriteria;
}

function addCommonIdentityCriteria(identityCriteria: any, req: any, res: any) {
    if (req.body.ClientInternalId)
        identityCriteria.ClientInternalId = req.body.ClientInternalId;
    else {
        identityCriteria = universalIdentityCriteria(identityCriteria, res);
    }
    return identityCriteria;
}

export function identityLookupCriteria(formTypeMung: string, req: any, res: any): formQueryType {
    if (!formSpecific || !formSpecific[formTypeMung]) myLog.error('Curious', formSpecific);
    let identityCriteria = universalIdentityCriteria({ FormType: formSpecific[formTypeMung].FormType }, res);
    formSpecific[formTypeMung].addToFormSpecificIdentityCriteria(identityCriteria, req, res);
    identityCriteria["subjectClient.MatchingStatus"] = "UnMatched";
    return identityCriteria;
}

function universalIdentityCriteria(identityCriteria: any, res: any) {
    identityCriteria['subjectClient.ClientIdentifierType'] = res.locals.lookup['subjectClient.ClientIdentifierType'];
    identityCriteria['subjectClient.ClientIdentifierValue'] = res.locals.lookup['subjectClient.ClientIdentifierValue'];
    identityCriteria['subjectClient.MatchingStatus'] = "Matched";
    return identityCriteria;
}

//Confirm that identity info on the new form matches info from the retrieved form
export function confirmCanTakeIdentityFromPriorLodgment(formTypeMung: string, req: any, foundForm: any, res: any): any {
    if (!req.body.ClientInternalId) req.body.ClientInternalId = foundForm.ClientInternalId;
    else {
        res.locals.lookup.ClientInternalId = req.body.ClientInternalId;  //use client internal id by preference
        delete res.locals.lookup.ClientIdentifierType;
        delete res.locals.lookup.ClientIdentifierValue;
    }
    formSpecific[formTypeMung].confirmCanTakeIdentityFromPriorLodgment(formTypeMung, req, foundForm, res);
    myLog.debug('Prior lodgemnt lookup result: ' + req.body.subjectClient.MatchingStatus + " with client internal id: " + req.body.ClientInternalId)
    myLog.debug("After Prior lodgment lookup the body looks like: " + JSON.stringify(req.body).substr(0, 150));
}

export async function postPutPreReturnHook(formTypeMung: string, req: any, res: any) {
    myLog.debug("Will do form specific fiddling here");
    return;
}

export async function decideWhatToPutInPrefill(formTypeMung: string, meaningfulNameForm: any): Promise<{ prefillLookup: any, prefillInsert: Object, prefillUpdate: Object }[]> {
    myLog.debug("Will do form specific repliation here", formTypeMung);
    let x = formSpecific[formTypeMung].decideWhatToPutInPrefill(formTypeMung, meaningfulNameForm);
    return x;
}

export async function bulkTransmissionTracking(formTypeMung: string, req: any, res: any, meaningfulNameForm: any): Promise<{ lookupFilter: any, upsertBody: any, schema:any } | null> {
    myLog.debug("Seeing if need to upate File Counts for:", formTypeMung);
    return formSpecific[formTypeMung].bulkTransmissionTracking(formTypeMung, req, res, meaningfulNameForm);
}
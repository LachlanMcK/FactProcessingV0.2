import * as myLog from '../../myLog';
import * as express from 'express';
myLog.debug('Inside FormController');
export var router = express.Router();
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';

import { formQueryType, turnURLStemsIntoLookupObject } from './FormURL2Query';

import { Form, setFootprintProperties, FormDef, HistoryForm, PreFillForm, BaseForm } from './Form';
import { transformLegacyStorageToWireFormat, transformMeaningfulStorageToJSREWireFormat, transformFromLegacyJSREToStorageFormat_old, transformFromLegacyJSREToExplicitStorageFormat } from "./transformWireFormat";

import { getFactSpecificStuff, lineItemsSchema_FormSpecific, getPriorLodgmentLookupCriteria, confirmCanTakeIdentityFromPriorLodgment, formMetaDataByName, formMetaData, formMetaDataById, identityLookupCriteria, postPutPreReturnHook, decideWhatToPutInPrefill, bulkTransmissionTracking, businessRulesLanguage, wireFormat } from "./factSpecific/factSpecificPlugin";
// *****************************************************************************
// invoke middleware functions - express ceremony
// *****************************************************************************
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.use(function (req: any, res: any, next: any) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

router.use(function (req: any, res: any, next: any) {
    myLog.debug(`in FormController.ts/use, ${req.url}, ${req.method}, ${req.body}`);
    next();
})

// *****************************************************************************
// register the routes offered in this controller
// *****************************************************************************
// I tried to hide  the messsiness of setting up Form Routes in ./setupformroutes
// getForms & putForms are the functions that will be called respectively
// but I found different behaviour between registering the route here on in the submodule.
import * as FormRoutes from './SetUpFormRoutes';
import { networkInterfaces } from 'os';

var getMiddleware = [get_put_ExtractURLStemInfo, loadFactSpecificStuff]
var putMiddleware = [get_put_ExtractURLStemInfo, loadFactSpecificStuff, getIdFromPriorMatchedLodgment, put_SetFootprintProps, put_JSREValidationRules, put_EncryptSensitiveData]

FormRoutes.setUpFormRoutes(router);
FormRoutes.formRoutes.forEach((r) => {
    router.get(r, getMiddleware, getForms);
    router.put(r, putMiddleware, putForm);
    router.put(r, /* putMoreMiddleware, */ putApplyUpdateRules);
});

// a couple extras
router.get('/All/Forms', getAllFormsTestingUseOnly);
router.delete('/:ClientIdentifierType/:ClientIdentifierValue/Forms/:FormTypeMung/:TransactionId', [loadFactSpecificStuff], deleteForm);
router.delete('/:ClientIdentifierType/:ClientIdentifierValue/Forms/:FormTypeMung/_id/:_id', [loadFactSpecificStuff], deleteForm);
router.get('/:ClientIdentifierType/:ClientIdentifierValue/FormIdentity/:FormTypeMung', [get_put_ExtractURLStemInfo, loadFactSpecificStuff], getFormIdentity);
router.put('/:ClientIdentifierType/:ClientIdentifierValue/FormIdentity/:FormTypeMung', [get_put_ExtractURLStemInfo, loadFactSpecificStuff], putFormIdentity);
router.get('/:ClientIdentifierType/:ClientIdentifierValue/FormsHistory/:TransactionId', getFormsHistory);
router.get('/FormsHistory/:TransactionId', getFormsHistory);

//not yet implemented
router.delete('/:ClientIdentifierType/:ClientIdentifierValue/:TransactionId/:DT_Update/:TM_Update', cancelFile);
router.delete('/:ClientIdentifierType/:ClientIdentifierValue/:TransactionId/:DT_Update', cancelFile);
router.delete('/:ClientIdentifierType/:ClientIdentifierValue/:TransactionId', cancelFile);

//need to validate uniqueness of supplier reference and either error or warn
//ToDo: List Facts by Transmission & Position & fact type
//todo: file & record duplicate checks (dup file: 1) external reference number; 2) cac/year/reporter/derived+rejected count - where not rejected. record: ??)
//todo: replace file
//todo: amend file
//todo: detect if all messages from a file (transmission/collection) have been received and processed (within a time period)
//todo: archive
//todo: transfer identity
//todo: decide for what errors to create work items (maybe at product level)
//todo: possibly need bulk load mechanism that bypasses jsre for loading of processed data from CIDC
//todo: need a service to send message to MCID to transfer client.
//todo: write usage log - bi8550 - or is this left to the DSG to handle??
//todo: extend retention period
//todo: override JSRE at form unique level
//todo: add mqtt support: http://www.steves-internet-guide.com/using-node-mqtt-client/ 
//todo: implement support for http header Accept
//todo: check against Rest Std response codes
//todo: check IF-MODIFIED-SINCE header (possible 304 return code)
//todo: 400 & 422 if failed validation errors
//todo: check accept, content-type  is application/json;Version=1
//todo: check out content-encoding gzip
//todo: filter data items based on config data if there is data quality issues - req. from Ian taylor.


// I have deliberately left out Post.  I can't see the use case for it; 
// but this implies consumers must allocate BET numbers for new forms 
// (nothing wrong with that - as long as they follow our rules);
// but perhaps I don't understand some of the DraftForm usecases.
// anyway, not available yet - code below not tested
// router.post('/:ClientIdentifierType/:ClientIdentifierValue/Forms/:FormTypeMung', createForm);

// import * as core from "express-serve-static-core";
// declare namespace express {
//     interface Request<P extends core.Params = core.ParamsDictionary> extends core.Request<P> { }
// }


// *****************************************************************************
// Get Middleware
// *****************************************************************************
function get_put_ExtractURLStemInfo(req: express.Request, res: express.Response, next: express.NextFunction) {
    myLog.debug('in FormController/ get_put_ExtractURLStemInfo, originalUrl :', req.originalUrl)
    res.locals.lookup = <any>turnURLStemsIntoLookupObject(req, next);

    if (req.body && (req.method == "PUT" || req.method == "POST")) {
        //i.e req.method =="PUT" || "POST"
        if (!req.body.subjectClient) req.body.subjectClient = { MatchingStatus: "UnMatched" };  //default to unmatched until file id from prior lodgment or id match result
        req.body.subjectClient.ClientIdentifierType = (<any>res.locals.lookup)["subjectClient.ClientIdentifierType"];
        req.body.subjectClient.ClientIdentifierValue = (<any>res.locals.lookup)["subjectClient.ClientIdentifierValue"];

        delete req.body.TransactionId; //this should come from the URI, not be in body.

        // Hmm, So it is possible to use the findOneAndUpdate with the upsert option it is necessary to make Insert & Update the same, so DT/TM Update are mandatory.
        if (req.originalUrl.indexOf("\/FormIdentity\/") < 0 && (!req.body.DT_Update || !req.body.TM_Update))
            throw new Error("Missing footprint property DT_Update or TM_Update.");

        (<formQueryType>res.locals.lookup).DT_Update = req.body.DT_Update;
        (<formQueryType>res.locals.lookup).TM_Update = req.body.TM_Update;
    }
    next()
}

//This loads any form specific stuff code.
//
//lineItemsSchema_FormSpecific
//The BaseForm schema has an array of Sections which contain an array of LineItems
//This adds specific line items with meaningful names to the schema (as well as virtual alias with just the 5 digit identifier)
async function loadFactSpecificStuff(req: any, res: any, next: any) {
    getFactSpecificStuff(req.params.FormTypeMung, next);
}

// *****************************************************************************
// Get Methods
// *****************************************************************************
// RETURNS ALL THE FORMS IN THE DATABASE
function getAllFormsTestingUseOnly(req: any, res: any) {
    myLog.debug('Inside FormController.ts/getAllFormsTestingUseOnly');

    Form("").find({}, function (err: mongoose.Error, forms: mongoose.Document[]) {
        myLog.debug('getAllFormsTestingUseOnly:', (err || "No errors, found " + (forms ? forms.length : "no") + " forms"));
        if (err) return res.status(500).send("There was a problem finding the forms.");
        myLog.log(forms);

        res.status(200).send(forms);
    });
};


// RETURNS ALL THE FORMS IN THE DATABASE THAT MATCH THE URL
export function getForms(req: express.Request, res: express.Response, next: express.NextFunction) {
    myLog.debug("In FormController.ts/getForms");

    Form(req.params.FormTypeMung, lineItemsSchema_FormSpecific).find(<any>res.locals.lookup, function (err: any, forms: any) {
        myLog.debug('getForms:', (err || "No errors, found " + (forms ? forms.length : "no") + " forms"));
        if (err) return res.status(500).send("There was a problem finding the forms.");
        myLog.log(forms);

        if (!forms) return res.status(404).send("No form found.!!");

        //todo: restify the response
        //todo: decrypt line items

        if ((forms || []).length == 0) return res.status(404).send("No form found.");

        let result: any = [];
        forms.forEach((f: any) => result.push(transformMeaningfulStorageToJSREWireFormat(f._doc, formMetaDataByName)));

        res.status(200).send(result);
    });
};

//I can't think of any use of this 
export function getFormIdentity(req: express.Request, res: express.Response, next: express.NextFunction) {
    myLog.debug('Inside FormController.ts/getFormIdentity');

    Form(req.params.FormTypeMung, lineItemsSchema_FormSpecific).find(<Object>res.locals.lookup, function (err: mongoose.Error, forms: mongoose.Document[]) {
        myLog.debug('getFormIdentity:', (err || "No errors, found " + (forms ? forms.length : "no") + " forms"));
        if (err) return res.status(500).send("There was a problem finding the forms with requested form identity.");
        myLog.log(forms);

        if ((forms || []).length == 0) return res.status(404).send("No FormIdentitys found.");
        else res.status(200).send(forms);
    });
};

//Get history
export function getFormsHistory(req: express.Request, res: express.Response, next: express.NextFunction) {
    myLog.debug('Inside FormController.ts/getFormsHistory');

    res.locals.lookup = {};
    if (req.params.TransactionId) res.locals.lookup.TransactionId = parseInt(req.params.TransactionId);
    if (req.params.DT_Update) res.locals.lookup.DT_Update = new Date(req.params.DT_Update).toLocaleDateString();
    if (req.params.TM_Update) res.locals.lookup.TM_Update = new Date(req.params.TM_Update).toLocaleTimeString();
    if (req.params.ClientIdentifierType && req.params.ClientIdentifierValue) {
        res.locals.lookup['history.subjectClient.ClientIdentifierType'] = req.params.ClientIdentifierType;
        res.locals.lookup['history.subjectClient.ClientIdentifierValue'] = parseInt(req.params.ClientIdentifierValue);
    }

    myLog.debug('About to look for history with:', res.locals.lookup);
    HistoryForm.find(<Object>res.locals.lookup, function (err: mongoose.Error, forms: mongoose.Document[]) {
        myLog.debug('getFormsHistory:', (err || "No errors, found " + (forms ? forms.length : "no") + " forms"));
        if (err) return res.status(500).send("There was a problem finding the forms with requested form identity.");
        myLog.log(forms);

        if ((forms || []).length == 0) return res.status(404).send("No FormIdentitys found.");
        else res.status(200).send(forms);
    });
};
// *****************************************************************************
// Put Middleware
// *****************************************************************************
function getIdFromPriorMatchedLodgment(req: any, res: any, next: any) {
    myLog.debug('In FormController.ts/ getIdFromPriorMatchedLodgment, ' + req.url, req.params.ClientInternalId);

    if (req.params.ClientInternalId)
        return next(); //Client Internal Id may be known from upstream process, e.g. authorisation checks, in which case no need to lookup from pervious lodgment

    try {
        const priorLodgmentLookupCriteria = getPriorLodgmentLookupCriteria(req.params.FormTypeMung, req, res);
        myLog.debug(`Looking for prior lodgments with: ${JSON.stringify(priorLodgmentLookupCriteria)}`);

        if (!req.body.subjectClient) req.body.subjectClient = {}
        req.body.subjectClient.MatchingStatus = "UnMatched";

        myLog.debug(`The body contains: ${JSON.stringify(req.body).substr(0, 100)}...`);
        myLog.log(`Using addtional ${req.params.FormTypeMung} form line item schema: ` + JSON.stringify(lineItemsSchema_FormSpecific));

        myLog.debug("+++++++++++ about to talk to Mongo ++++++++++++++++");
        Form(req.params.FormTypeMung, lineItemsSchema_FormSpecific).findOne(<any>priorLodgmentLookupCriteria, function (err: any, foundForm: any) {
            myLog.debug('getIdFromPriorMatchedLodgment:', (err || "No errors, " + (foundForm ? "Prior lodgement with " + foundForm.TransactionId + " tran id found" : "no prior lodgments found")));
            if (err) return res.status(500).send("There was a problem getting matching status for client.");
            myLog.log(foundForm);

            if (foundForm)
                confirmCanTakeIdentityFromPriorLodgment(req.params.FormTypeMung, req, foundForm, res);
            else
                if (req.body.ClientInternalId) {
                    myLog.debug(`Fatal Error: Cannot include ClientInternal Id in request.body if there is no prior "Matched" lodgment with that id (${req.body.ClientInternalId})`);
                    return res.status(500).send(`Fatal Error: Cannot include ClientInternal Id in request.body if there is no prior "Matched" lodgment with that id (${req.body.ClientInternalId})`);
                }

            next();
        });
    } catch (error) {
        myLog.error('Caught error in getIdFromPriorMatchedLodgment', error);
        next();
    };
};

function put_SetFootprintProps(req: express.Request, res: express.Response, next: express.NextFunction) {
    myLog.debug('In FormController/ put_SetFootprintProps');
    myLog.debug(`Initially have ${JSON.stringify(res.locals.lookup)} body ${JSON.stringify(req.body).substring(0, 100)}...`); ``
    myLog.log(req.body);
    let tmpReqParmsLookup: formQueryType = <Object>res.locals.lookup;
    //this will blot out any inconsitent properties in the payload (extra fields will be removed by mongoose schema check)
    if (tmpReqParmsLookup.AccountSequenceNumber) req.body.AccountSequenceNumber = tmpReqParmsLookup.AccountSequenceNumber
    if (tmpReqParmsLookup.ClientInternalId) req.body.ClientInternalId = tmpReqParmsLookup.ClientInternalId
    if (tmpReqParmsLookup.FormType) req.body.FormType = tmpReqParmsLookup.FormType
    if (tmpReqParmsLookup.PeriodStartDt) req.body.PeriodStartDt = tmpReqParmsLookup.PeriodStartDt
    if (tmpReqParmsLookup.RoleTypeCode) req.body.RoleTypeCode = tmpReqParmsLookup.RoleTypeCode
    if (tmpReqParmsLookup.TransactionId) req.body.TransactionId = tmpReqParmsLookup.TransactionId;

    myLog.debug(`Now have new body ${JSON.stringify(req.body).substring(0, 100)}...`);
    myLog.log(req.body);
    req.body = setFootprintProperties(req.body);

    myLog.debug(`Updated body for update ${JSON.stringify(req.body).substring(0, 100)}...`);
    myLog.log(req.body);

    next()
}

function put_JSREValidationRules(req: express.Request, res: express.Response, next: express.NextFunction) {

    if (businessRulesLanguage == "JSRE") {
        let stpLineItems = req.body;
        //let formMetaData = require("../jsre/forms/oTH_PAYROLL_EVENT_CHILDForm.js");
        let reWithPatches = require("../loadRulesEngineWithPatches");  //although I don't actually use this, it does put the patches in for the one I do use.
        let RulesEngine = require("../jsre/rulesEngine");
        let LineItem = require("../jsre/lineItem");
        let subjectClient = stpLineItems.subjectClient;
        delete stpLineItems.subjectClient;  //unfortunately this messes with the rules engine.  So take it out then put it back at the end.

        //stpLineItems[10933][16585] = new LineItem(formMetaData[10933][16585], stpLineItems[10933][16585]._value);

        // this is stupid, isn't.  For some reason my line items lost their prototype methods.  If you know why, please give me a call and tell me. x63821.
        // I'm guessing it is becasue it was serialised and desearalised (without methods)
        Object.keys(stpLineItems).forEach(function (sId) {
            if (typeof (stpLineItems[sId]) == "object") { // not (typeof stpLineItems[sId] === "string" || typeof stpLineItems[sId] === "number" || stpLineItems[sId] === null) 
                Object.keys(stpLineItems[sId]).forEach(function (fId) {

                    if (stpLineItems[sId][fId].field) {
                        let v = (stpLineItems[sId][fId].field.repeating) ? stpLineItems[sId][fId]._values : stpLineItems[sId][fId]._value;
                        stpLineItems[sId][fId] = new LineItem(formMetaData[sId][fId], v);
                    } else {
                        if (formMetaData[sId] && formMetaData[sId][fId])
                            stpLineItems[sId][fId] = new LineItem(formMetaData[sId][fId], stpLineItems[sId][fId]);
                    }
                })
            }
        });

        var re = new RulesEngine(formMetaData, stpLineItems, "validate");
        myLog.debug("+++++++++++ about to call JSRE ++++++++++++++++");
        re.run();
        if (re.errors.length !== 0)
            res.status(500).send({
                FailureMessage: "Failed validation rules with " + re.errors.length + "found",
                error: re.errors
            });

        myLog.debug("+++++++++++ passed validation by  JSRE ++++++++++++++++");

        // put known secions/fields into subDocs with named paths
        transformFromLegacyJSREToExplicitStorageFormat(stpLineItems, formMetaDataById);
        // put known secions/fields into sections & LineItem arrays so can use defined schema in mongoose.
        //transformFromLegacyJSREToStorageFormat_old(stpLineItems, formMetaData, formDef);

        //todo: work out if this form will require update rules.  If it doesn't, set the processing status to "Done", otherwise set the processing status to "Pending Update Rules".
        stpLineItems.ProcessingStatusCd = 1;

        stpLineItems.subjectClient = subjectClient;
        res.locals.stpForm = stpLineItems;
    };

    next();

}

function put_EncryptSensitiveData(req: express.Request, res: express.Response, next: express.NextFunction) {
    //todo: selectively encrypt line items
    next()
}

// *****************************************************************************
// Put Methods
// *****************************************************************************
// Upserts the form specified in the url into the database
// This service is idempotent except for changes to Update Date Time 
export async function putForm(req: express.Request, res: express.Response, next: express.NextFunction) {
    myLog.debug("in FormsController/ putForm");
    myLog.debug("Looking for forms with: " + JSON.stringify(res.locals.lookup));
    myLog.debug("To update to body: " + JSON.stringify(req.body).substr(0, 100) + "...");
    myLog.log(req.body);
    myLog.log("Using addtional form line item schema: " + JSON.stringify(lineItemsSchema_FormSpecific));

    myLog.debug(`Client Internal Id ${JSON.stringify(req.body.ClientInternalId)}`);

    res.locals.isExisting = await writeHistory(req, res);

    Form(req.params.FormTypeMung, lineItemsSchema_FormSpecific).findOneAndUpdate(<Object>res.locals.lookup, req.body, { upsert: true, new: true }, async function (err: any, form: any) {
        myLog.debug('putForm:', (err || "No errors, form " + form.TransactionId + " found"));
        if (err)
            if (err.code == 11000 && (err.keyPattern || {}).TransactionId == 1) {
                myLog.error("Sending back error:", err);

                // ReST Std 95 says Optomistic Locking failurs should return a 409.  But I can't be sure this is failing 
                // optomistic locking check.  It is just that if the system is working that is the only reason why it should fail 
                // on a dupliate BET # (Transaction Id) key.
                return res.status(409).send("There was a problem updating the form due to Duplicate Key (my guess it is an optomistic locking problem).");
            }
            else {
                myLog.error("put form error found", err);
                return res.status(500).send("There was a problem updating the form.");
            }
        myLog.log(form);

        if (form && form.subjectClient && form.subjectClient.MatchingStatus == "UnMatched")
            initiateIdentityMatch(req.body);

        res.locals.status = (form && form._doc.createdAt.getTime() == form._doc.updatedAt.getTime()) ? 201 : 200;
        res.locals.data = (form) ? form : "No form found.";

        if ((res.locals.status == 201) == res.locals.isExisting) myLog.error(`No history created for an update of ${req.originalUrl}/ , has someone been tampering with the database?`)

        if (!res.locals.isExisting) await updateFileCounts(req, res, form)
            .catch(err => {
                myLog.error("Error updating File Counts", err);
                return res.status(500).send("There was a problem updating the form.")
            });
        next();
    });
};

function initiateIdentityMatch(payrollEvent: Object) {
    // send MQ transation to MCID using  BI5760
}

async function writeHistory(req: express.Request, res: express.Response<any>): Promise<boolean> {
    let originals: any = await Form(req.params.FormTypeMung, lineItemsSchema_FormSpecific).find(<Object>res.locals.lookup).exec();
    if (originals.length > 0) {
        originals.forEach((original: any) => {
            HistoryForm.create({ TransactionId: original.TransactionId, DT_Update: original.DT_Update, TM_Update: original.TM_Update, history: original })
                .catch((reason: any) => myLog.error('Error writing history.  This should never occur.  Processing carried on anyway:', reason));
            myLog.debug(`Writing history record for: ${JSON.stringify(original).substr(0, 150)}`);
        });
    }
    return (originals.length > 0);
}

// Upserts the form specified in the url into the database
export async function putApplyUpdateRules(req: express.Request, res: express.Response, next: express.NextFunction) {

    myLog.debug("+++++++++++ about to do update rules ++++++++++++++++");
    //todo: apply form update rules

    if (businessRulesLanguage == 'JSRE') {
        //todo: update mongo to record in status field that update rules now applied
        res.locals.stpForm.ProcessingStatusCd = 2;
    }

    //todo: restify the response
    //todo: decrypt line items 

    await postPutPreReturnHook(req.params.FormTypeMung, req, res);

    let form = res.locals.data._doc;
    let meaningfulNameForm = res.locals.data.toObject();
    if (wireFormat == 'JSRE') {
        form = transformMeaningfulStorageToJSREWireFormat(form, formMetaDataByName);
    }

    res.status(res.locals.status).send(form);

    await doPrefill(req, meaningfulNameForm);
    myLog.debug("+++++++++++ all done here ++++++++++++++++");
};

async function updateFileCounts(req: any, res: any, meaningfulNameForm: any) {
    let bulTransmissionStuff = await bulkTransmissionTracking(req.params.FormTypeMung, req, res, meaningfulNameForm);
    if (bulTransmissionStuff) {
        try {
            await Form("bulkTransmissionForm", bulTransmissionStuff.schema)
                .findOneAndUpdate(bulTransmissionStuff.lookupFilter, bulTransmissionStuff.upsertBody, { upsert: true, new: true });
        }
        catch (err) {
            throw new Error(err)
        };
    }
}

async function doPrefill(req: any, meaningfulNameForm: any) {
    let prefillStuff = await decideWhatToPutInPrefill(req.params.FormTypeMung, meaningfulNameForm);
    if (prefillStuff) {
        prefillStuff.forEach(p => replicateToPrefill(p.prefillLookup, p.prefillUpdate, p.prefillInsert, meaningfulNameForm));
    }
}

function replicateToPrefill(prefillLookup: any, prefillUpdate: any, prefillInsert: any, form: any) {
    PreFillForm.findOneAndUpdate(prefillLookup, prefillUpdate, { new: true }, function (err: any, prefillCollection: any) { //https://stackoverflow.com/questions/39563136/pushing-onto-nested-subdoc-array-with-mongoosejs
        myLog.debug('******* Return from attempt to update');
        if (err) myLog.error('decideWhatToPutInPrefill Error', err)
        else
            if (prefillCollection) myLog.debug(`******* Prefill after update: ${form["Payee Details"].oTH_PAYEE_DTLS_CurrentPayerPayeeRelationshipPayeePayrollIdentifier}, ${form["Payroll Event"].oTH_PAYROLL_EVNT_PayrollEventPeriodEndDate}`)
            else {
                myLog.debug('******* Update failed, will do insert');
                delete prefillLookup.facts;
                PreFillForm.findOneAndUpdate(prefillLookup, prefillInsert, { upsert: true, new: true }, function (err: any, prefillCollection: any) {
                    myLog.debug('******* Return from attempt to insert');
                    if (err) myLog.error('decideWhatToPutInPrefill Error', err)
                    else
                        if (!prefillCollection)
                            throw "there should be a form!! here!!";
                        else myLog.debug(`******* Prefill after insert: ${form["Payee Details"].oTH_PAYEE_DTLS_CurrentPayerPayeeRelationshipPayeePayrollIdentifier}, ${form["Payroll Event"].oTH_PAYROLL_EVNT_PayrollEventPeriodEndDate}`);
                });
            }
    });
}


export async function putFormIdentity(req: express.Request, res: express.Response, next: express.NextFunction) {

    //todo: I haven't got this right yet.
    //todo: the reporting client will always be authenticated, so we can always use their client internal id to look-up prior lodgments. - wrong
    //todo: the reporting client might be 1st party or 3rd party.  If first party could just take their information as correct; but probably want to check for mistakes.
    //todo: so, need two client internal ids, reporting & subject.  Subject may be option if we haven't yet verified identity
    //todo: if the reporting client is 3rd party they may know the subject client by a different set of identity details to other reporters
    //todo: so it will be form specific as to what properties we use for id verification; and these will need to be recorded separatedly for 
    //todo: the reporting client for subsequent lookups
    //todo: this is just detail, so I'll worry about doing this later.
    myLog.debug("in FormsController/ putFormIdentity")
    if (!(<any>res.locals.lookup)['subjectClient.ClientIdentifierType'] || !(<any>res.locals.lookup)['subjectClient.ClientIdentifierValue'])
        return res.status(400).send("Missing Form Identity lookup parameters");

    //the lookup needs the dot notation, but here want normal javascript dots
    if (!req.body.subjectClient.ClientIdentifierType || !req.body.subjectClient.ClientIdentifierValue || !req.body.subjectClient.MatchingStatus)
        return res.status(400).send("Missing Form Identity update details");

    const idLookup = <any>identityLookupCriteria(req.params.FormTypeMung, req, res);
    await writeHistory(req, res);
    myLog.debug(`Looking for forms with: ${JSON.stringify(idLookup)} \n and body :\n${JSON.stringify(req.body)}`);

    Form(req.params.FormTypeMung, lineItemsSchema_FormSpecific).updateMany(idLookup, req.body, {}, function (err: any, results: any) {
        myLog.debug('putFormIdentity:', (err || "No errors, found, updated " + results.nModified + " of " + results.n + " matches"));
        if (err) return res.status(500).send("There was a problem updating form identity.");
        myLog.log(results);

        res.status(200).send({
            message: "Updated " + results.nModified + " of " + results.n + " matches",
            results: results
        });

        next();
    });
};

// *****************************************************************************
// Delete Methods
// *****************************************************************************
// Deletes the form specified in the url from the database
export function deleteForm(req: express.Request, res: express.Response, next: express.NextFunction) {
    myLog.debug("Inside FormControllers.ts/ deleteForm" + req.url);
    const lookup: formQueryType = turnURLStemsIntoLookupObject(req, next);

    myLog.debug('About to do lookup/delete with: ' + JSON.stringify(lookup));
    myLog.debug('About to do lookup/delete with: ', lookup);
    Form(req.params.FormTypeMung, lineItemsSchema_FormSpecific).findOneAndRemove(<Object>lookup, function (err: any, form: any) {
        myLog.debug('deleteForm:', (err || "No errors, " + (form ? form.TransactionId : "no") + " form found & deleted"));
        if (err) return res.status(500).send("There was a problem trying to delete form.");
        myLog.log(form);

        if (!form) return res.status(404).send(`Form not found - for delete operation with keys: ${JSON.stringify(lookup)}`);
        else res.status(200).send(`Form deleted - with keys ${JSON.stringify(lookup)}`);
    });
};

export async function cancelFile(req: express.Request, res: express.Response, next: express.NextFunction) {
    //this will need to read all the facts which contain the file bet# (or maybe the lodger's ref number) and 
    //set them to status pending cancellation
    //then read each fact with pending cancellation and repost with a cancelation status, leading to execution of cancellation rules.
    //who & why cancelled

    //also need to ignore any subsequent messages with that file bet#
    if (!req.params.TransactionId || !req.params.DT_Update || !req.params.TM_Update || !req.params.ClientIdentifierType || !req.params.ClientIdentifierValue) {
        myLog.error(`URI did not include all the parameters needed to cancel a file, ${req.originalUrl}`);
        return res.status(500).send("URI did not include all the parameters needed to cancel a file.");
    }
    const bulkTransmissionLookup: any = { FormType: "bulkTransmission", ProcessingStatusCd: { $ne: 9 } };
    bulkTransmissionLookup.TransactionId = parseInt(req.params.TransactionId);
    bulkTransmissionLookup.DT_Update = new Date(req.params.DT_Update).toLocaleDateString();
    bulkTransmissionLookup.TM_Update = req.params.TM_Update;
    bulkTransmissionLookup['subjectClient.ClientIdentifierType'] = req.params.ClientIdentifierType;
    bulkTransmissionLookup['subjectClient.ClientIdentifierValue'] = parseInt(req.params.ClientIdentifierValue);

    const recordLookup: any = { ProcessingStatusCd: { $ne: 9 } };
    recordLookup['TransmissionDetails.TransmissionBET'] = parseInt(req.params.TransactionId);
    recordLookup['TransmissionDetails.ClientIdentifierType'] = req.params.ClientIdentifierType;
    recordLookup['TransmissionDetails.ClientIdentifierValue'] = parseInt(req.params.ClientIdentifierValue);

    let expectedCount = 0;
    if (!req.params.skipCountCheck) {
        var bulkTransmissionFact = await BaseForm.findOne(bulkTransmissionLookup) as any;
        if (!bulkTransmissionFact) {
            res.status(404).send(`Couldn't find fact representing the bulk transmission: ${JSON.stringify(bulkTransmissionLookup)}`);
            return;
        }
        expectedCount = bulkTransmissionFact.TransmissionDetails.RecordCount + 1; // Because the count will include the BulkTransmission 

        // const countOfDocuments = await BaseForm.countDocuments(recordLookup);
        const countOfDocuments = await BaseForm.count(recordLookup);
        if (countOfDocuments !== expectedCount) {
            res.status(500).send(`Not all documents seem to be present, expected ${expectedCount}, but actually found ${countOfDocuments}`);
            return;
        }
    }

    // const lookup2 = { ...res.locals.lookup, DT_Update: bulkTransmissionFact.DT_Update, TM_Update: bulkTransmissionFact.TM_Update };
    const formCancelationPendingStatus = { ProcessingStatusCd: 8, DT_Update: new Date().toLocaleDateString(), TM_Update: new Date().toLocaleTimeString() };;
    bulkTransmissionFact = await BaseForm.findOneAndUpdate(bulkTransmissionLookup, formCancelationPendingStatus);
    if (!bulkTransmissionFact) {
        res.status(404).send(`Couldn't find bulk transmission fact for: ${JSON.stringify(bulkTransmissionLookup)}, nothing updated`);
        return;
    }

    formCancelationPendingStatus.ProcessingStatusCd = 9;
    const updResult = await BaseForm.updateMany(recordLookup, formCancelationPendingStatus);
    if (updResult.n !== expectedCount || updResult.n !== updResult.nModified) {
        res.status(500).send(`Expected to update ${expectedCount}, but actually updated ${updResult.nModified}`);
        return
    }

    res.status(200).send(updResult);
}

// // UPDATES A SINGLE FORM - THIS SHOULD NEVER BE USED (OUTSIDE OF TESTING) BECAUSE NOONE WILL KNOW THE _ID
// router.put('/Forms/:id', putFormWithId);

// function putFormWithId (req:express.Request, res:express.Response) {
//     myLog.debug(req.body);
//     const nextx = () => {};
//     const lookup: formQueryType = turnURLStemsIntoLookupObject(req, nextx);
//     myLog.debug(`Posted body for update ${JSON.stringify(req.body)}`);

//     let newBody = setFootprintProperties(req.body,true);
//     myLog.debug("About to apply update to: " + req.params._id + " with body " + JSON.stringify(newBody));

//     Form.findByIdAndUpdate(req.params._id, newBody, {upsert:false, new: true}, function (err: any, form: any) {
//     if (err) return res.status(500).send("There was a problem updating the form.");
//         res.status(200).send(form);
//     });  
// }; 

// CREATES A NEW FORM - don't think we need this!!  Just means the consumer must supply a valid bet# and call put
export function createForm(req: any, res: any) {
    myLog.debug('Inside post');
    myLog.debug('req.body: ' + req.body);

    //todo: if this is not thrown away:
    //todo: - ensure uri info matched against header, 
    //todo: - setup footprint info
    //todo: - selectively encrypt line items
    //todo: - call jsre validation rules


    Form("").create(req.body,
        function (err: mongoose.Error, form: mongoose.Model<mongoose.Document>) {
            myLog.debug('post call back received');
            if (err) return res.status(500).send("There was a problem adding the information to the database.\n" + err.message);

            //todo: apply form update rules
            //todo: restify the response
            //todo: decrypt line items 

            res.status(200).send(form);
        });
};

export function codeLookup(decode: String): number {
    //todo: dummy
    if (decode == "IT") return 5;
    if (decode == "GST") return 10;
    if (decode == "STP") return 66;
    return -1;
}

module.exports = router;
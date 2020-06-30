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
myLog.debug('Inside FormController');
exports.router = express.Router();
const bodyParser = __importStar(require("body-parser"));
const FormURL2Query_1 = require("./FormURL2Query");
const Form_1 = require("./Form");
const transformWireFormat_1 = require("./transformWireFormat");
const factSpecificPlugin_1 = require("./factSpecific/factSpecificPlugin");
// *****************************************************************************
// invoke middleware functions - express ceremony
// *****************************************************************************
exports.router.use(bodyParser.json());
exports.router.use(bodyParser.urlencoded({ extended: true }));
exports.router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
exports.router.use(function (req, res, next) {
    myLog.debug(`in FormController.ts/use, ${req.url}, ${req.method}, ${req.body}`);
    next();
});
// *****************************************************************************
// register the routes offered in this controller
// *****************************************************************************
// I tried to hide  the messsiness of setting up Form Routes in ./setupformroutes
// getForms & putForms are the functions that will be called respectively
// but I found different behaviour between registering the route here on in the submodule.
const FormRoutes = __importStar(require("./SetUpFormRoutes"));
var getMiddleware = [get_put_ExtractURLStemInfo, loadFactSpecificStuff];
var putMiddleware = [get_put_ExtractURLStemInfo, loadFactSpecificStuff, getIdFromPriorMatchedLodgment, put_SetFootprintProps, put_JSREValidationRules, put_EncryptSensitiveData];
FormRoutes.setUpFormRoutes(exports.router);
FormRoutes.formRoutes.forEach((r) => {
    exports.router.get(r, getMiddleware, getForms);
    exports.router.put(r, putMiddleware, putForm);
    exports.router.put(r, /* putMoreMiddleware, */ putApplyUpdateRules);
});
// a couple extras
exports.router.get('/All/Forms', getAllFormsTestingUseOnly);
exports.router.delete('/:ClientIdentifierType/:ClientIdentifierValue/Forms/:FormTypeMung/:TransactionId', [loadFactSpecificStuff], deleteForm);
exports.router.delete('/:ClientIdentifierType/:ClientIdentifierValue/Forms/:FormTypeMung/_id/:_id', [loadFactSpecificStuff], deleteForm);
exports.router.get('/:ClientIdentifierType/:ClientIdentifierValue/FormIdentity/:FormTypeMung', [get_put_ExtractURLStemInfo, loadFactSpecificStuff], getFormIdentity);
exports.router.put('/:ClientIdentifierType/:ClientIdentifierValue/FormIdentity/:FormTypeMung', [get_put_ExtractURLStemInfo, loadFactSpecificStuff], putFormIdentity);
exports.router.get('/:ClientIdentifierType/:ClientIdentifierValue/FormsHistory/:TransactionId', getFormsHistory);
exports.router.get('/FormsHistory/:TransactionId', getFormsHistory);
//not yet implemented
exports.router.delete('/:ClientIdentifierType/:ClientIdentifierValue/:TransactionId/:DT_Update/:TM_Update', cancelFile);
exports.router.delete('/:ClientIdentifierType/:ClientIdentifierValue/:TransactionId/:DT_Update', cancelFile);
exports.router.delete('/:ClientIdentifierType/:ClientIdentifierValue/:TransactionId', cancelFile);
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
function get_put_ExtractURLStemInfo(req, res, next) {
    myLog.debug('in FormController/ get_put_ExtractURLStemInfo, originalUrl :', req.originalUrl);
    res.locals.lookup = FormURL2Query_1.turnURLStemsIntoLookupObject(req, next);
    if (req.body && (req.method == "PUT" || req.method == "POST")) {
        //i.e req.method =="PUT" || "POST"
        if (!req.body.subjectClient)
            req.body.subjectClient = { MatchingStatus: "UnMatched" }; //default to unmatched until file id from prior lodgment or id match result
        req.body.subjectClient.ClientIdentifierType = res.locals.lookup["subjectClient.ClientIdentifierType"];
        req.body.subjectClient.ClientIdentifierValue = res.locals.lookup["subjectClient.ClientIdentifierValue"];
        delete req.body.TransactionId; //this should come from the URI, not be in body.
        // Hmm, So it is possible to use the findOneAndUpdate with the upsert option it is necessary to make Insert & Update the same, so DT/TM Update are mandatory.
        if (req.originalUrl.indexOf("\/FormIdentity\/") < 0 && (!req.body.DT_Update || !req.body.TM_Update))
            throw new Error("Missing footprint property DT_Update or TM_Update.");
        res.locals.lookup.DT_Update = req.body.DT_Update;
        res.locals.lookup.TM_Update = req.body.TM_Update;
    }
    next();
}
//This loads any form specific stuff code.
//
//lineItemsSchema_FormSpecific
//The BaseForm schema has an array of Sections which contain an array of LineItems
//This adds specific line items with meaningful names to the schema (as well as virtual alias with just the 5 digit identifier)
function loadFactSpecificStuff(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        factSpecificPlugin_1.getFactSpecificStuff(req.params.FormTypeMung, next);
    });
}
// *****************************************************************************
// Get Methods
// *****************************************************************************
// RETURNS ALL THE FORMS IN THE DATABASE
function getAllFormsTestingUseOnly(req, res) {
    myLog.debug('Inside FormController.ts/getAllFormsTestingUseOnly');
    Form_1.Form("").find({}, function (err, forms) {
        myLog.debug('getAllFormsTestingUseOnly:', (err || "No errors, found " + (forms ? forms.length : "no") + " forms"));
        if (err)
            return res.status(500).send("There was a problem finding the forms.");
        myLog.log(forms);
        res.status(200).send(forms);
    });
}
;
// RETURNS ALL THE FORMS IN THE DATABASE THAT MATCH THE URL
function getForms(req, res, next) {
    myLog.debug("In FormController.ts/getForms");
    Form_1.Form(req.params.FormTypeMung, factSpecificPlugin_1.lineItemsSchema_FormSpecific).find(res.locals.lookup, function (err, forms) {
        myLog.debug('getForms:', (err || "No errors, found " + (forms ? forms.length : "no") + " forms"));
        if (err)
            return res.status(500).send("There was a problem finding the forms.");
        myLog.log(forms);
        if (!forms)
            return res.status(404).send("No form found.!!");
        //todo: restify the response
        //todo: decrypt line items
        if ((forms || []).length == 0)
            return res.status(404).send("No form found.");
        let result = [];
        forms.forEach((f) => result.push(transformWireFormat_1.transformMeaningfulStorageToJSREWireFormat(f._doc, factSpecificPlugin_1.formMetaDataByName)));
        res.status(200).send(result);
    });
}
exports.getForms = getForms;
;
//I can't think of any use of this 
function getFormIdentity(req, res, next) {
    myLog.debug('Inside FormController.ts/getFormIdentity');
    Form_1.Form(req.params.FormTypeMung, factSpecificPlugin_1.lineItemsSchema_FormSpecific).find(res.locals.lookup, function (err, forms) {
        myLog.debug('getFormIdentity:', (err || "No errors, found " + (forms ? forms.length : "no") + " forms"));
        if (err)
            return res.status(500).send("There was a problem finding the forms with requested form identity.");
        myLog.log(forms);
        if ((forms || []).length == 0)
            return res.status(404).send("No FormIdentitys found.");
        else
            res.status(200).send(forms);
    });
}
exports.getFormIdentity = getFormIdentity;
;
//Get history
function getFormsHistory(req, res, next) {
    myLog.debug('Inside FormController.ts/getFormsHistory');
    res.locals.lookup = {};
    if (req.params.TransactionId)
        res.locals.lookup.TransactionId = parseInt(req.params.TransactionId);
    if (req.params.DT_Update)
        res.locals.lookup.DT_Update = new Date(req.params.DT_Update).toLocaleDateString();
    if (req.params.TM_Update)
        res.locals.lookup.TM_Update = new Date(req.params.TM_Update).toLocaleTimeString();
    if (req.params.ClientIdentifierType && req.params.ClientIdentifierValue) {
        res.locals.lookup['history.subjectClient.ClientIdentifierType'] = req.params.ClientIdentifierType;
        res.locals.lookup['history.subjectClient.ClientIdentifierValue'] = parseInt(req.params.ClientIdentifierValue);
    }
    myLog.debug('About to look for history with:', res.locals.lookup);
    Form_1.HistoryForm.find(res.locals.lookup, function (err, forms) {
        myLog.debug('getFormsHistory:', (err || "No errors, found " + (forms ? forms.length : "no") + " forms"));
        if (err)
            return res.status(500).send("There was a problem finding the forms with requested form identity.");
        myLog.log(forms);
        if ((forms || []).length == 0)
            return res.status(404).send("No FormIdentitys found.");
        else
            res.status(200).send(forms);
    });
}
exports.getFormsHistory = getFormsHistory;
;
// *****************************************************************************
// Put Middleware
// *****************************************************************************
function getIdFromPriorMatchedLodgment(req, res, next) {
    myLog.debug('In FormController.ts/ getIdFromPriorMatchedLodgment, ' + req.url, req.params.ClientInternalId);
    if (req.params.ClientInternalId)
        return next(); //Client Internal Id may be known from upstream process, e.g. authorisation checks, in which case no need to lookup from pervious lodgment
    try {
        const priorLodgmentLookupCriteria = factSpecificPlugin_1.getPriorLodgmentLookupCriteria(req.params.FormTypeMung, req, res);
        myLog.debug(`Looking for prior lodgments with: ${JSON.stringify(priorLodgmentLookupCriteria)}`);
        if (!req.body.subjectClient)
            req.body.subjectClient = {};
        req.body.subjectClient.MatchingStatus = "UnMatched";
        myLog.debug(`The body contains: ${JSON.stringify(req.body).substr(0, 100)}...`);
        myLog.log(`Using addtional ${req.params.FormTypeMung} form line item schema: ` + JSON.stringify(factSpecificPlugin_1.lineItemsSchema_FormSpecific));
        myLog.debug("+++++++++++ about to talk to Mongo ++++++++++++++++");
        Form_1.Form(req.params.FormTypeMung, factSpecificPlugin_1.lineItemsSchema_FormSpecific).findOne(priorLodgmentLookupCriteria, function (err, foundForm) {
            myLog.debug('getIdFromPriorMatchedLodgment:', (err || "No errors, " + (foundForm ? "Prior lodgement with " + foundForm.TransactionId + " tran id found" : "no prior lodgments found")));
            if (err)
                return res.status(500).send("There was a problem getting matching status for client.");
            myLog.log(foundForm);
            if (foundForm)
                factSpecificPlugin_1.confirmCanTakeIdentityFromPriorLodgment(req.params.FormTypeMung, req, foundForm, res);
            else if (req.body.ClientInternalId) {
                myLog.debug(`Fatal Error: Cannot include ClientInternal Id in request.body if there is no prior "Matched" lodgment with that id (${req.body.ClientInternalId})`);
                return res.status(500).send(`Fatal Error: Cannot include ClientInternal Id in request.body if there is no prior "Matched" lodgment with that id (${req.body.ClientInternalId})`);
            }
            next();
        });
    }
    catch (error) {
        myLog.error('Caught error in getIdFromPriorMatchedLodgment', error);
        next();
    }
    ;
}
;
function put_SetFootprintProps(req, res, next) {
    myLog.debug('In FormController/ put_SetFootprintProps');
    myLog.debug(`Initially have ${JSON.stringify(res.locals.lookup)} body ${JSON.stringify(req.body).substring(0, 100)}...`);
    ``;
    myLog.log(req.body);
    let tmpReqParmsLookup = res.locals.lookup;
    //this will blot out any inconsitent properties in the payload (extra fields will be removed by mongoose schema check)
    if (tmpReqParmsLookup.AccountSequenceNumber)
        req.body.AccountSequenceNumber = tmpReqParmsLookup.AccountSequenceNumber;
    if (tmpReqParmsLookup.ClientInternalId)
        req.body.ClientInternalId = tmpReqParmsLookup.ClientInternalId;
    if (tmpReqParmsLookup.FormType)
        req.body.FormType = tmpReqParmsLookup.FormType;
    if (tmpReqParmsLookup.PeriodStartDt)
        req.body.PeriodStartDt = tmpReqParmsLookup.PeriodStartDt;
    if (tmpReqParmsLookup.RoleTypeCode)
        req.body.RoleTypeCode = tmpReqParmsLookup.RoleTypeCode;
    if (tmpReqParmsLookup.TransactionId)
        req.body.TransactionId = tmpReqParmsLookup.TransactionId;
    myLog.debug(`Now have new body ${JSON.stringify(req.body).substring(0, 100)}...`);
    myLog.log(req.body);
    req.body = Form_1.setFootprintProperties(req.body);
    myLog.debug(`Updated body for update ${JSON.stringify(req.body).substring(0, 100)}...`);
    myLog.log(req.body);
    next();
}
function put_JSREValidationRules(req, res, next) {
    if (factSpecificPlugin_1.businessRulesLanguage == "JSRE") {
        let stpLineItems = req.body;
        //let formMetaData = require("../jsre/forms/oTH_PAYROLL_EVENT_CHILDForm.js");
        let reWithPatches = require("../loadRulesEngineWithPatches"); //although I don't actually use this, it does put the patches in for the one I do use.
        let RulesEngine = require("../jsre/rulesEngine");
        let LineItem = require("../jsre/lineItem");
        let subjectClient = stpLineItems.subjectClient;
        delete stpLineItems.subjectClient; //unfortunately this messes with the rules engine.  So take it out then put it back at the end.
        //stpLineItems[10933][16585] = new LineItem(formMetaData[10933][16585], stpLineItems[10933][16585]._value);
        // this is stupid, isn't.  For some reason my line items lost their prototype methods.  If you know why, please give me a call and tell me. x63821.
        // I'm guessing it is becasue it was serialised and desearalised (without methods)
        Object.keys(stpLineItems).forEach(function (sId) {
            if (typeof (stpLineItems[sId]) == "object") { // not (typeof stpLineItems[sId] === "string" || typeof stpLineItems[sId] === "number" || stpLineItems[sId] === null) 
                Object.keys(stpLineItems[sId]).forEach(function (fId) {
                    if (stpLineItems[sId][fId].field) {
                        let v = (stpLineItems[sId][fId].field.repeating) ? stpLineItems[sId][fId]._values : stpLineItems[sId][fId]._value;
                        stpLineItems[sId][fId] = new LineItem(factSpecificPlugin_1.formMetaData[sId][fId], v);
                    }
                    else {
                        if (factSpecificPlugin_1.formMetaData[sId] && factSpecificPlugin_1.formMetaData[sId][fId])
                            stpLineItems[sId][fId] = new LineItem(factSpecificPlugin_1.formMetaData[sId][fId], stpLineItems[sId][fId]);
                    }
                });
            }
        });
        var re = new RulesEngine(factSpecificPlugin_1.formMetaData, stpLineItems, "validate");
        myLog.debug("+++++++++++ about to call JSRE ++++++++++++++++");
        re.run();
        if (re.errors.length !== 0)
            res.status(500).send({
                FailureMessage: "Failed validation rules with " + re.errors.length + "found",
                error: re.errors
            });
        myLog.debug("+++++++++++ passed validation by  JSRE ++++++++++++++++");
        // put known secions/fields into subDocs with named paths
        transformWireFormat_1.transformFromLegacyJSREToExplicitStorageFormat(stpLineItems, factSpecificPlugin_1.formMetaDataById);
        // put known secions/fields into sections & LineItem arrays so can use defined schema in mongoose.
        //transformFromLegacyJSREToStorageFormat_old(stpLineItems, formMetaData, formDef);
        //todo: work out if this form will require update rules.  If it doesn't, set the processing status to "Done", otherwise set the processing status to "Pending Update Rules".
        stpLineItems.ProcessingStatusCd = 1;
        stpLineItems.subjectClient = subjectClient;
        res.locals.stpForm = stpLineItems;
    }
    ;
    next();
}
function put_EncryptSensitiveData(req, res, next) {
    //todo: selectively encrypt line items
    next();
}
// *****************************************************************************
// Put Methods
// *****************************************************************************
// Upserts the form specified in the url into the database
// This service is idempotent except for changes to Update Date Time 
function putForm(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        myLog.debug("in FormsController/ putForm");
        myLog.debug("Looking for forms with: " + JSON.stringify(res.locals.lookup));
        myLog.debug("To update to body: " + JSON.stringify(req.body).substr(0, 100) + "...");
        myLog.log(req.body);
        myLog.log("Using addtional form line item schema: " + JSON.stringify(factSpecificPlugin_1.lineItemsSchema_FormSpecific));
        myLog.debug(`Client Internal Id ${JSON.stringify(req.body.ClientInternalId)}`);
        res.locals.isExisting = yield writeHistory(req, res);
        Form_1.Form(req.params.FormTypeMung, factSpecificPlugin_1.lineItemsSchema_FormSpecific).findOneAndUpdate(res.locals.lookup, req.body, { upsert: true, new: true }, function (err, form) {
            return __awaiter(this, void 0, void 0, function* () {
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
                if ((res.locals.status == 201) == res.locals.isExisting)
                    myLog.error(`No history created for an update of ${req.originalUrl}/ , has someone been tampering with the database?`);
                if (!res.locals.isExisting)
                    yield updateFileCounts(req, res, form)
                        .catch(err => {
                        myLog.error("Error updating File Counts", err);
                        return res.status(500).send("There was a problem updating the form.");
                    });
                next();
            });
        });
    });
}
exports.putForm = putForm;
;
function initiateIdentityMatch(payrollEvent) {
    // send MQ transation to MCID using  BI5760
}
function writeHistory(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let originals = yield Form_1.Form(req.params.FormTypeMung, factSpecificPlugin_1.lineItemsSchema_FormSpecific).find(res.locals.lookup).exec();
        if (originals.length > 0) {
            originals.forEach((original) => {
                Form_1.HistoryForm.create({ TransactionId: original.TransactionId, DT_Update: original.DT_Update, TM_Update: original.TM_Update, history: original })
                    .catch((reason) => myLog.error('Error writing history.  This should never occur.  Processing carried on anyway:', reason));
                myLog.debug(`Writing history record for: ${JSON.stringify(original).substr(0, 150)}`);
            });
        }
        return (originals.length > 0);
    });
}
// Upserts the form specified in the url into the database
function putApplyUpdateRules(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        myLog.debug("+++++++++++ about to do update rules ++++++++++++++++");
        //todo: apply form update rules
        if (factSpecificPlugin_1.businessRulesLanguage == 'JSRE') {
            //todo: update mongo to record in status field that update rules now applied
            res.locals.stpForm.ProcessingStatusCd = 2;
        }
        //todo: restify the response
        //todo: decrypt line items 
        yield factSpecificPlugin_1.postPutPreReturnHook(req.params.FormTypeMung, req, res);
        let form = res.locals.data._doc;
        let meaningfulNameForm = res.locals.data.toObject();
        if (factSpecificPlugin_1.wireFormat == 'JSRE') {
            form = transformWireFormat_1.transformMeaningfulStorageToJSREWireFormat(form, factSpecificPlugin_1.formMetaDataByName);
        }
        res.status(res.locals.status).send(form);
        yield doPrefill(req, meaningfulNameForm);
        myLog.debug("+++++++++++ all done here ++++++++++++++++");
    });
}
exports.putApplyUpdateRules = putApplyUpdateRules;
;
function updateFileCounts(req, res, meaningfulNameForm) {
    return __awaiter(this, void 0, void 0, function* () {
        let bulTransmissionStuff = yield factSpecificPlugin_1.bulkTransmissionTracking(req.params.FormTypeMung, req, res, meaningfulNameForm);
        if (bulTransmissionStuff) {
            try {
                yield Form_1.Form("bulkTransmissionForm", bulTransmissionStuff.schema)
                    .findOneAndUpdate(bulTransmissionStuff.lookupFilter, bulTransmissionStuff.upsertBody, { upsert: true, new: true });
            }
            catch (err) {
                throw new Error(err);
            }
            ;
        }
    });
}
function doPrefill(req, meaningfulNameForm) {
    return __awaiter(this, void 0, void 0, function* () {
        let prefillStuff = yield factSpecificPlugin_1.decideWhatToPutInPrefill(req.params.FormTypeMung, meaningfulNameForm);
        if (prefillStuff) {
            prefillStuff.forEach(p => replicateToPrefill(p.prefillLookup, p.prefillUpdate, p.prefillInsert, meaningfulNameForm));
        }
    });
}
function replicateToPrefill(prefillLookup, prefillUpdate, prefillInsert, form) {
    Form_1.PreFillForm.findOneAndUpdate(prefillLookup, prefillUpdate, { new: true }, function (err, prefillCollection) {
        myLog.debug('******* Return from attempt to update');
        if (err)
            myLog.error('decideWhatToPutInPrefill Error', err);
        else if (prefillCollection)
            myLog.debug(`******* Prefill after update: ${form["Payee Details"].oTH_PAYEE_DTLS_CurrentPayerPayeeRelationshipPayeePayrollIdentifier}, ${form["Payroll Event"].oTH_PAYROLL_EVNT_PayrollEventPeriodEndDate}`);
        else {
            myLog.debug('******* Update failed, will do insert');
            delete prefillLookup.facts;
            Form_1.PreFillForm.findOneAndUpdate(prefillLookup, prefillInsert, { upsert: true, new: true }, function (err, prefillCollection) {
                myLog.debug('******* Return from attempt to insert');
                if (err)
                    myLog.error('decideWhatToPutInPrefill Error', err);
                else if (!prefillCollection)
                    throw "there should be a form!! here!!";
                else
                    myLog.debug(`******* Prefill after insert: ${form["Payee Details"].oTH_PAYEE_DTLS_CurrentPayerPayeeRelationshipPayeePayrollIdentifier}, ${form["Payroll Event"].oTH_PAYROLL_EVNT_PayrollEventPeriodEndDate}`);
            });
        }
    });
}
function putFormIdentity(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //todo: I haven't got this right yet.
        //todo: the reporting client will always be authenticated, so we can always use their client internal id to look-up prior lodgments. - wrong
        //todo: the reporting client might be 1st party or 3rd party.  If first party could just take their information as correct; but probably want to check for mistakes.
        //todo: so, need two client internal ids, reporting & subject.  Subject may be option if we haven't yet verified identity
        //todo: if the reporting client is 3rd party they may know the subject client by a different set of identity details to other reporters
        //todo: so it will be form specific as to what properties we use for id verification; and these will need to be recorded separatedly for 
        //todo: the reporting client for subsequent lookups
        //todo: this is just detail, so I'll worry about doing this later.
        myLog.debug("in FormsController/ putFormIdentity");
        if (!res.locals.lookup['subjectClient.ClientIdentifierType'] || !res.locals.lookup['subjectClient.ClientIdentifierValue'])
            return res.status(400).send("Missing Form Identity lookup parameters");
        //the lookup needs the dot notation, but here want normal javascript dots
        if (!req.body.subjectClient.ClientIdentifierType || !req.body.subjectClient.ClientIdentifierValue || !req.body.subjectClient.MatchingStatus)
            return res.status(400).send("Missing Form Identity update details");
        const idLookup = factSpecificPlugin_1.identityLookupCriteria(req.params.FormTypeMung, req, res);
        yield writeHistory(req, res);
        myLog.debug(`Looking for forms with: ${JSON.stringify(idLookup)} \n and body :\n${JSON.stringify(req.body)}`);
        Form_1.Form(req.params.FormTypeMung, factSpecificPlugin_1.lineItemsSchema_FormSpecific).updateMany(idLookup, req.body, {}, function (err, results) {
            myLog.debug('putFormIdentity:', (err || "No errors, found, updated " + results.nModified + " of " + results.n + " matches"));
            if (err)
                return res.status(500).send("There was a problem updating form identity.");
            myLog.log(results);
            res.status(200).send({
                message: "Updated " + results.nModified + " of " + results.n + " matches",
                results: results
            });
            next();
        });
    });
}
exports.putFormIdentity = putFormIdentity;
;
// *****************************************************************************
// Delete Methods
// *****************************************************************************
// Deletes the form specified in the url from the database
function deleteForm(req, res, next) {
    myLog.debug("Inside FormControllers.ts/ deleteForm" + req.url);
    const lookup = FormURL2Query_1.turnURLStemsIntoLookupObject(req, next);
    myLog.debug('About to do lookup/delete with: ' + JSON.stringify(lookup));
    myLog.debug('About to do lookup/delete with: ', lookup);
    Form_1.Form(req.params.FormTypeMung, factSpecificPlugin_1.lineItemsSchema_FormSpecific).findOneAndRemove(lookup, function (err, form) {
        myLog.debug('deleteForm:', (err || "No errors, " + (form ? form.TransactionId : "no") + " form found & deleted"));
        if (err)
            return res.status(500).send("There was a problem trying to delete form.");
        myLog.log(form);
        if (!form)
            return res.status(404).send(`Form not found - for delete operation with keys: ${JSON.stringify(lookup)}`);
        else
            res.status(200).send(`Form deleted - with keys ${JSON.stringify(lookup)}`);
    });
}
exports.deleteForm = deleteForm;
;
function cancelFile(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //this will need to read all the facts which contain the file bet# (or maybe the lodger's ref number) and 
        //set them to status pending cancellation
        //then read each fact with pending cancellation and repost with a cancelation status, leading to execution of cancellation rules.
        //who & why cancelled
        //also need to ignore any subsequent messages with that file bet#
        if (!req.params.TransactionId || !req.params.DT_Update || !req.params.TM_Update || !req.params.ClientIdentifierType || !req.params.ClientIdentifierValue) {
            myLog.error(`URI did not include all the parameters needed to cancel a file, ${req.originalUrl}`);
            return res.status(500).send("URI did not include all the parameters needed to cancel a file.");
        }
        const bulkTransmissionLookup = { FormType: "bulkTransmission", ProcessingStatusCd: { $ne: 9 } };
        bulkTransmissionLookup.TransactionId = parseInt(req.params.TransactionId);
        bulkTransmissionLookup.DT_Update = new Date(req.params.DT_Update).toLocaleDateString();
        bulkTransmissionLookup.TM_Update = req.params.TM_Update;
        bulkTransmissionLookup['subjectClient.ClientIdentifierType'] = req.params.ClientIdentifierType;
        bulkTransmissionLookup['subjectClient.ClientIdentifierValue'] = parseInt(req.params.ClientIdentifierValue);
        const recordLookup = { ProcessingStatusCd: { $ne: 9 } };
        recordLookup['TransmissionDetails.TransmissionBET'] = parseInt(req.params.TransactionId);
        recordLookup['TransmissionDetails.ClientIdentifierType'] = req.params.ClientIdentifierType;
        recordLookup['TransmissionDetails.ClientIdentifierValue'] = parseInt(req.params.ClientIdentifierValue);
        let expectedCount = 0;
        if (!req.params.skipCountCheck) {
            var bulkTransmissionFact = yield Form_1.BaseForm.findOne(bulkTransmissionLookup);
            if (!bulkTransmissionFact) {
                res.status(404).send(`Couldn't find fact representing the bulk transmission: ${JSON.stringify(bulkTransmissionLookup)}`);
                return;
            }
            expectedCount = bulkTransmissionFact.TransmissionDetails.RecordCount + 1; // Because the count will include the BulkTransmission 
            // const countOfDocuments = await BaseForm.countDocuments(recordLookup);
            const countOfDocuments = yield Form_1.BaseForm.count(recordLookup);
            if (countOfDocuments !== expectedCount) {
                res.status(500).send(`Not all documents seem to be present, expected ${expectedCount}, but actually found ${countOfDocuments}`);
                return;
            }
        }
        // const lookup2 = { ...res.locals.lookup, DT_Update: bulkTransmissionFact.DT_Update, TM_Update: bulkTransmissionFact.TM_Update };
        const formCancelationPendingStatus = { ProcessingStatusCd: 8, DT_Update: new Date().toLocaleDateString(), TM_Update: new Date().toLocaleTimeString() };
        ;
        bulkTransmissionFact = yield Form_1.BaseForm.findOneAndUpdate(bulkTransmissionLookup, formCancelationPendingStatus);
        if (!bulkTransmissionFact) {
            res.status(404).send(`Couldn't find bulk transmission fact for: ${JSON.stringify(bulkTransmissionLookup)}, nothing updated`);
            return;
        }
        formCancelationPendingStatus.ProcessingStatusCd = 9;
        const updResult = yield Form_1.BaseForm.updateMany(recordLookup, formCancelationPendingStatus);
        if (updResult.n !== expectedCount || updResult.n !== updResult.nModified) {
            res.status(500).send(`Expected to update ${expectedCount}, but actually updated ${updResult.nModified}`);
            return;
        }
        res.status(200).send(updResult);
    });
}
exports.cancelFile = cancelFile;
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
function createForm(req, res) {
    myLog.debug('Inside post');
    myLog.debug('req.body: ' + req.body);
    //todo: if this is not thrown away:
    //todo: - ensure uri info matched against header, 
    //todo: - setup footprint info
    //todo: - selectively encrypt line items
    //todo: - call jsre validation rules
    Form_1.Form("").create(req.body, function (err, form) {
        myLog.debug('post call back received');
        if (err)
            return res.status(500).send("There was a problem adding the information to the database.\n" + err.message);
        //todo: apply form update rules
        //todo: restify the response
        //todo: decrypt line items 
        res.status(200).send(form);
    });
}
exports.createForm = createForm;
;
function codeLookup(decode) {
    //todo: dummy
    if (decode == "IT")
        return 5;
    if (decode == "GST")
        return 10;
    if (decode == "STP")
        return 66;
    return -1;
}
exports.codeLookup = codeLookup;
module.exports = exports.router;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRm9ybUNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJGb3JtQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtREFBcUM7QUFDckMsaURBQW1DO0FBQ25DLEtBQUssQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUMxQixRQUFBLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDckMsd0RBQTBDO0FBRzFDLG1EQUE4RTtBQUU5RSxpQ0FBbUc7QUFDbkcsK0RBQW1OO0FBRW5OLDBFQUF5VztBQUN6VyxnRkFBZ0Y7QUFDaEYsaURBQWlEO0FBQ2pELGdGQUFnRjtBQUNoRixjQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLGNBQU0sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFFdEQsY0FBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEdBQVEsRUFBRSxHQUFRLEVBQUUsSUFBUztJQUM5QyxHQUFHLENBQUMsTUFBTSxDQUFDLDZCQUE2QixFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQy9DLEdBQUcsQ0FBQyxNQUFNLENBQUMsOEJBQThCLEVBQUUsZ0RBQWdELENBQUMsQ0FBQztJQUM3RixJQUFJLEVBQUUsQ0FBQztBQUNYLENBQUMsQ0FBQyxDQUFDO0FBRUgsY0FBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEdBQVEsRUFBRSxHQUFRLEVBQUUsSUFBUztJQUM5QyxLQUFLLENBQUMsS0FBSyxDQUFDLDZCQUE2QixHQUFHLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxNQUFNLEtBQUssR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7SUFDaEYsSUFBSSxFQUFFLENBQUM7QUFDWCxDQUFDLENBQUMsQ0FBQTtBQUVGLGdGQUFnRjtBQUNoRixpREFBaUQ7QUFDakQsZ0ZBQWdGO0FBQ2hGLGlGQUFpRjtBQUNqRix5RUFBeUU7QUFDekUsMEZBQTBGO0FBQzFGLDhEQUFnRDtBQUdoRCxJQUFJLGFBQWEsR0FBRyxDQUFDLDBCQUEwQixFQUFFLHFCQUFxQixDQUFDLENBQUE7QUFDdkUsSUFBSSxhQUFhLEdBQUcsQ0FBQywwQkFBMEIsRUFBRSxxQkFBcUIsRUFBRSw2QkFBNkIsRUFBRSxxQkFBcUIsRUFBRSx1QkFBdUIsRUFBRSx3QkFBd0IsQ0FBQyxDQUFBO0FBRWhMLFVBQVUsQ0FBQyxlQUFlLENBQUMsY0FBTSxDQUFDLENBQUM7QUFDbkMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtJQUNoQyxjQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDdkMsY0FBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3RDLGNBQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLHdCQUF3QixDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDaEUsQ0FBQyxDQUFDLENBQUM7QUFFSCxrQkFBa0I7QUFDbEIsY0FBTSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUseUJBQXlCLENBQUMsQ0FBQztBQUNwRCxjQUFNLENBQUMsTUFBTSxDQUFDLGtGQUFrRixFQUFFLENBQUMscUJBQXFCLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUN2SSxjQUFNLENBQUMsTUFBTSxDQUFDLDRFQUE0RSxFQUFFLENBQUMscUJBQXFCLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUNqSSxjQUFNLENBQUMsR0FBRyxDQUFDLDBFQUEwRSxFQUFFLENBQUMsMEJBQTBCLEVBQUUscUJBQXFCLENBQUMsRUFBRSxlQUFlLENBQUMsQ0FBQztBQUM3SixjQUFNLENBQUMsR0FBRyxDQUFDLDBFQUEwRSxFQUFFLENBQUMsMEJBQTBCLEVBQUUscUJBQXFCLENBQUMsRUFBRSxlQUFlLENBQUMsQ0FBQztBQUM3SixjQUFNLENBQUMsR0FBRyxDQUFDLDJFQUEyRSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQ3pHLGNBQU0sQ0FBQyxHQUFHLENBQUMsOEJBQThCLEVBQUUsZUFBZSxDQUFDLENBQUM7QUFFNUQscUJBQXFCO0FBQ3JCLGNBQU0sQ0FBQyxNQUFNLENBQUMsb0ZBQW9GLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDaEgsY0FBTSxDQUFDLE1BQU0sQ0FBQyx5RUFBeUUsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUNyRyxjQUFNLENBQUMsTUFBTSxDQUFDLDhEQUE4RCxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBRTFGLDRFQUE0RTtBQUM1RSx5REFBeUQ7QUFDekQsNkpBQTZKO0FBQzdKLG9CQUFvQjtBQUNwQixrQkFBa0I7QUFDbEIsNEhBQTRIO0FBQzVILGVBQWU7QUFDZix5QkFBeUI7QUFDekIsNEVBQTRFO0FBQzVFLG9HQUFvRztBQUNwRyxrRUFBa0U7QUFDbEUseUVBQXlFO0FBQ3pFLCtCQUErQjtBQUMvQiwwQ0FBMEM7QUFDMUMsdUZBQXVGO0FBQ3ZGLGdEQUFnRDtBQUNoRCw2Q0FBNkM7QUFDN0MsaUVBQWlFO0FBQ2pFLDZDQUE2QztBQUM3QyxpRUFBaUU7QUFDakUsdUNBQXVDO0FBQ3ZDLHNHQUFzRztBQUd0Ryx3RUFBd0U7QUFDeEUsc0VBQXNFO0FBQ3RFLGdFQUFnRTtBQUNoRSxpRUFBaUU7QUFDakUsb0RBQW9EO0FBQ3BELGdHQUFnRztBQUVoRyxxREFBcUQ7QUFDckQsOEJBQThCO0FBQzlCLG1HQUFtRztBQUNuRyxJQUFJO0FBR0osZ0ZBQWdGO0FBQ2hGLGlCQUFpQjtBQUNqQixnRkFBZ0Y7QUFDaEYsU0FBUywwQkFBMEIsQ0FBQyxHQUFvQixFQUFFLEdBQXFCLEVBQUUsSUFBMEI7SUFDdkcsS0FBSyxDQUFDLEtBQUssQ0FBQyw4REFBOEQsRUFBRSxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUE7SUFDNUYsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQVEsNENBQTRCLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBRWpFLElBQUksR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUksS0FBSyxJQUFJLEdBQUcsQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLEVBQUU7UUFDM0Qsa0NBQWtDO1FBQ2xDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWE7WUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLGNBQWMsRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFFLDJFQUEyRTtRQUNuSyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxvQkFBb0IsR0FBUyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU8sQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO1FBQzdHLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLHFCQUFxQixHQUFTLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7UUFFL0csT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLGdEQUFnRDtRQUUvRSw2SkFBNko7UUFDN0osSUFBSSxHQUFHLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUMvRixNQUFNLElBQUksS0FBSyxDQUFDLG9EQUFvRCxDQUFDLENBQUM7UUFFMUQsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFPLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ2xELEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTyxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztLQUNyRTtJQUNELElBQUksRUFBRSxDQUFBO0FBQ1YsQ0FBQztBQUVELDBDQUEwQztBQUMxQyxFQUFFO0FBQ0YsOEJBQThCO0FBQzlCLGtGQUFrRjtBQUNsRiwrSEFBK0g7QUFDL0gsU0FBZSxxQkFBcUIsQ0FBQyxHQUFRLEVBQUUsR0FBUSxFQUFFLElBQVM7O1FBQzlELHlDQUFvQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3hELENBQUM7Q0FBQTtBQUVELGdGQUFnRjtBQUNoRixjQUFjO0FBQ2QsZ0ZBQWdGO0FBQ2hGLHdDQUF3QztBQUN4QyxTQUFTLHlCQUF5QixDQUFDLEdBQVEsRUFBRSxHQUFRO0lBQ2pELEtBQUssQ0FBQyxLQUFLLENBQUMsb0RBQW9ELENBQUMsQ0FBQztJQUVsRSxXQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxVQUFVLEdBQW1CLEVBQUUsS0FBMEI7UUFDdkUsS0FBSyxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsRUFBRSxDQUFDLEdBQUcsSUFBSSxtQkFBbUIsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUNuSCxJQUFJLEdBQUc7WUFBRSxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLHdDQUF3QyxDQUFDLENBQUM7UUFDL0UsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVqQixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNoQyxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFBQSxDQUFDO0FBR0YsMkRBQTJEO0FBQzNELFNBQWdCLFFBQVEsQ0FBQyxHQUFvQixFQUFFLEdBQXFCLEVBQUUsSUFBMEI7SUFDNUYsS0FBSyxDQUFDLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0lBRTdDLFdBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxpREFBNEIsQ0FBQyxDQUFDLElBQUksQ0FBTSxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxVQUFVLEdBQVEsRUFBRSxLQUFVO1FBQ25ILEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsR0FBRyxJQUFJLG1CQUFtQixHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ2xHLElBQUksR0FBRztZQUFFLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsd0NBQXdDLENBQUMsQ0FBQztRQUMvRSxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRWpCLElBQUksQ0FBQyxLQUFLO1lBQUUsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBRTVELDRCQUE0QjtRQUM1QiwwQkFBMEI7UUFFMUIsSUFBSSxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQztZQUFFLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUU3RSxJQUFJLE1BQU0sR0FBUSxFQUFFLENBQUM7UUFDckIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQU0sRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxnRUFBMEMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLHVDQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRS9HLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2pDLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQXBCRCw0QkFvQkM7QUFBQSxDQUFDO0FBRUYsbUNBQW1DO0FBQ25DLFNBQWdCLGVBQWUsQ0FBQyxHQUFvQixFQUFFLEdBQXFCLEVBQUUsSUFBMEI7SUFDbkcsS0FBSyxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO0lBRXhELFdBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxpREFBNEIsQ0FBQyxDQUFDLElBQUksQ0FBUyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxVQUFVLEdBQW1CLEVBQUUsS0FBMEI7UUFDakosS0FBSyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLEdBQUcsSUFBSSxtQkFBbUIsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUN6RyxJQUFJLEdBQUc7WUFBRSxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLHFFQUFxRSxDQUFDLENBQUM7UUFDNUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVqQixJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDO1lBQUUsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDOztZQUNqRixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNyQyxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFYRCwwQ0FXQztBQUFBLENBQUM7QUFFRixhQUFhO0FBQ2IsU0FBZ0IsZUFBZSxDQUFDLEdBQW9CLEVBQUUsR0FBcUIsRUFBRSxJQUEwQjtJQUNuRyxLQUFLLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7SUFFeEQsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBQ3ZCLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxhQUFhO1FBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ25HLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTO1FBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQUM1RyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUztRQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLGtCQUFrQixFQUFFLENBQUM7SUFDNUcsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLG9CQUFvQixJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUU7UUFDckUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsNENBQTRDLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDO1FBQ2xHLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLDZDQUE2QyxDQUFDLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUMsQ0FBQztLQUNqSDtJQUVELEtBQUssQ0FBQyxLQUFLLENBQUMsaUNBQWlDLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsRSxrQkFBVyxDQUFDLElBQUksQ0FBUyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxVQUFVLEdBQW1CLEVBQUUsS0FBMEI7UUFDakcsS0FBSyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLEdBQUcsSUFBSSxtQkFBbUIsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUN6RyxJQUFJLEdBQUc7WUFBRSxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLHFFQUFxRSxDQUFDLENBQUM7UUFDNUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVqQixJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDO1lBQUUsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDOztZQUNqRixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNyQyxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFyQkQsMENBcUJDO0FBQUEsQ0FBQztBQUNGLGdGQUFnRjtBQUNoRixpQkFBaUI7QUFDakIsZ0ZBQWdGO0FBQ2hGLFNBQVMsNkJBQTZCLENBQUMsR0FBUSxFQUFFLEdBQVEsRUFBRSxJQUFTO0lBQ2hFLEtBQUssQ0FBQyxLQUFLLENBQUMsdURBQXVELEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFFNUcsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLGdCQUFnQjtRQUMzQixPQUFPLElBQUksRUFBRSxDQUFDLENBQUMsMElBQTBJO0lBRTdKLElBQUk7UUFDQSxNQUFNLDJCQUEyQixHQUFHLG1EQUE4QixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN0RyxLQUFLLENBQUMsS0FBSyxDQUFDLHFDQUFxQyxJQUFJLENBQUMsU0FBUyxDQUFDLDJCQUEyQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRWhHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWE7WUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUE7UUFDeEQsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxHQUFHLFdBQVcsQ0FBQztRQUVwRCxLQUFLLENBQUMsS0FBSyxDQUFDLHNCQUFzQixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoRixLQUFLLENBQUMsR0FBRyxDQUFDLG1CQUFtQixHQUFHLENBQUMsTUFBTSxDQUFDLFlBQVksMEJBQTBCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpREFBNEIsQ0FBQyxDQUFDLENBQUM7UUFFL0gsS0FBSyxDQUFDLEtBQUssQ0FBQyxxREFBcUQsQ0FBQyxDQUFDO1FBQ25FLFdBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxpREFBNEIsQ0FBQyxDQUFDLE9BQU8sQ0FBTSwyQkFBMkIsRUFBRSxVQUFVLEdBQVEsRUFBRSxTQUFjO1lBQ3BJLEtBQUssQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLEVBQUUsQ0FBQyxHQUFHLElBQUksYUFBYSxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsR0FBRyxTQUFTLENBQUMsYUFBYSxHQUFHLGdCQUFnQixDQUFDLENBQUMsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4TCxJQUFJLEdBQUc7Z0JBQUUsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyx5REFBeUQsQ0FBQyxDQUFDO1lBQ2hHLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFckIsSUFBSSxTQUFTO2dCQUNULDREQUF1QyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7aUJBRXRGLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDM0IsS0FBSyxDQUFDLEtBQUssQ0FBQyx1SEFBdUgsR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7Z0JBQ2pLLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsdUhBQXVILEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO2FBQ3BMO1lBRUwsSUFBSSxFQUFFLENBQUM7UUFDWCxDQUFDLENBQUMsQ0FBQztLQUNOO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixLQUFLLENBQUMsS0FBSyxDQUFDLCtDQUErQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3BFLElBQUksRUFBRSxDQUFDO0tBQ1Y7SUFBQSxDQUFDO0FBQ04sQ0FBQztBQUFBLENBQUM7QUFFRixTQUFTLHFCQUFxQixDQUFDLEdBQW9CLEVBQUUsR0FBcUIsRUFBRSxJQUEwQjtJQUNsRyxLQUFLLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7SUFDeEQsS0FBSyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQUMsRUFBRSxDQUFBO0lBQzVILEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3BCLElBQUksaUJBQWlCLEdBQTBCLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ2pFLHNIQUFzSDtJQUN0SCxJQUFJLGlCQUFpQixDQUFDLHFCQUFxQjtRQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMscUJBQXFCLEdBQUcsaUJBQWlCLENBQUMscUJBQXFCLENBQUE7SUFDckgsSUFBSSxpQkFBaUIsQ0FBQyxnQkFBZ0I7UUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGlCQUFpQixDQUFDLGdCQUFnQixDQUFBO0lBQ3RHLElBQUksaUJBQWlCLENBQUMsUUFBUTtRQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLGlCQUFpQixDQUFDLFFBQVEsQ0FBQTtJQUM5RSxJQUFJLGlCQUFpQixDQUFDLGFBQWE7UUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsR0FBRyxpQkFBaUIsQ0FBQyxhQUFhLENBQUE7SUFDN0YsSUFBSSxpQkFBaUIsQ0FBQyxZQUFZO1FBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLEdBQUcsaUJBQWlCLENBQUMsWUFBWSxDQUFBO0lBQzFGLElBQUksaUJBQWlCLENBQUMsYUFBYTtRQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxHQUFHLGlCQUFpQixDQUFDLGFBQWEsQ0FBQztJQUU5RixLQUFLLENBQUMsS0FBSyxDQUFDLHFCQUFxQixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNsRixLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNwQixHQUFHLENBQUMsSUFBSSxHQUFHLDZCQUFzQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUU1QyxLQUFLLENBQUMsS0FBSyxDQUFDLDJCQUEyQixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN4RixLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUVwQixJQUFJLEVBQUUsQ0FBQTtBQUNWLENBQUM7QUFFRCxTQUFTLHVCQUF1QixDQUFDLEdBQW9CLEVBQUUsR0FBcUIsRUFBRSxJQUEwQjtJQUVwRyxJQUFJLDBDQUFxQixJQUFJLE1BQU0sRUFBRTtRQUNqQyxJQUFJLFlBQVksR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO1FBQzVCLDZFQUE2RTtRQUM3RSxJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsK0JBQStCLENBQUMsQ0FBQyxDQUFFLHNGQUFzRjtRQUNySixJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUNqRCxJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUMzQyxJQUFJLGFBQWEsR0FBRyxZQUFZLENBQUMsYUFBYSxDQUFDO1FBQy9DLE9BQU8sWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFFLCtGQUErRjtRQUVuSSwyR0FBMkc7UUFFM0csbUpBQW1KO1FBQ25KLGtGQUFrRjtRQUNsRixNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUc7WUFDM0MsSUFBSSxPQUFPLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksUUFBUSxFQUFFLEVBQUUsc0hBQXNIO2dCQUNoSyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUc7b0JBRWhELElBQUksWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRTt3QkFDOUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO3dCQUNsSCxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsaUNBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztxQkFDcEU7eUJBQU07d0JBQ0gsSUFBSSxpQ0FBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLGlDQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDOzRCQUMzQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsaUNBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztxQkFDN0Y7Z0JBQ0wsQ0FBQyxDQUFDLENBQUE7YUFDTDtRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxFQUFFLEdBQUcsSUFBSSxXQUFXLENBQUMsaUNBQVksRUFBRSxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDakUsS0FBSyxDQUFDLEtBQUssQ0FBQyxpREFBaUQsQ0FBQyxDQUFDO1FBQy9ELEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNULElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQztZQUN0QixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDakIsY0FBYyxFQUFFLCtCQUErQixHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLE9BQU87Z0JBQzVFLEtBQUssRUFBRSxFQUFFLENBQUMsTUFBTTthQUNuQixDQUFDLENBQUM7UUFFUCxLQUFLLENBQUMsS0FBSyxDQUFDLHlEQUF5RCxDQUFDLENBQUM7UUFFdkUseURBQXlEO1FBQ3pELG9FQUE4QyxDQUFDLFlBQVksRUFBRSxxQ0FBZ0IsQ0FBQyxDQUFDO1FBQy9FLGtHQUFrRztRQUNsRyxrRkFBa0Y7UUFFbEYsNEtBQTRLO1FBQzVLLFlBQVksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUM7UUFFcEMsWUFBWSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7UUFDM0MsR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDO0tBQ3JDO0lBQUEsQ0FBQztJQUVGLElBQUksRUFBRSxDQUFDO0FBRVgsQ0FBQztBQUVELFNBQVMsd0JBQXdCLENBQUMsR0FBb0IsRUFBRSxHQUFxQixFQUFFLElBQTBCO0lBQ3JHLHNDQUFzQztJQUN0QyxJQUFJLEVBQUUsQ0FBQTtBQUNWLENBQUM7QUFFRCxnRkFBZ0Y7QUFDaEYsY0FBYztBQUNkLGdGQUFnRjtBQUNoRiwwREFBMEQ7QUFDMUQscUVBQXFFO0FBQ3JFLFNBQXNCLE9BQU8sQ0FBQyxHQUFvQixFQUFFLEdBQXFCLEVBQUUsSUFBMEI7O1FBQ2pHLEtBQUssQ0FBQyxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztRQUMzQyxLQUFLLENBQUMsS0FBSyxDQUFDLDBCQUEwQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQzVFLEtBQUssQ0FBQyxLQUFLLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQztRQUNyRixLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQixLQUFLLENBQUMsR0FBRyxDQUFDLHlDQUF5QyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsaURBQTRCLENBQUMsQ0FBQyxDQUFDO1FBRXBHLEtBQUssQ0FBQyxLQUFLLENBQUMsc0JBQXNCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUUvRSxHQUFHLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxNQUFNLFlBQVksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFckQsV0FBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLGlEQUE0QixDQUFDLENBQUMsZ0JBQWdCLENBQVMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLFVBQWdCLEdBQVEsRUFBRSxJQUFTOztnQkFDOUssS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxHQUFHLElBQUksa0JBQWtCLEdBQUcsSUFBSSxDQUFDLGFBQWEsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNyRixJQUFJLEdBQUc7b0JBQ0gsSUFBSSxHQUFHLENBQUMsSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksRUFBRSxDQUFDLENBQUMsYUFBYSxJQUFJLENBQUMsRUFBRTt3QkFDaEUsS0FBSyxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLENBQUMsQ0FBQzt3QkFFeEMseUdBQXlHO3dCQUN6RyxrSEFBa0g7d0JBQ2xILDRDQUE0Qzt3QkFDNUMsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyw0R0FBNEcsQ0FBQyxDQUFDO3FCQUM3STt5QkFDSTt3QkFDRCxLQUFLLENBQUMsS0FBSyxDQUFDLHNCQUFzQixFQUFFLEdBQUcsQ0FBQyxDQUFDO3dCQUN6QyxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLHdDQUF3QyxDQUFDLENBQUM7cUJBQ3pFO2dCQUNMLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRWhCLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLElBQUksV0FBVztvQkFDOUUscUJBQXFCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUVwQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztnQkFDekcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQztnQkFFbkQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsVUFBVTtvQkFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLHVDQUF1QyxHQUFHLENBQUMsV0FBVyxtREFBbUQsQ0FBQyxDQUFBO2dCQUUvSyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxVQUFVO29CQUFFLE1BQU0sZ0JBQWdCLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUM7eUJBQzdELEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRTt3QkFDVCxLQUFLLENBQUMsS0FBSyxDQUFDLDRCQUE0QixFQUFFLEdBQUcsQ0FBQyxDQUFDO3dCQUMvQyxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLHdDQUF3QyxDQUFDLENBQUE7b0JBQ3pFLENBQUMsQ0FBQyxDQUFDO2dCQUNQLElBQUksRUFBRSxDQUFDO1lBQ1gsQ0FBQztTQUFBLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FBQTtBQTNDRCwwQkEyQ0M7QUFBQSxDQUFDO0FBRUYsU0FBUyxxQkFBcUIsQ0FBQyxZQUFvQjtJQUMvQywyQ0FBMkM7QUFDL0MsQ0FBQztBQUVELFNBQWUsWUFBWSxDQUFDLEdBQW9CLEVBQUUsR0FBMEI7O1FBQ3hFLElBQUksU0FBUyxHQUFRLE1BQU0sV0FBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLGlEQUE0QixDQUFDLENBQUMsSUFBSSxDQUFTLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDOUgsSUFBSSxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUN0QixTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBYSxFQUFFLEVBQUU7Z0JBQ2hDLGtCQUFXLENBQUMsTUFBTSxDQUFDLEVBQUUsYUFBYSxFQUFFLFFBQVEsQ0FBQyxhQUFhLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxDQUFDO3FCQUN6SSxLQUFLLENBQUMsQ0FBQyxNQUFXLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsaUZBQWlGLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDcEksS0FBSyxDQUFDLEtBQUssQ0FBQywrQkFBK0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUMxRixDQUFDLENBQUMsQ0FBQztTQUNOO1FBQ0QsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDbEMsQ0FBQztDQUFBO0FBRUQsMERBQTBEO0FBQzFELFNBQXNCLG1CQUFtQixDQUFDLEdBQW9CLEVBQUUsR0FBcUIsRUFBRSxJQUEwQjs7UUFFN0csS0FBSyxDQUFDLEtBQUssQ0FBQyx1REFBdUQsQ0FBQyxDQUFDO1FBQ3JFLCtCQUErQjtRQUUvQixJQUFJLDBDQUFxQixJQUFJLE1BQU0sRUFBRTtZQUNqQyw0RUFBNEU7WUFDNUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxDQUFDO1NBQzdDO1FBRUQsNEJBQTRCO1FBQzVCLDJCQUEyQjtRQUUzQixNQUFNLHlDQUFvQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUU5RCxJQUFJLElBQUksR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDaEMsSUFBSSxrQkFBa0IsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNwRCxJQUFJLCtCQUFVLElBQUksTUFBTSxFQUFFO1lBQ3RCLElBQUksR0FBRyxnRUFBMEMsQ0FBQyxJQUFJLEVBQUUsdUNBQWtCLENBQUMsQ0FBQztTQUMvRTtRQUVELEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFekMsTUFBTSxTQUFTLENBQUMsR0FBRyxFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFDekMsS0FBSyxDQUFDLEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO0lBQzlELENBQUM7Q0FBQTtBQXpCRCxrREF5QkM7QUFBQSxDQUFDO0FBRUYsU0FBZSxnQkFBZ0IsQ0FBQyxHQUFRLEVBQUUsR0FBUSxFQUFFLGtCQUF1Qjs7UUFDdkUsSUFBSSxvQkFBb0IsR0FBRyxNQUFNLDZDQUF3QixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUNqSCxJQUFJLG9CQUFvQixFQUFFO1lBQ3RCLElBQUk7Z0JBQ0EsTUFBTSxXQUFJLENBQUMsc0JBQXNCLEVBQUUsb0JBQW9CLENBQUMsTUFBTSxDQUFDO3FCQUMxRCxnQkFBZ0IsQ0FBQyxvQkFBb0IsQ0FBQyxZQUFZLEVBQUUsb0JBQW9CLENBQUMsVUFBVSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQzthQUMxSDtZQUNELE9BQU8sR0FBRyxFQUFFO2dCQUNSLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7YUFDdkI7WUFBQSxDQUFDO1NBQ0w7SUFDTCxDQUFDO0NBQUE7QUFFRCxTQUFlLFNBQVMsQ0FBQyxHQUFRLEVBQUUsa0JBQXVCOztRQUN0RCxJQUFJLFlBQVksR0FBRyxNQUFNLDZDQUF3QixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFDL0YsSUFBSSxZQUFZLEVBQUU7WUFDZCxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxhQUFhLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1NBQ3hIO0lBQ0wsQ0FBQztDQUFBO0FBRUQsU0FBUyxrQkFBa0IsQ0FBQyxhQUFrQixFQUFFLGFBQWtCLEVBQUUsYUFBa0IsRUFBRSxJQUFTO0lBQzdGLGtCQUFXLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxFQUFFLGFBQWEsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxVQUFVLEdBQVEsRUFBRSxpQkFBc0I7UUFDaEgsS0FBSyxDQUFDLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO1FBQ3JELElBQUksR0FBRztZQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLEVBQUUsR0FBRyxDQUFDLENBQUE7YUFFdkQsSUFBSSxpQkFBaUI7WUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLGlDQUFpQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsa0VBQWtFLEtBQUssSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLDBDQUEwQyxFQUFFLENBQUMsQ0FBQTthQUMvTjtZQUNELEtBQUssQ0FBQyxLQUFLLENBQUMsdUNBQXVDLENBQUMsQ0FBQztZQUNyRCxPQUFPLGFBQWEsQ0FBQyxLQUFLLENBQUM7WUFDM0Isa0JBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUUsYUFBYSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsVUFBVSxHQUFRLEVBQUUsaUJBQXNCO2dCQUM5SCxLQUFLLENBQUMsS0FBSyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7Z0JBQ3JELElBQUksR0FBRztvQkFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO3FCQUV2RCxJQUFJLENBQUMsaUJBQWlCO29CQUNsQixNQUFNLGlDQUFpQyxDQUFDOztvQkFDdkMsS0FBSyxDQUFDLEtBQUssQ0FBQyxpQ0FBaUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLGtFQUFrRSxLQUFLLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQywwQ0FBMEMsRUFBRSxDQUFDLENBQUM7WUFDM04sQ0FBQyxDQUFDLENBQUM7U0FDTjtJQUNULENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUdELFNBQXNCLGVBQWUsQ0FBQyxHQUFvQixFQUFFLEdBQXFCLEVBQUUsSUFBMEI7O1FBRXpHLHFDQUFxQztRQUNyQyw0SUFBNEk7UUFDNUksb0tBQW9LO1FBQ3BLLHlIQUF5SDtRQUN6SCx1SUFBdUk7UUFDdkkseUlBQXlJO1FBQ3pJLG1EQUFtRDtRQUNuRCxrRUFBa0U7UUFDbEUsS0FBSyxDQUFDLEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFBO1FBQ2xELElBQUksQ0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU8sQ0FBQyxvQ0FBb0MsQ0FBQyxJQUFJLENBQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFPLENBQUMscUNBQXFDLENBQUM7WUFDbkksT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO1FBRTNFLHlFQUF5RTtRQUN6RSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsb0JBQW9CLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWM7WUFDdkksT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1FBRXhFLE1BQU0sUUFBUSxHQUFRLDJDQUFzQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNoRixNQUFNLFlBQVksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDN0IsS0FBSyxDQUFDLEtBQUssQ0FBQywyQkFBMkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsbUJBQW1CLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUU5RyxXQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsaURBQTRCLENBQUMsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLFVBQVUsR0FBUSxFQUFFLE9BQVk7WUFDM0gsS0FBSyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLEdBQUcsSUFBSSw0QkFBNEIsR0FBRyxPQUFPLENBQUMsU0FBUyxHQUFHLE1BQU0sR0FBRyxPQUFPLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDN0gsSUFBSSxHQUFHO2dCQUFFLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsNkNBQTZDLENBQUMsQ0FBQztZQUNwRixLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRW5CLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUNqQixPQUFPLEVBQUUsVUFBVSxHQUFHLE9BQU8sQ0FBQyxTQUFTLEdBQUcsTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDLEdBQUcsVUFBVTtnQkFDekUsT0FBTyxFQUFFLE9BQU87YUFDbkIsQ0FBQyxDQUFDO1lBRUgsSUFBSSxFQUFFLENBQUM7UUFDWCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FBQTtBQWxDRCwwQ0FrQ0M7QUFBQSxDQUFDO0FBRUYsZ0ZBQWdGO0FBQ2hGLGlCQUFpQjtBQUNqQixnRkFBZ0Y7QUFDaEYsMERBQTBEO0FBQzFELFNBQWdCLFVBQVUsQ0FBQyxHQUFvQixFQUFFLEdBQXFCLEVBQUUsSUFBMEI7SUFDOUYsS0FBSyxDQUFDLEtBQUssQ0FBQyx1Q0FBdUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDL0QsTUFBTSxNQUFNLEdBQWtCLDRDQUE0QixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUV0RSxLQUFLLENBQUMsS0FBSyxDQUFDLGtDQUFrQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUN6RSxLQUFLLENBQUMsS0FBSyxDQUFDLGtDQUFrQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3hELFdBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxpREFBNEIsQ0FBQyxDQUFDLGdCQUFnQixDQUFTLE1BQU0sRUFBRSxVQUFVLEdBQVEsRUFBRSxJQUFTO1FBQ3RILEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUMsR0FBRyxJQUFJLGFBQWEsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsdUJBQXVCLENBQUMsQ0FBQyxDQUFDO1FBQ2xILElBQUksR0FBRztZQUFFLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsNENBQTRDLENBQUMsQ0FBQztRQUNuRixLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWhCLElBQUksQ0FBQyxJQUFJO1lBQUUsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxvREFBb0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7O1lBQ2hILEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLDRCQUE0QixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNwRixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFkRCxnQ0FjQztBQUFBLENBQUM7QUFFRixTQUFzQixVQUFVLENBQUMsR0FBb0IsRUFBRSxHQUFxQixFQUFFLElBQTBCOztRQUNwRywwR0FBMEc7UUFDMUcseUNBQXlDO1FBQ3pDLGlJQUFpSTtRQUNqSSxxQkFBcUI7UUFFckIsaUVBQWlFO1FBQ2pFLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLGFBQWEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLG9CQUFvQixJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRTtZQUN0SixLQUFLLENBQUMsS0FBSyxDQUFDLG1FQUFtRSxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztZQUNsRyxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLGlFQUFpRSxDQUFDLENBQUM7U0FDbEc7UUFDRCxNQUFNLHNCQUFzQixHQUFRLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixFQUFFLGtCQUFrQixFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDckcsc0JBQXNCLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzFFLHNCQUFzQixDQUFDLFNBQVMsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDdkYsc0JBQXNCLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQ3hELHNCQUFzQixDQUFDLG9DQUFvQyxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztRQUMvRixzQkFBc0IsQ0FBQyxxQ0FBcUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFFM0csTUFBTSxZQUFZLEdBQVEsRUFBRSxrQkFBa0IsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQzdELFlBQVksQ0FBQyxxQ0FBcUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3pGLFlBQVksQ0FBQywwQ0FBMEMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUM7UUFDM0YsWUFBWSxDQUFDLDJDQUEyQyxDQUFDLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUV2RyxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUM7UUFDdEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFO1lBQzVCLElBQUksb0JBQW9CLEdBQUcsTUFBTSxlQUFRLENBQUMsT0FBTyxDQUFDLHNCQUFzQixDQUFRLENBQUM7WUFDakYsSUFBSSxDQUFDLG9CQUFvQixFQUFFO2dCQUN2QixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQywwREFBMEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDekgsT0FBTzthQUNWO1lBQ0QsYUFBYSxHQUFHLG9CQUFvQixDQUFDLG1CQUFtQixDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQyx1REFBdUQ7WUFFakksd0VBQXdFO1lBQ3hFLE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxlQUFRLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzVELElBQUksZ0JBQWdCLEtBQUssYUFBYSxFQUFFO2dCQUNwQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxrREFBa0QsYUFBYSx3QkFBd0IsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO2dCQUNoSSxPQUFPO2FBQ1Y7U0FDSjtRQUVELGtJQUFrSTtRQUNsSSxNQUFNLDRCQUE0QixHQUFHLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLGtCQUFrQixFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxDQUFDO1FBQUEsQ0FBQztRQUN4SixvQkFBb0IsR0FBRyxNQUFNLGVBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxzQkFBc0IsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO1FBQzdHLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtZQUN2QixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyw2Q0FBNkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBQzdILE9BQU87U0FDVjtRQUVELDRCQUE0QixDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQztRQUNwRCxNQUFNLFNBQVMsR0FBRyxNQUFNLGVBQVEsQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLDRCQUE0QixDQUFDLENBQUM7UUFDeEYsSUFBSSxTQUFTLENBQUMsQ0FBQyxLQUFLLGFBQWEsSUFBSSxTQUFTLENBQUMsQ0FBQyxLQUFLLFNBQVMsQ0FBQyxTQUFTLEVBQUU7WUFDdEUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLGFBQWEsMEJBQTBCLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1lBQ3pHLE9BQU07U0FDVDtRQUVELEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7Q0FBQTtBQXhERCxnQ0F3REM7QUFFRCw0R0FBNEc7QUFDNUcsMkNBQTJDO0FBRTNDLHVFQUF1RTtBQUN2RSw2QkFBNkI7QUFDN0IsOEJBQThCO0FBQzlCLDhFQUE4RTtBQUM5RSx5RUFBeUU7QUFFekUsMkRBQTJEO0FBQzNELDRHQUE0RztBQUU1RyxrSEFBa0g7QUFDbEgsc0ZBQXNGO0FBQ3RGLHNDQUFzQztBQUN0QyxZQUFZO0FBQ1osTUFBTTtBQUVOLGlIQUFpSDtBQUNqSCxTQUFnQixVQUFVLENBQUMsR0FBUSxFQUFFLEdBQVE7SUFDekMsS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUMzQixLQUFLLENBQUMsS0FBSyxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFckMsbUNBQW1DO0lBQ25DLGtEQUFrRDtJQUNsRCw4QkFBOEI7SUFDOUIsd0NBQXdDO0lBQ3hDLG9DQUFvQztJQUdwQyxXQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQ3BCLFVBQVUsR0FBbUIsRUFBRSxJQUF1QztRQUNsRSxLQUFLLENBQUMsS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDdkMsSUFBSSxHQUFHO1lBQUUsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQywrREFBK0QsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFcEgsK0JBQStCO1FBQy9CLDRCQUE0QjtRQUM1QiwyQkFBMkI7UUFFM0IsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0IsQ0FBQyxDQUFDLENBQUM7QUFDWCxDQUFDO0FBdEJELGdDQXNCQztBQUFBLENBQUM7QUFFRixTQUFnQixVQUFVLENBQUMsTUFBYztJQUNyQyxhQUFhO0lBQ2IsSUFBSSxNQUFNLElBQUksSUFBSTtRQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzdCLElBQUksTUFBTSxJQUFJLEtBQUs7UUFBRSxPQUFPLEVBQUUsQ0FBQztJQUMvQixJQUFJLE1BQU0sSUFBSSxLQUFLO1FBQUUsT0FBTyxFQUFFLENBQUM7SUFDL0IsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUNkLENBQUM7QUFORCxnQ0FNQztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsY0FBTSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgbXlMb2cgZnJvbSAnLi4vLi4vbXlMb2cnO1xyXG5pbXBvcnQgKiBhcyBleHByZXNzIGZyb20gJ2V4cHJlc3MnO1xyXG5teUxvZy5kZWJ1ZygnSW5zaWRlIEZvcm1Db250cm9sbGVyJyk7XHJcbmV4cG9ydCB2YXIgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcclxuaW1wb3J0ICogYXMgYm9keVBhcnNlciBmcm9tICdib2R5LXBhcnNlcic7XHJcbmltcG9ydCAqIGFzIG1vbmdvb3NlIGZyb20gJ21vbmdvb3NlJztcclxuXHJcbmltcG9ydCB7IGZvcm1RdWVyeVR5cGUsIHR1cm5VUkxTdGVtc0ludG9Mb29rdXBPYmplY3QgfSBmcm9tICcuL0Zvcm1VUkwyUXVlcnknO1xyXG5cclxuaW1wb3J0IHsgRm9ybSwgc2V0Rm9vdHByaW50UHJvcGVydGllcywgRm9ybURlZiwgSGlzdG9yeUZvcm0sIFByZUZpbGxGb3JtLCBCYXNlRm9ybSB9IGZyb20gJy4vRm9ybSc7XHJcbmltcG9ydCB7IHRyYW5zZm9ybUxlZ2FjeVN0b3JhZ2VUb1dpcmVGb3JtYXQsIHRyYW5zZm9ybU1lYW5pbmdmdWxTdG9yYWdlVG9KU1JFV2lyZUZvcm1hdCwgdHJhbnNmb3JtRnJvbUxlZ2FjeUpTUkVUb1N0b3JhZ2VGb3JtYXRfb2xkLCB0cmFuc2Zvcm1Gcm9tTGVnYWN5SlNSRVRvRXhwbGljaXRTdG9yYWdlRm9ybWF0IH0gZnJvbSBcIi4vdHJhbnNmb3JtV2lyZUZvcm1hdFwiO1xyXG5cclxuaW1wb3J0IHsgZ2V0RmFjdFNwZWNpZmljU3R1ZmYsIGxpbmVJdGVtc1NjaGVtYV9Gb3JtU3BlY2lmaWMsIGdldFByaW9yTG9kZ21lbnRMb29rdXBDcml0ZXJpYSwgY29uZmlybUNhblRha2VJZGVudGl0eUZyb21QcmlvckxvZGdtZW50LCBmb3JtTWV0YURhdGFCeU5hbWUsIGZvcm1NZXRhRGF0YSwgZm9ybU1ldGFEYXRhQnlJZCwgaWRlbnRpdHlMb29rdXBDcml0ZXJpYSwgcG9zdFB1dFByZVJldHVybkhvb2ssIGRlY2lkZVdoYXRUb1B1dEluUHJlZmlsbCwgYnVsa1RyYW5zbWlzc2lvblRyYWNraW5nLCBidXNpbmVzc1J1bGVzTGFuZ3VhZ2UsIHdpcmVGb3JtYXQgfSBmcm9tIFwiLi9mYWN0U3BlY2lmaWMvZmFjdFNwZWNpZmljUGx1Z2luXCI7XHJcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbi8vIGludm9rZSBtaWRkbGV3YXJlIGZ1bmN0aW9ucyAtIGV4cHJlc3MgY2VyZW1vbnlcclxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxucm91dGVyLnVzZShib2R5UGFyc2VyLmpzb24oKSk7XHJcbnJvdXRlci51c2UoYm9keVBhcnNlci51cmxlbmNvZGVkKHsgZXh0ZW5kZWQ6IHRydWUgfSkpO1xyXG5cclxucm91dGVyLnVzZShmdW5jdGlvbiAocmVxOiBhbnksIHJlczogYW55LCBuZXh0OiBhbnkpIHtcclxuICAgIHJlcy5oZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiwgXCIqXCIpO1xyXG4gICAgcmVzLmhlYWRlcihcIkFjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnNcIiwgXCJPcmlnaW4sIFgtUmVxdWVzdGVkLVdpdGgsIENvbnRlbnQtVHlwZSwgQWNjZXB0XCIpO1xyXG4gICAgbmV4dCgpO1xyXG59KTtcclxuXHJcbnJvdXRlci51c2UoZnVuY3Rpb24gKHJlcTogYW55LCByZXM6IGFueSwgbmV4dDogYW55KSB7XHJcbiAgICBteUxvZy5kZWJ1ZyhgaW4gRm9ybUNvbnRyb2xsZXIudHMvdXNlLCAke3JlcS51cmx9LCAke3JlcS5tZXRob2R9LCAke3JlcS5ib2R5fWApO1xyXG4gICAgbmV4dCgpO1xyXG59KVxyXG5cclxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuLy8gcmVnaXN0ZXIgdGhlIHJvdXRlcyBvZmZlcmVkIGluIHRoaXMgY29udHJvbGxlclxyXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4vLyBJIHRyaWVkIHRvIGhpZGUgIHRoZSBtZXNzc2luZXNzIG9mIHNldHRpbmcgdXAgRm9ybSBSb3V0ZXMgaW4gLi9zZXR1cGZvcm1yb3V0ZXNcclxuLy8gZ2V0Rm9ybXMgJiBwdXRGb3JtcyBhcmUgdGhlIGZ1bmN0aW9ucyB0aGF0IHdpbGwgYmUgY2FsbGVkIHJlc3BlY3RpdmVseVxyXG4vLyBidXQgSSBmb3VuZCBkaWZmZXJlbnQgYmVoYXZpb3VyIGJldHdlZW4gcmVnaXN0ZXJpbmcgdGhlIHJvdXRlIGhlcmUgb24gaW4gdGhlIHN1Ym1vZHVsZS5cclxuaW1wb3J0ICogYXMgRm9ybVJvdXRlcyBmcm9tICcuL1NldFVwRm9ybVJvdXRlcyc7XHJcbmltcG9ydCB7IG5ldHdvcmtJbnRlcmZhY2VzIH0gZnJvbSAnb3MnO1xyXG5cclxudmFyIGdldE1pZGRsZXdhcmUgPSBbZ2V0X3B1dF9FeHRyYWN0VVJMU3RlbUluZm8sIGxvYWRGYWN0U3BlY2lmaWNTdHVmZl1cclxudmFyIHB1dE1pZGRsZXdhcmUgPSBbZ2V0X3B1dF9FeHRyYWN0VVJMU3RlbUluZm8sIGxvYWRGYWN0U3BlY2lmaWNTdHVmZiwgZ2V0SWRGcm9tUHJpb3JNYXRjaGVkTG9kZ21lbnQsIHB1dF9TZXRGb290cHJpbnRQcm9wcywgcHV0X0pTUkVWYWxpZGF0aW9uUnVsZXMsIHB1dF9FbmNyeXB0U2Vuc2l0aXZlRGF0YV1cclxuXHJcbkZvcm1Sb3V0ZXMuc2V0VXBGb3JtUm91dGVzKHJvdXRlcik7XHJcbkZvcm1Sb3V0ZXMuZm9ybVJvdXRlcy5mb3JFYWNoKChyKSA9PiB7XHJcbiAgICByb3V0ZXIuZ2V0KHIsIGdldE1pZGRsZXdhcmUsIGdldEZvcm1zKTtcclxuICAgIHJvdXRlci5wdXQociwgcHV0TWlkZGxld2FyZSwgcHV0Rm9ybSk7XHJcbiAgICByb3V0ZXIucHV0KHIsIC8qIHB1dE1vcmVNaWRkbGV3YXJlLCAqLyBwdXRBcHBseVVwZGF0ZVJ1bGVzKTtcclxufSk7XHJcblxyXG4vLyBhIGNvdXBsZSBleHRyYXNcclxucm91dGVyLmdldCgnL0FsbC9Gb3JtcycsIGdldEFsbEZvcm1zVGVzdGluZ1VzZU9ubHkpO1xyXG5yb3V0ZXIuZGVsZXRlKCcvOkNsaWVudElkZW50aWZpZXJUeXBlLzpDbGllbnRJZGVudGlmaWVyVmFsdWUvRm9ybXMvOkZvcm1UeXBlTXVuZy86VHJhbnNhY3Rpb25JZCcsIFtsb2FkRmFjdFNwZWNpZmljU3R1ZmZdLCBkZWxldGVGb3JtKTtcclxucm91dGVyLmRlbGV0ZSgnLzpDbGllbnRJZGVudGlmaWVyVHlwZS86Q2xpZW50SWRlbnRpZmllclZhbHVlL0Zvcm1zLzpGb3JtVHlwZU11bmcvX2lkLzpfaWQnLCBbbG9hZEZhY3RTcGVjaWZpY1N0dWZmXSwgZGVsZXRlRm9ybSk7XHJcbnJvdXRlci5nZXQoJy86Q2xpZW50SWRlbnRpZmllclR5cGUvOkNsaWVudElkZW50aWZpZXJWYWx1ZS9Gb3JtSWRlbnRpdHkvOkZvcm1UeXBlTXVuZycsIFtnZXRfcHV0X0V4dHJhY3RVUkxTdGVtSW5mbywgbG9hZEZhY3RTcGVjaWZpY1N0dWZmXSwgZ2V0Rm9ybUlkZW50aXR5KTtcclxucm91dGVyLnB1dCgnLzpDbGllbnRJZGVudGlmaWVyVHlwZS86Q2xpZW50SWRlbnRpZmllclZhbHVlL0Zvcm1JZGVudGl0eS86Rm9ybVR5cGVNdW5nJywgW2dldF9wdXRfRXh0cmFjdFVSTFN0ZW1JbmZvLCBsb2FkRmFjdFNwZWNpZmljU3R1ZmZdLCBwdXRGb3JtSWRlbnRpdHkpO1xyXG5yb3V0ZXIuZ2V0KCcvOkNsaWVudElkZW50aWZpZXJUeXBlLzpDbGllbnRJZGVudGlmaWVyVmFsdWUvRm9ybXNIaXN0b3J5LzpUcmFuc2FjdGlvbklkJywgZ2V0Rm9ybXNIaXN0b3J5KTtcclxucm91dGVyLmdldCgnL0Zvcm1zSGlzdG9yeS86VHJhbnNhY3Rpb25JZCcsIGdldEZvcm1zSGlzdG9yeSk7XHJcblxyXG4vL25vdCB5ZXQgaW1wbGVtZW50ZWRcclxucm91dGVyLmRlbGV0ZSgnLzpDbGllbnRJZGVudGlmaWVyVHlwZS86Q2xpZW50SWRlbnRpZmllclZhbHVlLzpUcmFuc2FjdGlvbklkLzpEVF9VcGRhdGUvOlRNX1VwZGF0ZScsIGNhbmNlbEZpbGUpO1xyXG5yb3V0ZXIuZGVsZXRlKCcvOkNsaWVudElkZW50aWZpZXJUeXBlLzpDbGllbnRJZGVudGlmaWVyVmFsdWUvOlRyYW5zYWN0aW9uSWQvOkRUX1VwZGF0ZScsIGNhbmNlbEZpbGUpO1xyXG5yb3V0ZXIuZGVsZXRlKCcvOkNsaWVudElkZW50aWZpZXJUeXBlLzpDbGllbnRJZGVudGlmaWVyVmFsdWUvOlRyYW5zYWN0aW9uSWQnLCBjYW5jZWxGaWxlKTtcclxuXHJcbi8vbmVlZCB0byB2YWxpZGF0ZSB1bmlxdWVuZXNzIG9mIHN1cHBsaWVyIHJlZmVyZW5jZSBhbmQgZWl0aGVyIGVycm9yIG9yIHdhcm5cclxuLy9Ub0RvOiBMaXN0IEZhY3RzIGJ5IFRyYW5zbWlzc2lvbiAmIFBvc2l0aW9uICYgZmFjdCB0eXBlXHJcbi8vdG9kbzogZmlsZSAmIHJlY29yZCBkdXBsaWNhdGUgY2hlY2tzIChkdXAgZmlsZTogMSkgZXh0ZXJuYWwgcmVmZXJlbmNlIG51bWJlcjsgMikgY2FjL3llYXIvcmVwb3J0ZXIvZGVyaXZlZCtyZWplY3RlZCBjb3VudCAtIHdoZXJlIG5vdCByZWplY3RlZC4gcmVjb3JkOiA/PylcclxuLy90b2RvOiByZXBsYWNlIGZpbGVcclxuLy90b2RvOiBhbWVuZCBmaWxlXHJcbi8vdG9kbzogZGV0ZWN0IGlmIGFsbCBtZXNzYWdlcyBmcm9tIGEgZmlsZSAodHJhbnNtaXNzaW9uL2NvbGxlY3Rpb24pIGhhdmUgYmVlbiByZWNlaXZlZCBhbmQgcHJvY2Vzc2VkICh3aXRoaW4gYSB0aW1lIHBlcmlvZClcclxuLy90b2RvOiBhcmNoaXZlXHJcbi8vdG9kbzogdHJhbnNmZXIgaWRlbnRpdHlcclxuLy90b2RvOiBkZWNpZGUgZm9yIHdoYXQgZXJyb3JzIHRvIGNyZWF0ZSB3b3JrIGl0ZW1zIChtYXliZSBhdCBwcm9kdWN0IGxldmVsKVxyXG4vL3RvZG86IHBvc3NpYmx5IG5lZWQgYnVsayBsb2FkIG1lY2hhbmlzbSB0aGF0IGJ5cGFzc2VzIGpzcmUgZm9yIGxvYWRpbmcgb2YgcHJvY2Vzc2VkIGRhdGEgZnJvbSBDSURDXHJcbi8vdG9kbzogbmVlZCBhIHNlcnZpY2UgdG8gc2VuZCBtZXNzYWdlIHRvIE1DSUQgdG8gdHJhbnNmZXIgY2xpZW50LlxyXG4vL3RvZG86IHdyaXRlIHVzYWdlIGxvZyAtIGJpODU1MCAtIG9yIGlzIHRoaXMgbGVmdCB0byB0aGUgRFNHIHRvIGhhbmRsZT8/XHJcbi8vdG9kbzogZXh0ZW5kIHJldGVudGlvbiBwZXJpb2RcclxuLy90b2RvOiBvdmVycmlkZSBKU1JFIGF0IGZvcm0gdW5pcXVlIGxldmVsXHJcbi8vdG9kbzogYWRkIG1xdHQgc3VwcG9ydDogaHR0cDovL3d3dy5zdGV2ZXMtaW50ZXJuZXQtZ3VpZGUuY29tL3VzaW5nLW5vZGUtbXF0dC1jbGllbnQvIFxyXG4vL3RvZG86IGltcGxlbWVudCBzdXBwb3J0IGZvciBodHRwIGhlYWRlciBBY2NlcHRcclxuLy90b2RvOiBjaGVjayBhZ2FpbnN0IFJlc3QgU3RkIHJlc3BvbnNlIGNvZGVzXHJcbi8vdG9kbzogY2hlY2sgSUYtTU9ESUZJRUQtU0lOQ0UgaGVhZGVyIChwb3NzaWJsZSAzMDQgcmV0dXJuIGNvZGUpXHJcbi8vdG9kbzogNDAwICYgNDIyIGlmIGZhaWxlZCB2YWxpZGF0aW9uIGVycm9yc1xyXG4vL3RvZG86IGNoZWNrIGFjY2VwdCwgY29udGVudC10eXBlICBpcyBhcHBsaWNhdGlvbi9qc29uO1ZlcnNpb249MVxyXG4vL3RvZG86IGNoZWNrIG91dCBjb250ZW50LWVuY29kaW5nIGd6aXBcclxuLy90b2RvOiBmaWx0ZXIgZGF0YSBpdGVtcyBiYXNlZCBvbiBjb25maWcgZGF0YSBpZiB0aGVyZSBpcyBkYXRhIHF1YWxpdHkgaXNzdWVzIC0gcmVxLiBmcm9tIElhbiB0YXlsb3IuXHJcblxyXG5cclxuLy8gSSBoYXZlIGRlbGliZXJhdGVseSBsZWZ0IG91dCBQb3N0LiAgSSBjYW4ndCBzZWUgdGhlIHVzZSBjYXNlIGZvciBpdDsgXHJcbi8vIGJ1dCB0aGlzIGltcGxpZXMgY29uc3VtZXJzIG11c3QgYWxsb2NhdGUgQkVUIG51bWJlcnMgZm9yIG5ldyBmb3JtcyBcclxuLy8gKG5vdGhpbmcgd3Jvbmcgd2l0aCB0aGF0IC0gYXMgbG9uZyBhcyB0aGV5IGZvbGxvdyBvdXIgcnVsZXMpO1xyXG4vLyBidXQgcGVyaGFwcyBJIGRvbid0IHVuZGVyc3RhbmQgc29tZSBvZiB0aGUgRHJhZnRGb3JtIHVzZWNhc2VzLlxyXG4vLyBhbnl3YXksIG5vdCBhdmFpbGFibGUgeWV0IC0gY29kZSBiZWxvdyBub3QgdGVzdGVkXHJcbi8vIHJvdXRlci5wb3N0KCcvOkNsaWVudElkZW50aWZpZXJUeXBlLzpDbGllbnRJZGVudGlmaWVyVmFsdWUvRm9ybXMvOkZvcm1UeXBlTXVuZycsIGNyZWF0ZUZvcm0pO1xyXG5cclxuLy8gaW1wb3J0ICogYXMgY29yZSBmcm9tIFwiZXhwcmVzcy1zZXJ2ZS1zdGF0aWMtY29yZVwiO1xyXG4vLyBkZWNsYXJlIG5hbWVzcGFjZSBleHByZXNzIHtcclxuLy8gICAgIGludGVyZmFjZSBSZXF1ZXN0PFAgZXh0ZW5kcyBjb3JlLlBhcmFtcyA9IGNvcmUuUGFyYW1zRGljdGlvbmFyeT4gZXh0ZW5kcyBjb3JlLlJlcXVlc3Q8UD4geyB9XHJcbi8vIH1cclxuXHJcblxyXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4vLyBHZXQgTWlkZGxld2FyZVxyXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5mdW5jdGlvbiBnZXRfcHV0X0V4dHJhY3RVUkxTdGVtSW5mbyhyZXE6IGV4cHJlc3MuUmVxdWVzdCwgcmVzOiBleHByZXNzLlJlc3BvbnNlLCBuZXh0OiBleHByZXNzLk5leHRGdW5jdGlvbikge1xyXG4gICAgbXlMb2cuZGVidWcoJ2luIEZvcm1Db250cm9sbGVyLyBnZXRfcHV0X0V4dHJhY3RVUkxTdGVtSW5mbywgb3JpZ2luYWxVcmwgOicsIHJlcS5vcmlnaW5hbFVybClcclxuICAgIHJlcy5sb2NhbHMubG9va3VwID0gPGFueT50dXJuVVJMU3RlbXNJbnRvTG9va3VwT2JqZWN0KHJlcSwgbmV4dCk7XHJcblxyXG4gICAgaWYgKHJlcS5ib2R5ICYmIChyZXEubWV0aG9kID09IFwiUFVUXCIgfHwgcmVxLm1ldGhvZCA9PSBcIlBPU1RcIikpIHtcclxuICAgICAgICAvL2kuZSByZXEubWV0aG9kID09XCJQVVRcIiB8fCBcIlBPU1RcIlxyXG4gICAgICAgIGlmICghcmVxLmJvZHkuc3ViamVjdENsaWVudCkgcmVxLmJvZHkuc3ViamVjdENsaWVudCA9IHsgTWF0Y2hpbmdTdGF0dXM6IFwiVW5NYXRjaGVkXCIgfTsgIC8vZGVmYXVsdCB0byB1bm1hdGNoZWQgdW50aWwgZmlsZSBpZCBmcm9tIHByaW9yIGxvZGdtZW50IG9yIGlkIG1hdGNoIHJlc3VsdFxyXG4gICAgICAgIHJlcS5ib2R5LnN1YmplY3RDbGllbnQuQ2xpZW50SWRlbnRpZmllclR5cGUgPSAoPGFueT5yZXMubG9jYWxzLmxvb2t1cClbXCJzdWJqZWN0Q2xpZW50LkNsaWVudElkZW50aWZpZXJUeXBlXCJdO1xyXG4gICAgICAgIHJlcS5ib2R5LnN1YmplY3RDbGllbnQuQ2xpZW50SWRlbnRpZmllclZhbHVlID0gKDxhbnk+cmVzLmxvY2Fscy5sb29rdXApW1wic3ViamVjdENsaWVudC5DbGllbnRJZGVudGlmaWVyVmFsdWVcIl07XHJcblxyXG4gICAgICAgIGRlbGV0ZSByZXEuYm9keS5UcmFuc2FjdGlvbklkOyAvL3RoaXMgc2hvdWxkIGNvbWUgZnJvbSB0aGUgVVJJLCBub3QgYmUgaW4gYm9keS5cclxuXHJcbiAgICAgICAgLy8gSG1tLCBTbyBpdCBpcyBwb3NzaWJsZSB0byB1c2UgdGhlIGZpbmRPbmVBbmRVcGRhdGUgd2l0aCB0aGUgdXBzZXJ0IG9wdGlvbiBpdCBpcyBuZWNlc3NhcnkgdG8gbWFrZSBJbnNlcnQgJiBVcGRhdGUgdGhlIHNhbWUsIHNvIERUL1RNIFVwZGF0ZSBhcmUgbWFuZGF0b3J5LlxyXG4gICAgICAgIGlmIChyZXEub3JpZ2luYWxVcmwuaW5kZXhPZihcIlxcL0Zvcm1JZGVudGl0eVxcL1wiKSA8IDAgJiYgKCFyZXEuYm9keS5EVF9VcGRhdGUgfHwgIXJlcS5ib2R5LlRNX1VwZGF0ZSkpXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk1pc3NpbmcgZm9vdHByaW50IHByb3BlcnR5IERUX1VwZGF0ZSBvciBUTV9VcGRhdGUuXCIpO1xyXG5cclxuICAgICAgICAoPGZvcm1RdWVyeVR5cGU+cmVzLmxvY2Fscy5sb29rdXApLkRUX1VwZGF0ZSA9IHJlcS5ib2R5LkRUX1VwZGF0ZTtcclxuICAgICAgICAoPGZvcm1RdWVyeVR5cGU+cmVzLmxvY2Fscy5sb29rdXApLlRNX1VwZGF0ZSA9IHJlcS5ib2R5LlRNX1VwZGF0ZTtcclxuICAgIH1cclxuICAgIG5leHQoKVxyXG59XHJcblxyXG4vL1RoaXMgbG9hZHMgYW55IGZvcm0gc3BlY2lmaWMgc3R1ZmYgY29kZS5cclxuLy9cclxuLy9saW5lSXRlbXNTY2hlbWFfRm9ybVNwZWNpZmljXHJcbi8vVGhlIEJhc2VGb3JtIHNjaGVtYSBoYXMgYW4gYXJyYXkgb2YgU2VjdGlvbnMgd2hpY2ggY29udGFpbiBhbiBhcnJheSBvZiBMaW5lSXRlbXNcclxuLy9UaGlzIGFkZHMgc3BlY2lmaWMgbGluZSBpdGVtcyB3aXRoIG1lYW5pbmdmdWwgbmFtZXMgdG8gdGhlIHNjaGVtYSAoYXMgd2VsbCBhcyB2aXJ0dWFsIGFsaWFzIHdpdGgganVzdCB0aGUgNSBkaWdpdCBpZGVudGlmaWVyKVxyXG5hc3luYyBmdW5jdGlvbiBsb2FkRmFjdFNwZWNpZmljU3R1ZmYocmVxOiBhbnksIHJlczogYW55LCBuZXh0OiBhbnkpIHtcclxuICAgIGdldEZhY3RTcGVjaWZpY1N0dWZmKHJlcS5wYXJhbXMuRm9ybVR5cGVNdW5nLCBuZXh0KTtcclxufVxyXG5cclxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuLy8gR2V0IE1ldGhvZHNcclxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuLy8gUkVUVVJOUyBBTEwgVEhFIEZPUk1TIElOIFRIRSBEQVRBQkFTRVxyXG5mdW5jdGlvbiBnZXRBbGxGb3Jtc1Rlc3RpbmdVc2VPbmx5KHJlcTogYW55LCByZXM6IGFueSkge1xyXG4gICAgbXlMb2cuZGVidWcoJ0luc2lkZSBGb3JtQ29udHJvbGxlci50cy9nZXRBbGxGb3Jtc1Rlc3RpbmdVc2VPbmx5Jyk7XHJcblxyXG4gICAgRm9ybShcIlwiKS5maW5kKHt9LCBmdW5jdGlvbiAoZXJyOiBtb25nb29zZS5FcnJvciwgZm9ybXM6IG1vbmdvb3NlLkRvY3VtZW50W10pIHtcclxuICAgICAgICBteUxvZy5kZWJ1ZygnZ2V0QWxsRm9ybXNUZXN0aW5nVXNlT25seTonLCAoZXJyIHx8IFwiTm8gZXJyb3JzLCBmb3VuZCBcIiArIChmb3JtcyA/IGZvcm1zLmxlbmd0aCA6IFwibm9cIikgKyBcIiBmb3Jtc1wiKSk7XHJcbiAgICAgICAgaWYgKGVycikgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5zZW5kKFwiVGhlcmUgd2FzIGEgcHJvYmxlbSBmaW5kaW5nIHRoZSBmb3Jtcy5cIik7XHJcbiAgICAgICAgbXlMb2cubG9nKGZvcm1zKTtcclxuXHJcbiAgICAgICAgcmVzLnN0YXR1cygyMDApLnNlbmQoZm9ybXMpO1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG5cclxuLy8gUkVUVVJOUyBBTEwgVEhFIEZPUk1TIElOIFRIRSBEQVRBQkFTRSBUSEFUIE1BVENIIFRIRSBVUkxcclxuZXhwb3J0IGZ1bmN0aW9uIGdldEZvcm1zKHJlcTogZXhwcmVzcy5SZXF1ZXN0LCByZXM6IGV4cHJlc3MuUmVzcG9uc2UsIG5leHQ6IGV4cHJlc3MuTmV4dEZ1bmN0aW9uKSB7XHJcbiAgICBteUxvZy5kZWJ1ZyhcIkluIEZvcm1Db250cm9sbGVyLnRzL2dldEZvcm1zXCIpO1xyXG5cclxuICAgIEZvcm0ocmVxLnBhcmFtcy5Gb3JtVHlwZU11bmcsIGxpbmVJdGVtc1NjaGVtYV9Gb3JtU3BlY2lmaWMpLmZpbmQoPGFueT5yZXMubG9jYWxzLmxvb2t1cCwgZnVuY3Rpb24gKGVycjogYW55LCBmb3JtczogYW55KSB7XHJcbiAgICAgICAgbXlMb2cuZGVidWcoJ2dldEZvcm1zOicsIChlcnIgfHwgXCJObyBlcnJvcnMsIGZvdW5kIFwiICsgKGZvcm1zID8gZm9ybXMubGVuZ3RoIDogXCJub1wiKSArIFwiIGZvcm1zXCIpKTtcclxuICAgICAgICBpZiAoZXJyKSByZXR1cm4gcmVzLnN0YXR1cyg1MDApLnNlbmQoXCJUaGVyZSB3YXMgYSBwcm9ibGVtIGZpbmRpbmcgdGhlIGZvcm1zLlwiKTtcclxuICAgICAgICBteUxvZy5sb2coZm9ybXMpO1xyXG5cclxuICAgICAgICBpZiAoIWZvcm1zKSByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLnNlbmQoXCJObyBmb3JtIGZvdW5kLiEhXCIpO1xyXG5cclxuICAgICAgICAvL3RvZG86IHJlc3RpZnkgdGhlIHJlc3BvbnNlXHJcbiAgICAgICAgLy90b2RvOiBkZWNyeXB0IGxpbmUgaXRlbXNcclxuXHJcbiAgICAgICAgaWYgKChmb3JtcyB8fCBbXSkubGVuZ3RoID09IDApIHJldHVybiByZXMuc3RhdHVzKDQwNCkuc2VuZChcIk5vIGZvcm0gZm91bmQuXCIpO1xyXG5cclxuICAgICAgICBsZXQgcmVzdWx0OiBhbnkgPSBbXTtcclxuICAgICAgICBmb3Jtcy5mb3JFYWNoKChmOiBhbnkpID0+IHJlc3VsdC5wdXNoKHRyYW5zZm9ybU1lYW5pbmdmdWxTdG9yYWdlVG9KU1JFV2lyZUZvcm1hdChmLl9kb2MsIGZvcm1NZXRhRGF0YUJ5TmFtZSkpKTtcclxuXHJcbiAgICAgICAgcmVzLnN0YXR1cygyMDApLnNlbmQocmVzdWx0KTtcclxuICAgIH0pO1xyXG59O1xyXG5cclxuLy9JIGNhbid0IHRoaW5rIG9mIGFueSB1c2Ugb2YgdGhpcyBcclxuZXhwb3J0IGZ1bmN0aW9uIGdldEZvcm1JZGVudGl0eShyZXE6IGV4cHJlc3MuUmVxdWVzdCwgcmVzOiBleHByZXNzLlJlc3BvbnNlLCBuZXh0OiBleHByZXNzLk5leHRGdW5jdGlvbikge1xyXG4gICAgbXlMb2cuZGVidWcoJ0luc2lkZSBGb3JtQ29udHJvbGxlci50cy9nZXRGb3JtSWRlbnRpdHknKTtcclxuXHJcbiAgICBGb3JtKHJlcS5wYXJhbXMuRm9ybVR5cGVNdW5nLCBsaW5lSXRlbXNTY2hlbWFfRm9ybVNwZWNpZmljKS5maW5kKDxPYmplY3Q+cmVzLmxvY2Fscy5sb29rdXAsIGZ1bmN0aW9uIChlcnI6IG1vbmdvb3NlLkVycm9yLCBmb3JtczogbW9uZ29vc2UuRG9jdW1lbnRbXSkge1xyXG4gICAgICAgIG15TG9nLmRlYnVnKCdnZXRGb3JtSWRlbnRpdHk6JywgKGVyciB8fCBcIk5vIGVycm9ycywgZm91bmQgXCIgKyAoZm9ybXMgPyBmb3Jtcy5sZW5ndGggOiBcIm5vXCIpICsgXCIgZm9ybXNcIikpO1xyXG4gICAgICAgIGlmIChlcnIpIHJldHVybiByZXMuc3RhdHVzKDUwMCkuc2VuZChcIlRoZXJlIHdhcyBhIHByb2JsZW0gZmluZGluZyB0aGUgZm9ybXMgd2l0aCByZXF1ZXN0ZWQgZm9ybSBpZGVudGl0eS5cIik7XHJcbiAgICAgICAgbXlMb2cubG9nKGZvcm1zKTtcclxuXHJcbiAgICAgICAgaWYgKChmb3JtcyB8fCBbXSkubGVuZ3RoID09IDApIHJldHVybiByZXMuc3RhdHVzKDQwNCkuc2VuZChcIk5vIEZvcm1JZGVudGl0eXMgZm91bmQuXCIpO1xyXG4gICAgICAgIGVsc2UgcmVzLnN0YXR1cygyMDApLnNlbmQoZm9ybXMpO1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG4vL0dldCBoaXN0b3J5XHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRGb3Jtc0hpc3RvcnkocmVxOiBleHByZXNzLlJlcXVlc3QsIHJlczogZXhwcmVzcy5SZXNwb25zZSwgbmV4dDogZXhwcmVzcy5OZXh0RnVuY3Rpb24pIHtcclxuICAgIG15TG9nLmRlYnVnKCdJbnNpZGUgRm9ybUNvbnRyb2xsZXIudHMvZ2V0Rm9ybXNIaXN0b3J5Jyk7XHJcblxyXG4gICAgcmVzLmxvY2Fscy5sb29rdXAgPSB7fTtcclxuICAgIGlmIChyZXEucGFyYW1zLlRyYW5zYWN0aW9uSWQpIHJlcy5sb2NhbHMubG9va3VwLlRyYW5zYWN0aW9uSWQgPSBwYXJzZUludChyZXEucGFyYW1zLlRyYW5zYWN0aW9uSWQpO1xyXG4gICAgaWYgKHJlcS5wYXJhbXMuRFRfVXBkYXRlKSByZXMubG9jYWxzLmxvb2t1cC5EVF9VcGRhdGUgPSBuZXcgRGF0ZShyZXEucGFyYW1zLkRUX1VwZGF0ZSkudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XHJcbiAgICBpZiAocmVxLnBhcmFtcy5UTV9VcGRhdGUpIHJlcy5sb2NhbHMubG9va3VwLlRNX1VwZGF0ZSA9IG5ldyBEYXRlKHJlcS5wYXJhbXMuVE1fVXBkYXRlKS50b0xvY2FsZVRpbWVTdHJpbmcoKTtcclxuICAgIGlmIChyZXEucGFyYW1zLkNsaWVudElkZW50aWZpZXJUeXBlICYmIHJlcS5wYXJhbXMuQ2xpZW50SWRlbnRpZmllclZhbHVlKSB7XHJcbiAgICAgICAgcmVzLmxvY2Fscy5sb29rdXBbJ2hpc3Rvcnkuc3ViamVjdENsaWVudC5DbGllbnRJZGVudGlmaWVyVHlwZSddID0gcmVxLnBhcmFtcy5DbGllbnRJZGVudGlmaWVyVHlwZTtcclxuICAgICAgICByZXMubG9jYWxzLmxvb2t1cFsnaGlzdG9yeS5zdWJqZWN0Q2xpZW50LkNsaWVudElkZW50aWZpZXJWYWx1ZSddID0gcGFyc2VJbnQocmVxLnBhcmFtcy5DbGllbnRJZGVudGlmaWVyVmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIG15TG9nLmRlYnVnKCdBYm91dCB0byBsb29rIGZvciBoaXN0b3J5IHdpdGg6JywgcmVzLmxvY2Fscy5sb29rdXApO1xyXG4gICAgSGlzdG9yeUZvcm0uZmluZCg8T2JqZWN0PnJlcy5sb2NhbHMubG9va3VwLCBmdW5jdGlvbiAoZXJyOiBtb25nb29zZS5FcnJvciwgZm9ybXM6IG1vbmdvb3NlLkRvY3VtZW50W10pIHtcclxuICAgICAgICBteUxvZy5kZWJ1ZygnZ2V0Rm9ybXNIaXN0b3J5OicsIChlcnIgfHwgXCJObyBlcnJvcnMsIGZvdW5kIFwiICsgKGZvcm1zID8gZm9ybXMubGVuZ3RoIDogXCJub1wiKSArIFwiIGZvcm1zXCIpKTtcclxuICAgICAgICBpZiAoZXJyKSByZXR1cm4gcmVzLnN0YXR1cyg1MDApLnNlbmQoXCJUaGVyZSB3YXMgYSBwcm9ibGVtIGZpbmRpbmcgdGhlIGZvcm1zIHdpdGggcmVxdWVzdGVkIGZvcm0gaWRlbnRpdHkuXCIpO1xyXG4gICAgICAgIG15TG9nLmxvZyhmb3Jtcyk7XHJcblxyXG4gICAgICAgIGlmICgoZm9ybXMgfHwgW10pLmxlbmd0aCA9PSAwKSByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLnNlbmQoXCJObyBGb3JtSWRlbnRpdHlzIGZvdW5kLlwiKTtcclxuICAgICAgICBlbHNlIHJlcy5zdGF0dXMoMjAwKS5zZW5kKGZvcm1zKTtcclxuICAgIH0pO1xyXG59O1xyXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4vLyBQdXQgTWlkZGxld2FyZVxyXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5mdW5jdGlvbiBnZXRJZEZyb21Qcmlvck1hdGNoZWRMb2RnbWVudChyZXE6IGFueSwgcmVzOiBhbnksIG5leHQ6IGFueSkge1xyXG4gICAgbXlMb2cuZGVidWcoJ0luIEZvcm1Db250cm9sbGVyLnRzLyBnZXRJZEZyb21Qcmlvck1hdGNoZWRMb2RnbWVudCwgJyArIHJlcS51cmwsIHJlcS5wYXJhbXMuQ2xpZW50SW50ZXJuYWxJZCk7XHJcblxyXG4gICAgaWYgKHJlcS5wYXJhbXMuQ2xpZW50SW50ZXJuYWxJZClcclxuICAgICAgICByZXR1cm4gbmV4dCgpOyAvL0NsaWVudCBJbnRlcm5hbCBJZCBtYXkgYmUga25vd24gZnJvbSB1cHN0cmVhbSBwcm9jZXNzLCBlLmcuIGF1dGhvcmlzYXRpb24gY2hlY2tzLCBpbiB3aGljaCBjYXNlIG5vIG5lZWQgdG8gbG9va3VwIGZyb20gcGVydmlvdXMgbG9kZ21lbnRcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHByaW9yTG9kZ21lbnRMb29rdXBDcml0ZXJpYSA9IGdldFByaW9yTG9kZ21lbnRMb29rdXBDcml0ZXJpYShyZXEucGFyYW1zLkZvcm1UeXBlTXVuZywgcmVxLCByZXMpO1xyXG4gICAgICAgIG15TG9nLmRlYnVnKGBMb29raW5nIGZvciBwcmlvciBsb2RnbWVudHMgd2l0aDogJHtKU09OLnN0cmluZ2lmeShwcmlvckxvZGdtZW50TG9va3VwQ3JpdGVyaWEpfWApO1xyXG5cclxuICAgICAgICBpZiAoIXJlcS5ib2R5LnN1YmplY3RDbGllbnQpIHJlcS5ib2R5LnN1YmplY3RDbGllbnQgPSB7fVxyXG4gICAgICAgIHJlcS5ib2R5LnN1YmplY3RDbGllbnQuTWF0Y2hpbmdTdGF0dXMgPSBcIlVuTWF0Y2hlZFwiO1xyXG5cclxuICAgICAgICBteUxvZy5kZWJ1ZyhgVGhlIGJvZHkgY29udGFpbnM6ICR7SlNPTi5zdHJpbmdpZnkocmVxLmJvZHkpLnN1YnN0cigwLCAxMDApfS4uLmApO1xyXG4gICAgICAgIG15TG9nLmxvZyhgVXNpbmcgYWRkdGlvbmFsICR7cmVxLnBhcmFtcy5Gb3JtVHlwZU11bmd9IGZvcm0gbGluZSBpdGVtIHNjaGVtYTogYCArIEpTT04uc3RyaW5naWZ5KGxpbmVJdGVtc1NjaGVtYV9Gb3JtU3BlY2lmaWMpKTtcclxuXHJcbiAgICAgICAgbXlMb2cuZGVidWcoXCIrKysrKysrKysrKyBhYm91dCB0byB0YWxrIHRvIE1vbmdvICsrKysrKysrKysrKysrKytcIik7XHJcbiAgICAgICAgRm9ybShyZXEucGFyYW1zLkZvcm1UeXBlTXVuZywgbGluZUl0ZW1zU2NoZW1hX0Zvcm1TcGVjaWZpYykuZmluZE9uZSg8YW55PnByaW9yTG9kZ21lbnRMb29rdXBDcml0ZXJpYSwgZnVuY3Rpb24gKGVycjogYW55LCBmb3VuZEZvcm06IGFueSkge1xyXG4gICAgICAgICAgICBteUxvZy5kZWJ1ZygnZ2V0SWRGcm9tUHJpb3JNYXRjaGVkTG9kZ21lbnQ6JywgKGVyciB8fCBcIk5vIGVycm9ycywgXCIgKyAoZm91bmRGb3JtID8gXCJQcmlvciBsb2RnZW1lbnQgd2l0aCBcIiArIGZvdW5kRm9ybS5UcmFuc2FjdGlvbklkICsgXCIgdHJhbiBpZCBmb3VuZFwiIDogXCJubyBwcmlvciBsb2RnbWVudHMgZm91bmRcIikpKTtcclxuICAgICAgICAgICAgaWYgKGVycikgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5zZW5kKFwiVGhlcmUgd2FzIGEgcHJvYmxlbSBnZXR0aW5nIG1hdGNoaW5nIHN0YXR1cyBmb3IgY2xpZW50LlwiKTtcclxuICAgICAgICAgICAgbXlMb2cubG9nKGZvdW5kRm9ybSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoZm91bmRGb3JtKVxyXG4gICAgICAgICAgICAgICAgY29uZmlybUNhblRha2VJZGVudGl0eUZyb21QcmlvckxvZGdtZW50KHJlcS5wYXJhbXMuRm9ybVR5cGVNdW5nLCByZXEsIGZvdW5kRm9ybSwgcmVzKTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgaWYgKHJlcS5ib2R5LkNsaWVudEludGVybmFsSWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBteUxvZy5kZWJ1ZyhgRmF0YWwgRXJyb3I6IENhbm5vdCBpbmNsdWRlIENsaWVudEludGVybmFsIElkIGluIHJlcXVlc3QuYm9keSBpZiB0aGVyZSBpcyBubyBwcmlvciBcIk1hdGNoZWRcIiBsb2RnbWVudCB3aXRoIHRoYXQgaWQgKCR7cmVxLmJvZHkuQ2xpZW50SW50ZXJuYWxJZH0pYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5zZW5kKGBGYXRhbCBFcnJvcjogQ2Fubm90IGluY2x1ZGUgQ2xpZW50SW50ZXJuYWwgSWQgaW4gcmVxdWVzdC5ib2R5IGlmIHRoZXJlIGlzIG5vIHByaW9yIFwiTWF0Y2hlZFwiIGxvZGdtZW50IHdpdGggdGhhdCBpZCAoJHtyZXEuYm9keS5DbGllbnRJbnRlcm5hbElkfSlgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIG5leHQoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgbXlMb2cuZXJyb3IoJ0NhdWdodCBlcnJvciBpbiBnZXRJZEZyb21Qcmlvck1hdGNoZWRMb2RnbWVudCcsIGVycm9yKTtcclxuICAgICAgICBuZXh0KCk7XHJcbiAgICB9O1xyXG59O1xyXG5cclxuZnVuY3Rpb24gcHV0X1NldEZvb3RwcmludFByb3BzKHJlcTogZXhwcmVzcy5SZXF1ZXN0LCByZXM6IGV4cHJlc3MuUmVzcG9uc2UsIG5leHQ6IGV4cHJlc3MuTmV4dEZ1bmN0aW9uKSB7XHJcbiAgICBteUxvZy5kZWJ1ZygnSW4gRm9ybUNvbnRyb2xsZXIvIHB1dF9TZXRGb290cHJpbnRQcm9wcycpO1xyXG4gICAgbXlMb2cuZGVidWcoYEluaXRpYWxseSBoYXZlICR7SlNPTi5zdHJpbmdpZnkocmVzLmxvY2Fscy5sb29rdXApfSBib2R5ICR7SlNPTi5zdHJpbmdpZnkocmVxLmJvZHkpLnN1YnN0cmluZygwLCAxMDApfS4uLmApOyBgYFxyXG4gICAgbXlMb2cubG9nKHJlcS5ib2R5KTtcclxuICAgIGxldCB0bXBSZXFQYXJtc0xvb2t1cDogZm9ybVF1ZXJ5VHlwZSA9IDxPYmplY3Q+cmVzLmxvY2Fscy5sb29rdXA7XHJcbiAgICAvL3RoaXMgd2lsbCBibG90IG91dCBhbnkgaW5jb25zaXRlbnQgcHJvcGVydGllcyBpbiB0aGUgcGF5bG9hZCAoZXh0cmEgZmllbGRzIHdpbGwgYmUgcmVtb3ZlZCBieSBtb25nb29zZSBzY2hlbWEgY2hlY2spXHJcbiAgICBpZiAodG1wUmVxUGFybXNMb29rdXAuQWNjb3VudFNlcXVlbmNlTnVtYmVyKSByZXEuYm9keS5BY2NvdW50U2VxdWVuY2VOdW1iZXIgPSB0bXBSZXFQYXJtc0xvb2t1cC5BY2NvdW50U2VxdWVuY2VOdW1iZXJcclxuICAgIGlmICh0bXBSZXFQYXJtc0xvb2t1cC5DbGllbnRJbnRlcm5hbElkKSByZXEuYm9keS5DbGllbnRJbnRlcm5hbElkID0gdG1wUmVxUGFybXNMb29rdXAuQ2xpZW50SW50ZXJuYWxJZFxyXG4gICAgaWYgKHRtcFJlcVBhcm1zTG9va3VwLkZvcm1UeXBlKSByZXEuYm9keS5Gb3JtVHlwZSA9IHRtcFJlcVBhcm1zTG9va3VwLkZvcm1UeXBlXHJcbiAgICBpZiAodG1wUmVxUGFybXNMb29rdXAuUGVyaW9kU3RhcnREdCkgcmVxLmJvZHkuUGVyaW9kU3RhcnREdCA9IHRtcFJlcVBhcm1zTG9va3VwLlBlcmlvZFN0YXJ0RHRcclxuICAgIGlmICh0bXBSZXFQYXJtc0xvb2t1cC5Sb2xlVHlwZUNvZGUpIHJlcS5ib2R5LlJvbGVUeXBlQ29kZSA9IHRtcFJlcVBhcm1zTG9va3VwLlJvbGVUeXBlQ29kZVxyXG4gICAgaWYgKHRtcFJlcVBhcm1zTG9va3VwLlRyYW5zYWN0aW9uSWQpIHJlcS5ib2R5LlRyYW5zYWN0aW9uSWQgPSB0bXBSZXFQYXJtc0xvb2t1cC5UcmFuc2FjdGlvbklkO1xyXG5cclxuICAgIG15TG9nLmRlYnVnKGBOb3cgaGF2ZSBuZXcgYm9keSAke0pTT04uc3RyaW5naWZ5KHJlcS5ib2R5KS5zdWJzdHJpbmcoMCwgMTAwKX0uLi5gKTtcclxuICAgIG15TG9nLmxvZyhyZXEuYm9keSk7XHJcbiAgICByZXEuYm9keSA9IHNldEZvb3RwcmludFByb3BlcnRpZXMocmVxLmJvZHkpO1xyXG5cclxuICAgIG15TG9nLmRlYnVnKGBVcGRhdGVkIGJvZHkgZm9yIHVwZGF0ZSAke0pTT04uc3RyaW5naWZ5KHJlcS5ib2R5KS5zdWJzdHJpbmcoMCwgMTAwKX0uLi5gKTtcclxuICAgIG15TG9nLmxvZyhyZXEuYm9keSk7XHJcblxyXG4gICAgbmV4dCgpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHB1dF9KU1JFVmFsaWRhdGlvblJ1bGVzKHJlcTogZXhwcmVzcy5SZXF1ZXN0LCByZXM6IGV4cHJlc3MuUmVzcG9uc2UsIG5leHQ6IGV4cHJlc3MuTmV4dEZ1bmN0aW9uKSB7XHJcblxyXG4gICAgaWYgKGJ1c2luZXNzUnVsZXNMYW5ndWFnZSA9PSBcIkpTUkVcIikge1xyXG4gICAgICAgIGxldCBzdHBMaW5lSXRlbXMgPSByZXEuYm9keTtcclxuICAgICAgICAvL2xldCBmb3JtTWV0YURhdGEgPSByZXF1aXJlKFwiLi4vanNyZS9mb3Jtcy9vVEhfUEFZUk9MTF9FVkVOVF9DSElMREZvcm0uanNcIik7XHJcbiAgICAgICAgbGV0IHJlV2l0aFBhdGNoZXMgPSByZXF1aXJlKFwiLi4vbG9hZFJ1bGVzRW5naW5lV2l0aFBhdGNoZXNcIik7ICAvL2FsdGhvdWdoIEkgZG9uJ3QgYWN0dWFsbHkgdXNlIHRoaXMsIGl0IGRvZXMgcHV0IHRoZSBwYXRjaGVzIGluIGZvciB0aGUgb25lIEkgZG8gdXNlLlxyXG4gICAgICAgIGxldCBSdWxlc0VuZ2luZSA9IHJlcXVpcmUoXCIuLi9qc3JlL3J1bGVzRW5naW5lXCIpO1xyXG4gICAgICAgIGxldCBMaW5lSXRlbSA9IHJlcXVpcmUoXCIuLi9qc3JlL2xpbmVJdGVtXCIpO1xyXG4gICAgICAgIGxldCBzdWJqZWN0Q2xpZW50ID0gc3RwTGluZUl0ZW1zLnN1YmplY3RDbGllbnQ7XHJcbiAgICAgICAgZGVsZXRlIHN0cExpbmVJdGVtcy5zdWJqZWN0Q2xpZW50OyAgLy91bmZvcnR1bmF0ZWx5IHRoaXMgbWVzc2VzIHdpdGggdGhlIHJ1bGVzIGVuZ2luZS4gIFNvIHRha2UgaXQgb3V0IHRoZW4gcHV0IGl0IGJhY2sgYXQgdGhlIGVuZC5cclxuXHJcbiAgICAgICAgLy9zdHBMaW5lSXRlbXNbMTA5MzNdWzE2NTg1XSA9IG5ldyBMaW5lSXRlbShmb3JtTWV0YURhdGFbMTA5MzNdWzE2NTg1XSwgc3RwTGluZUl0ZW1zWzEwOTMzXVsxNjU4NV0uX3ZhbHVlKTtcclxuXHJcbiAgICAgICAgLy8gdGhpcyBpcyBzdHVwaWQsIGlzbid0LiAgRm9yIHNvbWUgcmVhc29uIG15IGxpbmUgaXRlbXMgbG9zdCB0aGVpciBwcm90b3R5cGUgbWV0aG9kcy4gIElmIHlvdSBrbm93IHdoeSwgcGxlYXNlIGdpdmUgbWUgYSBjYWxsIGFuZCB0ZWxsIG1lLiB4NjM4MjEuXHJcbiAgICAgICAgLy8gSSdtIGd1ZXNzaW5nIGl0IGlzIGJlY2FzdWUgaXQgd2FzIHNlcmlhbGlzZWQgYW5kIGRlc2VhcmFsaXNlZCAod2l0aG91dCBtZXRob2RzKVxyXG4gICAgICAgIE9iamVjdC5rZXlzKHN0cExpbmVJdGVtcykuZm9yRWFjaChmdW5jdGlvbiAoc0lkKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgKHN0cExpbmVJdGVtc1tzSWRdKSA9PSBcIm9iamVjdFwiKSB7IC8vIG5vdCAodHlwZW9mIHN0cExpbmVJdGVtc1tzSWRdID09PSBcInN0cmluZ1wiIHx8IHR5cGVvZiBzdHBMaW5lSXRlbXNbc0lkXSA9PT0gXCJudW1iZXJcIiB8fCBzdHBMaW5lSXRlbXNbc0lkXSA9PT0gbnVsbCkgXHJcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhzdHBMaW5lSXRlbXNbc0lkXSkuZm9yRWFjaChmdW5jdGlvbiAoZklkKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdHBMaW5lSXRlbXNbc0lkXVtmSWRdLmZpZWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB2ID0gKHN0cExpbmVJdGVtc1tzSWRdW2ZJZF0uZmllbGQucmVwZWF0aW5nKSA/IHN0cExpbmVJdGVtc1tzSWRdW2ZJZF0uX3ZhbHVlcyA6IHN0cExpbmVJdGVtc1tzSWRdW2ZJZF0uX3ZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHBMaW5lSXRlbXNbc0lkXVtmSWRdID0gbmV3IExpbmVJdGVtKGZvcm1NZXRhRGF0YVtzSWRdW2ZJZF0sIHYpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmb3JtTWV0YURhdGFbc0lkXSAmJiBmb3JtTWV0YURhdGFbc0lkXVtmSWRdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RwTGluZUl0ZW1zW3NJZF1bZklkXSA9IG5ldyBMaW5lSXRlbShmb3JtTWV0YURhdGFbc0lkXVtmSWRdLCBzdHBMaW5lSXRlbXNbc0lkXVtmSWRdKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHZhciByZSA9IG5ldyBSdWxlc0VuZ2luZShmb3JtTWV0YURhdGEsIHN0cExpbmVJdGVtcywgXCJ2YWxpZGF0ZVwiKTtcclxuICAgICAgICBteUxvZy5kZWJ1ZyhcIisrKysrKysrKysrIGFib3V0IHRvIGNhbGwgSlNSRSArKysrKysrKysrKysrKysrXCIpO1xyXG4gICAgICAgIHJlLnJ1bigpO1xyXG4gICAgICAgIGlmIChyZS5lcnJvcnMubGVuZ3RoICE9PSAwKVxyXG4gICAgICAgICAgICByZXMuc3RhdHVzKDUwMCkuc2VuZCh7XHJcbiAgICAgICAgICAgICAgICBGYWlsdXJlTWVzc2FnZTogXCJGYWlsZWQgdmFsaWRhdGlvbiBydWxlcyB3aXRoIFwiICsgcmUuZXJyb3JzLmxlbmd0aCArIFwiZm91bmRcIixcclxuICAgICAgICAgICAgICAgIGVycm9yOiByZS5lcnJvcnNcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIG15TG9nLmRlYnVnKFwiKysrKysrKysrKysgcGFzc2VkIHZhbGlkYXRpb24gYnkgIEpTUkUgKysrKysrKysrKysrKysrK1wiKTtcclxuXHJcbiAgICAgICAgLy8gcHV0IGtub3duIHNlY2lvbnMvZmllbGRzIGludG8gc3ViRG9jcyB3aXRoIG5hbWVkIHBhdGhzXHJcbiAgICAgICAgdHJhbnNmb3JtRnJvbUxlZ2FjeUpTUkVUb0V4cGxpY2l0U3RvcmFnZUZvcm1hdChzdHBMaW5lSXRlbXMsIGZvcm1NZXRhRGF0YUJ5SWQpO1xyXG4gICAgICAgIC8vIHB1dCBrbm93biBzZWNpb25zL2ZpZWxkcyBpbnRvIHNlY3Rpb25zICYgTGluZUl0ZW0gYXJyYXlzIHNvIGNhbiB1c2UgZGVmaW5lZCBzY2hlbWEgaW4gbW9uZ29vc2UuXHJcbiAgICAgICAgLy90cmFuc2Zvcm1Gcm9tTGVnYWN5SlNSRVRvU3RvcmFnZUZvcm1hdF9vbGQoc3RwTGluZUl0ZW1zLCBmb3JtTWV0YURhdGEsIGZvcm1EZWYpO1xyXG5cclxuICAgICAgICAvL3RvZG86IHdvcmsgb3V0IGlmIHRoaXMgZm9ybSB3aWxsIHJlcXVpcmUgdXBkYXRlIHJ1bGVzLiAgSWYgaXQgZG9lc24ndCwgc2V0IHRoZSBwcm9jZXNzaW5nIHN0YXR1cyB0byBcIkRvbmVcIiwgb3RoZXJ3aXNlIHNldCB0aGUgcHJvY2Vzc2luZyBzdGF0dXMgdG8gXCJQZW5kaW5nIFVwZGF0ZSBSdWxlc1wiLlxyXG4gICAgICAgIHN0cExpbmVJdGVtcy5Qcm9jZXNzaW5nU3RhdHVzQ2QgPSAxO1xyXG5cclxuICAgICAgICBzdHBMaW5lSXRlbXMuc3ViamVjdENsaWVudCA9IHN1YmplY3RDbGllbnQ7XHJcbiAgICAgICAgcmVzLmxvY2Fscy5zdHBGb3JtID0gc3RwTGluZUl0ZW1zO1xyXG4gICAgfTtcclxuXHJcbiAgICBuZXh0KCk7XHJcblxyXG59XHJcblxyXG5mdW5jdGlvbiBwdXRfRW5jcnlwdFNlbnNpdGl2ZURhdGEocmVxOiBleHByZXNzLlJlcXVlc3QsIHJlczogZXhwcmVzcy5SZXNwb25zZSwgbmV4dDogZXhwcmVzcy5OZXh0RnVuY3Rpb24pIHtcclxuICAgIC8vdG9kbzogc2VsZWN0aXZlbHkgZW5jcnlwdCBsaW5lIGl0ZW1zXHJcbiAgICBuZXh0KClcclxufVxyXG5cclxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuLy8gUHV0IE1ldGhvZHNcclxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuLy8gVXBzZXJ0cyB0aGUgZm9ybSBzcGVjaWZpZWQgaW4gdGhlIHVybCBpbnRvIHRoZSBkYXRhYmFzZVxyXG4vLyBUaGlzIHNlcnZpY2UgaXMgaWRlbXBvdGVudCBleGNlcHQgZm9yIGNoYW5nZXMgdG8gVXBkYXRlIERhdGUgVGltZSBcclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHB1dEZvcm0ocmVxOiBleHByZXNzLlJlcXVlc3QsIHJlczogZXhwcmVzcy5SZXNwb25zZSwgbmV4dDogZXhwcmVzcy5OZXh0RnVuY3Rpb24pIHtcclxuICAgIG15TG9nLmRlYnVnKFwiaW4gRm9ybXNDb250cm9sbGVyLyBwdXRGb3JtXCIpO1xyXG4gICAgbXlMb2cuZGVidWcoXCJMb29raW5nIGZvciBmb3JtcyB3aXRoOiBcIiArIEpTT04uc3RyaW5naWZ5KHJlcy5sb2NhbHMubG9va3VwKSk7XHJcbiAgICBteUxvZy5kZWJ1ZyhcIlRvIHVwZGF0ZSB0byBib2R5OiBcIiArIEpTT04uc3RyaW5naWZ5KHJlcS5ib2R5KS5zdWJzdHIoMCwgMTAwKSArIFwiLi4uXCIpO1xyXG4gICAgbXlMb2cubG9nKHJlcS5ib2R5KTtcclxuICAgIG15TG9nLmxvZyhcIlVzaW5nIGFkZHRpb25hbCBmb3JtIGxpbmUgaXRlbSBzY2hlbWE6IFwiICsgSlNPTi5zdHJpbmdpZnkobGluZUl0ZW1zU2NoZW1hX0Zvcm1TcGVjaWZpYykpO1xyXG5cclxuICAgIG15TG9nLmRlYnVnKGBDbGllbnQgSW50ZXJuYWwgSWQgJHtKU09OLnN0cmluZ2lmeShyZXEuYm9keS5DbGllbnRJbnRlcm5hbElkKX1gKTtcclxuXHJcbiAgICByZXMubG9jYWxzLmlzRXhpc3RpbmcgPSBhd2FpdCB3cml0ZUhpc3RvcnkocmVxLCByZXMpO1xyXG5cclxuICAgIEZvcm0ocmVxLnBhcmFtcy5Gb3JtVHlwZU11bmcsIGxpbmVJdGVtc1NjaGVtYV9Gb3JtU3BlY2lmaWMpLmZpbmRPbmVBbmRVcGRhdGUoPE9iamVjdD5yZXMubG9jYWxzLmxvb2t1cCwgcmVxLmJvZHksIHsgdXBzZXJ0OiB0cnVlLCBuZXc6IHRydWUgfSwgYXN5bmMgZnVuY3Rpb24gKGVycjogYW55LCBmb3JtOiBhbnkpIHtcclxuICAgICAgICBteUxvZy5kZWJ1ZygncHV0Rm9ybTonLCAoZXJyIHx8IFwiTm8gZXJyb3JzLCBmb3JtIFwiICsgZm9ybS5UcmFuc2FjdGlvbklkICsgXCIgZm91bmRcIikpO1xyXG4gICAgICAgIGlmIChlcnIpXHJcbiAgICAgICAgICAgIGlmIChlcnIuY29kZSA9PSAxMTAwMCAmJiAoZXJyLmtleVBhdHRlcm4gfHwge30pLlRyYW5zYWN0aW9uSWQgPT0gMSkge1xyXG4gICAgICAgICAgICAgICAgbXlMb2cuZXJyb3IoXCJTZW5kaW5nIGJhY2sgZXJyb3I6XCIsIGVycik7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gUmVTVCBTdGQgOTUgc2F5cyBPcHRvbWlzdGljIExvY2tpbmcgZmFpbHVycyBzaG91bGQgcmV0dXJuIGEgNDA5LiAgQnV0IEkgY2FuJ3QgYmUgc3VyZSB0aGlzIGlzIGZhaWxpbmcgXHJcbiAgICAgICAgICAgICAgICAvLyBvcHRvbWlzdGljIGxvY2tpbmcgY2hlY2suICBJdCBpcyBqdXN0IHRoYXQgaWYgdGhlIHN5c3RlbSBpcyB3b3JraW5nIHRoYXQgaXMgdGhlIG9ubHkgcmVhc29uIHdoeSBpdCBzaG91bGQgZmFpbCBcclxuICAgICAgICAgICAgICAgIC8vIG9uIGEgZHVwbGlhdGUgQkVUICMgKFRyYW5zYWN0aW9uIElkKSBrZXkuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDkpLnNlbmQoXCJUaGVyZSB3YXMgYSBwcm9ibGVtIHVwZGF0aW5nIHRoZSBmb3JtIGR1ZSB0byBEdXBsaWNhdGUgS2V5IChteSBndWVzcyBpdCBpcyBhbiBvcHRvbWlzdGljIGxvY2tpbmcgcHJvYmxlbSkuXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbXlMb2cuZXJyb3IoXCJwdXQgZm9ybSBlcnJvciBmb3VuZFwiLCBlcnIpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5zZW5kKFwiVGhlcmUgd2FzIGEgcHJvYmxlbSB1cGRhdGluZyB0aGUgZm9ybS5cIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBteUxvZy5sb2coZm9ybSk7XHJcblxyXG4gICAgICAgIGlmIChmb3JtICYmIGZvcm0uc3ViamVjdENsaWVudCAmJiBmb3JtLnN1YmplY3RDbGllbnQuTWF0Y2hpbmdTdGF0dXMgPT0gXCJVbk1hdGNoZWRcIilcclxuICAgICAgICAgICAgaW5pdGlhdGVJZGVudGl0eU1hdGNoKHJlcS5ib2R5KTtcclxuXHJcbiAgICAgICAgcmVzLmxvY2Fscy5zdGF0dXMgPSAoZm9ybSAmJiBmb3JtLl9kb2MuY3JlYXRlZEF0LmdldFRpbWUoKSA9PSBmb3JtLl9kb2MudXBkYXRlZEF0LmdldFRpbWUoKSkgPyAyMDEgOiAyMDA7XHJcbiAgICAgICAgcmVzLmxvY2Fscy5kYXRhID0gKGZvcm0pID8gZm9ybSA6IFwiTm8gZm9ybSBmb3VuZC5cIjtcclxuXHJcbiAgICAgICAgaWYgKChyZXMubG9jYWxzLnN0YXR1cyA9PSAyMDEpID09IHJlcy5sb2NhbHMuaXNFeGlzdGluZykgbXlMb2cuZXJyb3IoYE5vIGhpc3RvcnkgY3JlYXRlZCBmb3IgYW4gdXBkYXRlIG9mICR7cmVxLm9yaWdpbmFsVXJsfS8gLCBoYXMgc29tZW9uZSBiZWVuIHRhbXBlcmluZyB3aXRoIHRoZSBkYXRhYmFzZT9gKVxyXG5cclxuICAgICAgICBpZiAoIXJlcy5sb2NhbHMuaXNFeGlzdGluZykgYXdhaXQgdXBkYXRlRmlsZUNvdW50cyhyZXEsIHJlcywgZm9ybSlcclxuICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgICBteUxvZy5lcnJvcihcIkVycm9yIHVwZGF0aW5nIEZpbGUgQ291bnRzXCIsIGVycik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLnNlbmQoXCJUaGVyZSB3YXMgYSBwcm9ibGVtIHVwZGF0aW5nIHRoZSBmb3JtLlwiKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICBuZXh0KCk7XHJcbiAgICB9KTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIGluaXRpYXRlSWRlbnRpdHlNYXRjaChwYXlyb2xsRXZlbnQ6IE9iamVjdCkge1xyXG4gICAgLy8gc2VuZCBNUSB0cmFuc2F0aW9uIHRvIE1DSUQgdXNpbmcgIEJJNTc2MFxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiB3cml0ZUhpc3RvcnkocmVxOiBleHByZXNzLlJlcXVlc3QsIHJlczogZXhwcmVzcy5SZXNwb25zZTxhbnk+KTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICBsZXQgb3JpZ2luYWxzOiBhbnkgPSBhd2FpdCBGb3JtKHJlcS5wYXJhbXMuRm9ybVR5cGVNdW5nLCBsaW5lSXRlbXNTY2hlbWFfRm9ybVNwZWNpZmljKS5maW5kKDxPYmplY3Q+cmVzLmxvY2Fscy5sb29rdXApLmV4ZWMoKTtcclxuICAgIGlmIChvcmlnaW5hbHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIG9yaWdpbmFscy5mb3JFYWNoKChvcmlnaW5hbDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIEhpc3RvcnlGb3JtLmNyZWF0ZSh7IFRyYW5zYWN0aW9uSWQ6IG9yaWdpbmFsLlRyYW5zYWN0aW9uSWQsIERUX1VwZGF0ZTogb3JpZ2luYWwuRFRfVXBkYXRlLCBUTV9VcGRhdGU6IG9yaWdpbmFsLlRNX1VwZGF0ZSwgaGlzdG9yeTogb3JpZ2luYWwgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaCgocmVhc29uOiBhbnkpID0+IG15TG9nLmVycm9yKCdFcnJvciB3cml0aW5nIGhpc3RvcnkuICBUaGlzIHNob3VsZCBuZXZlciBvY2N1ci4gIFByb2Nlc3NpbmcgY2FycmllZCBvbiBhbnl3YXk6JywgcmVhc29uKSk7XHJcbiAgICAgICAgICAgIG15TG9nLmRlYnVnKGBXcml0aW5nIGhpc3RvcnkgcmVjb3JkIGZvcjogJHtKU09OLnN0cmluZ2lmeShvcmlnaW5hbCkuc3Vic3RyKDAsIDE1MCl9YCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gKG9yaWdpbmFscy5sZW5ndGggPiAwKTtcclxufVxyXG5cclxuLy8gVXBzZXJ0cyB0aGUgZm9ybSBzcGVjaWZpZWQgaW4gdGhlIHVybCBpbnRvIHRoZSBkYXRhYmFzZVxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHV0QXBwbHlVcGRhdGVSdWxlcyhyZXE6IGV4cHJlc3MuUmVxdWVzdCwgcmVzOiBleHByZXNzLlJlc3BvbnNlLCBuZXh0OiBleHByZXNzLk5leHRGdW5jdGlvbikge1xyXG5cclxuICAgIG15TG9nLmRlYnVnKFwiKysrKysrKysrKysgYWJvdXQgdG8gZG8gdXBkYXRlIHJ1bGVzICsrKysrKysrKysrKysrKytcIik7XHJcbiAgICAvL3RvZG86IGFwcGx5IGZvcm0gdXBkYXRlIHJ1bGVzXHJcblxyXG4gICAgaWYgKGJ1c2luZXNzUnVsZXNMYW5ndWFnZSA9PSAnSlNSRScpIHtcclxuICAgICAgICAvL3RvZG86IHVwZGF0ZSBtb25nbyB0byByZWNvcmQgaW4gc3RhdHVzIGZpZWxkIHRoYXQgdXBkYXRlIHJ1bGVzIG5vdyBhcHBsaWVkXHJcbiAgICAgICAgcmVzLmxvY2Fscy5zdHBGb3JtLlByb2Nlc3NpbmdTdGF0dXNDZCA9IDI7XHJcbiAgICB9XHJcblxyXG4gICAgLy90b2RvOiByZXN0aWZ5IHRoZSByZXNwb25zZVxyXG4gICAgLy90b2RvOiBkZWNyeXB0IGxpbmUgaXRlbXMgXHJcblxyXG4gICAgYXdhaXQgcG9zdFB1dFByZVJldHVybkhvb2socmVxLnBhcmFtcy5Gb3JtVHlwZU11bmcsIHJlcSwgcmVzKTtcclxuXHJcbiAgICBsZXQgZm9ybSA9IHJlcy5sb2NhbHMuZGF0YS5fZG9jO1xyXG4gICAgbGV0IG1lYW5pbmdmdWxOYW1lRm9ybSA9IHJlcy5sb2NhbHMuZGF0YS50b09iamVjdCgpO1xyXG4gICAgaWYgKHdpcmVGb3JtYXQgPT0gJ0pTUkUnKSB7XHJcbiAgICAgICAgZm9ybSA9IHRyYW5zZm9ybU1lYW5pbmdmdWxTdG9yYWdlVG9KU1JFV2lyZUZvcm1hdChmb3JtLCBmb3JtTWV0YURhdGFCeU5hbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlcy5zdGF0dXMocmVzLmxvY2Fscy5zdGF0dXMpLnNlbmQoZm9ybSk7XHJcblxyXG4gICAgYXdhaXQgZG9QcmVmaWxsKHJlcSwgbWVhbmluZ2Z1bE5hbWVGb3JtKTtcclxuICAgIG15TG9nLmRlYnVnKFwiKysrKysrKysrKysgYWxsIGRvbmUgaGVyZSArKysrKysrKysrKysrKysrXCIpO1xyXG59O1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gdXBkYXRlRmlsZUNvdW50cyhyZXE6IGFueSwgcmVzOiBhbnksIG1lYW5pbmdmdWxOYW1lRm9ybTogYW55KSB7XHJcbiAgICBsZXQgYnVsVHJhbnNtaXNzaW9uU3R1ZmYgPSBhd2FpdCBidWxrVHJhbnNtaXNzaW9uVHJhY2tpbmcocmVxLnBhcmFtcy5Gb3JtVHlwZU11bmcsIHJlcSwgcmVzLCBtZWFuaW5nZnVsTmFtZUZvcm0pO1xyXG4gICAgaWYgKGJ1bFRyYW5zbWlzc2lvblN0dWZmKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgYXdhaXQgRm9ybShcImJ1bGtUcmFuc21pc3Npb25Gb3JtXCIsIGJ1bFRyYW5zbWlzc2lvblN0dWZmLnNjaGVtYSlcclxuICAgICAgICAgICAgICAgIC5maW5kT25lQW5kVXBkYXRlKGJ1bFRyYW5zbWlzc2lvblN0dWZmLmxvb2t1cEZpbHRlciwgYnVsVHJhbnNtaXNzaW9uU3R1ZmYudXBzZXJ0Qm9keSwgeyB1cHNlcnQ6IHRydWUsIG5ldzogdHJ1ZSB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyKVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGRvUHJlZmlsbChyZXE6IGFueSwgbWVhbmluZ2Z1bE5hbWVGb3JtOiBhbnkpIHtcclxuICAgIGxldCBwcmVmaWxsU3R1ZmYgPSBhd2FpdCBkZWNpZGVXaGF0VG9QdXRJblByZWZpbGwocmVxLnBhcmFtcy5Gb3JtVHlwZU11bmcsIG1lYW5pbmdmdWxOYW1lRm9ybSk7XHJcbiAgICBpZiAocHJlZmlsbFN0dWZmKSB7XHJcbiAgICAgICAgcHJlZmlsbFN0dWZmLmZvckVhY2gocCA9PiByZXBsaWNhdGVUb1ByZWZpbGwocC5wcmVmaWxsTG9va3VwLCBwLnByZWZpbGxVcGRhdGUsIHAucHJlZmlsbEluc2VydCwgbWVhbmluZ2Z1bE5hbWVGb3JtKSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlcGxpY2F0ZVRvUHJlZmlsbChwcmVmaWxsTG9va3VwOiBhbnksIHByZWZpbGxVcGRhdGU6IGFueSwgcHJlZmlsbEluc2VydDogYW55LCBmb3JtOiBhbnkpIHtcclxuICAgIFByZUZpbGxGb3JtLmZpbmRPbmVBbmRVcGRhdGUocHJlZmlsbExvb2t1cCwgcHJlZmlsbFVwZGF0ZSwgeyBuZXc6IHRydWUgfSwgZnVuY3Rpb24gKGVycjogYW55LCBwcmVmaWxsQ29sbGVjdGlvbjogYW55KSB7IC8vaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzk1NjMxMzYvcHVzaGluZy1vbnRvLW5lc3RlZC1zdWJkb2MtYXJyYXktd2l0aC1tb25nb29zZWpzXHJcbiAgICAgICAgbXlMb2cuZGVidWcoJyoqKioqKiogUmV0dXJuIGZyb20gYXR0ZW1wdCB0byB1cGRhdGUnKTtcclxuICAgICAgICBpZiAoZXJyKSBteUxvZy5lcnJvcignZGVjaWRlV2hhdFRvUHV0SW5QcmVmaWxsIEVycm9yJywgZXJyKVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgaWYgKHByZWZpbGxDb2xsZWN0aW9uKSBteUxvZy5kZWJ1ZyhgKioqKioqKiBQcmVmaWxsIGFmdGVyIHVwZGF0ZTogJHtmb3JtW1wiUGF5ZWUgRGV0YWlsc1wiXS5vVEhfUEFZRUVfRFRMU19DdXJyZW50UGF5ZXJQYXllZVJlbGF0aW9uc2hpcFBheWVlUGF5cm9sbElkZW50aWZpZXJ9LCAke2Zvcm1bXCJQYXlyb2xsIEV2ZW50XCJdLm9USF9QQVlST0xMX0VWTlRfUGF5cm9sbEV2ZW50UGVyaW9kRW5kRGF0ZX1gKVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG15TG9nLmRlYnVnKCcqKioqKioqIFVwZGF0ZSBmYWlsZWQsIHdpbGwgZG8gaW5zZXJ0Jyk7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgcHJlZmlsbExvb2t1cC5mYWN0cztcclxuICAgICAgICAgICAgICAgIFByZUZpbGxGb3JtLmZpbmRPbmVBbmRVcGRhdGUocHJlZmlsbExvb2t1cCwgcHJlZmlsbEluc2VydCwgeyB1cHNlcnQ6IHRydWUsIG5ldzogdHJ1ZSB9LCBmdW5jdGlvbiAoZXJyOiBhbnksIHByZWZpbGxDb2xsZWN0aW9uOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgICAgICBteUxvZy5kZWJ1ZygnKioqKioqKiBSZXR1cm4gZnJvbSBhdHRlbXB0IHRvIGluc2VydCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIG15TG9nLmVycm9yKCdkZWNpZGVXaGF0VG9QdXRJblByZWZpbGwgRXJyb3InLCBlcnIpXHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXByZWZpbGxDb2xsZWN0aW9uKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJ0aGVyZSBzaG91bGQgYmUgYSBmb3JtISEgaGVyZSEhXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgbXlMb2cuZGVidWcoYCoqKioqKiogUHJlZmlsbCBhZnRlciBpbnNlcnQ6ICR7Zm9ybVtcIlBheWVlIERldGFpbHNcIl0ub1RIX1BBWUVFX0RUTFNfQ3VycmVudFBheWVyUGF5ZWVSZWxhdGlvbnNoaXBQYXllZVBheXJvbGxJZGVudGlmaWVyfSwgJHtmb3JtW1wiUGF5cm9sbCBFdmVudFwiXS5vVEhfUEFZUk9MTF9FVk5UX1BheXJvbGxFdmVudFBlcmlvZEVuZERhdGV9YCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgfSk7XHJcbn1cclxuXHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHV0Rm9ybUlkZW50aXR5KHJlcTogZXhwcmVzcy5SZXF1ZXN0LCByZXM6IGV4cHJlc3MuUmVzcG9uc2UsIG5leHQ6IGV4cHJlc3MuTmV4dEZ1bmN0aW9uKSB7XHJcblxyXG4gICAgLy90b2RvOiBJIGhhdmVuJ3QgZ290IHRoaXMgcmlnaHQgeWV0LlxyXG4gICAgLy90b2RvOiB0aGUgcmVwb3J0aW5nIGNsaWVudCB3aWxsIGFsd2F5cyBiZSBhdXRoZW50aWNhdGVkLCBzbyB3ZSBjYW4gYWx3YXlzIHVzZSB0aGVpciBjbGllbnQgaW50ZXJuYWwgaWQgdG8gbG9vay11cCBwcmlvciBsb2RnbWVudHMuIC0gd3JvbmdcclxuICAgIC8vdG9kbzogdGhlIHJlcG9ydGluZyBjbGllbnQgbWlnaHQgYmUgMXN0IHBhcnR5IG9yIDNyZCBwYXJ0eS4gIElmIGZpcnN0IHBhcnR5IGNvdWxkIGp1c3QgdGFrZSB0aGVpciBpbmZvcm1hdGlvbiBhcyBjb3JyZWN0OyBidXQgcHJvYmFibHkgd2FudCB0byBjaGVjayBmb3IgbWlzdGFrZXMuXHJcbiAgICAvL3RvZG86IHNvLCBuZWVkIHR3byBjbGllbnQgaW50ZXJuYWwgaWRzLCByZXBvcnRpbmcgJiBzdWJqZWN0LiAgU3ViamVjdCBtYXkgYmUgb3B0aW9uIGlmIHdlIGhhdmVuJ3QgeWV0IHZlcmlmaWVkIGlkZW50aXR5XHJcbiAgICAvL3RvZG86IGlmIHRoZSByZXBvcnRpbmcgY2xpZW50IGlzIDNyZCBwYXJ0eSB0aGV5IG1heSBrbm93IHRoZSBzdWJqZWN0IGNsaWVudCBieSBhIGRpZmZlcmVudCBzZXQgb2YgaWRlbnRpdHkgZGV0YWlscyB0byBvdGhlciByZXBvcnRlcnNcclxuICAgIC8vdG9kbzogc28gaXQgd2lsbCBiZSBmb3JtIHNwZWNpZmljIGFzIHRvIHdoYXQgcHJvcGVydGllcyB3ZSB1c2UgZm9yIGlkIHZlcmlmaWNhdGlvbjsgYW5kIHRoZXNlIHdpbGwgbmVlZCB0byBiZSByZWNvcmRlZCBzZXBhcmF0ZWRseSBmb3IgXHJcbiAgICAvL3RvZG86IHRoZSByZXBvcnRpbmcgY2xpZW50IGZvciBzdWJzZXF1ZW50IGxvb2t1cHNcclxuICAgIC8vdG9kbzogdGhpcyBpcyBqdXN0IGRldGFpbCwgc28gSSdsbCB3b3JyeSBhYm91dCBkb2luZyB0aGlzIGxhdGVyLlxyXG4gICAgbXlMb2cuZGVidWcoXCJpbiBGb3Jtc0NvbnRyb2xsZXIvIHB1dEZvcm1JZGVudGl0eVwiKVxyXG4gICAgaWYgKCEoPGFueT5yZXMubG9jYWxzLmxvb2t1cClbJ3N1YmplY3RDbGllbnQuQ2xpZW50SWRlbnRpZmllclR5cGUnXSB8fCAhKDxhbnk+cmVzLmxvY2Fscy5sb29rdXApWydzdWJqZWN0Q2xpZW50LkNsaWVudElkZW50aWZpZXJWYWx1ZSddKVxyXG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuc2VuZChcIk1pc3NpbmcgRm9ybSBJZGVudGl0eSBsb29rdXAgcGFyYW1ldGVyc1wiKTtcclxuXHJcbiAgICAvL3RoZSBsb29rdXAgbmVlZHMgdGhlIGRvdCBub3RhdGlvbiwgYnV0IGhlcmUgd2FudCBub3JtYWwgamF2YXNjcmlwdCBkb3RzXHJcbiAgICBpZiAoIXJlcS5ib2R5LnN1YmplY3RDbGllbnQuQ2xpZW50SWRlbnRpZmllclR5cGUgfHwgIXJlcS5ib2R5LnN1YmplY3RDbGllbnQuQ2xpZW50SWRlbnRpZmllclZhbHVlIHx8ICFyZXEuYm9keS5zdWJqZWN0Q2xpZW50Lk1hdGNoaW5nU3RhdHVzKVxyXG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuc2VuZChcIk1pc3NpbmcgRm9ybSBJZGVudGl0eSB1cGRhdGUgZGV0YWlsc1wiKTtcclxuXHJcbiAgICBjb25zdCBpZExvb2t1cCA9IDxhbnk+aWRlbnRpdHlMb29rdXBDcml0ZXJpYShyZXEucGFyYW1zLkZvcm1UeXBlTXVuZywgcmVxLCByZXMpO1xyXG4gICAgYXdhaXQgd3JpdGVIaXN0b3J5KHJlcSwgcmVzKTtcclxuICAgIG15TG9nLmRlYnVnKGBMb29raW5nIGZvciBmb3JtcyB3aXRoOiAke0pTT04uc3RyaW5naWZ5KGlkTG9va3VwKX0gXFxuIGFuZCBib2R5IDpcXG4ke0pTT04uc3RyaW5naWZ5KHJlcS5ib2R5KX1gKTtcclxuXHJcbiAgICBGb3JtKHJlcS5wYXJhbXMuRm9ybVR5cGVNdW5nLCBsaW5lSXRlbXNTY2hlbWFfRm9ybVNwZWNpZmljKS51cGRhdGVNYW55KGlkTG9va3VwLCByZXEuYm9keSwge30sIGZ1bmN0aW9uIChlcnI6IGFueSwgcmVzdWx0czogYW55KSB7XHJcbiAgICAgICAgbXlMb2cuZGVidWcoJ3B1dEZvcm1JZGVudGl0eTonLCAoZXJyIHx8IFwiTm8gZXJyb3JzLCBmb3VuZCwgdXBkYXRlZCBcIiArIHJlc3VsdHMubk1vZGlmaWVkICsgXCIgb2YgXCIgKyByZXN1bHRzLm4gKyBcIiBtYXRjaGVzXCIpKTtcclxuICAgICAgICBpZiAoZXJyKSByZXR1cm4gcmVzLnN0YXR1cyg1MDApLnNlbmQoXCJUaGVyZSB3YXMgYSBwcm9ibGVtIHVwZGF0aW5nIGZvcm0gaWRlbnRpdHkuXCIpO1xyXG4gICAgICAgIG15TG9nLmxvZyhyZXN1bHRzKTtcclxuXHJcbiAgICAgICAgcmVzLnN0YXR1cygyMDApLnNlbmQoe1xyXG4gICAgICAgICAgICBtZXNzYWdlOiBcIlVwZGF0ZWQgXCIgKyByZXN1bHRzLm5Nb2RpZmllZCArIFwiIG9mIFwiICsgcmVzdWx0cy5uICsgXCIgbWF0Y2hlc1wiLFxyXG4gICAgICAgICAgICByZXN1bHRzOiByZXN1bHRzXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIG5leHQoKTtcclxuICAgIH0pO1xyXG59O1xyXG5cclxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuLy8gRGVsZXRlIE1ldGhvZHNcclxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuLy8gRGVsZXRlcyB0aGUgZm9ybSBzcGVjaWZpZWQgaW4gdGhlIHVybCBmcm9tIHRoZSBkYXRhYmFzZVxyXG5leHBvcnQgZnVuY3Rpb24gZGVsZXRlRm9ybShyZXE6IGV4cHJlc3MuUmVxdWVzdCwgcmVzOiBleHByZXNzLlJlc3BvbnNlLCBuZXh0OiBleHByZXNzLk5leHRGdW5jdGlvbikge1xyXG4gICAgbXlMb2cuZGVidWcoXCJJbnNpZGUgRm9ybUNvbnRyb2xsZXJzLnRzLyBkZWxldGVGb3JtXCIgKyByZXEudXJsKTtcclxuICAgIGNvbnN0IGxvb2t1cDogZm9ybVF1ZXJ5VHlwZSA9IHR1cm5VUkxTdGVtc0ludG9Mb29rdXBPYmplY3QocmVxLCBuZXh0KTtcclxuXHJcbiAgICBteUxvZy5kZWJ1ZygnQWJvdXQgdG8gZG8gbG9va3VwL2RlbGV0ZSB3aXRoOiAnICsgSlNPTi5zdHJpbmdpZnkobG9va3VwKSk7XHJcbiAgICBteUxvZy5kZWJ1ZygnQWJvdXQgdG8gZG8gbG9va3VwL2RlbGV0ZSB3aXRoOiAnLCBsb29rdXApO1xyXG4gICAgRm9ybShyZXEucGFyYW1zLkZvcm1UeXBlTXVuZywgbGluZUl0ZW1zU2NoZW1hX0Zvcm1TcGVjaWZpYykuZmluZE9uZUFuZFJlbW92ZSg8T2JqZWN0Pmxvb2t1cCwgZnVuY3Rpb24gKGVycjogYW55LCBmb3JtOiBhbnkpIHtcclxuICAgICAgICBteUxvZy5kZWJ1ZygnZGVsZXRlRm9ybTonLCAoZXJyIHx8IFwiTm8gZXJyb3JzLCBcIiArIChmb3JtID8gZm9ybS5UcmFuc2FjdGlvbklkIDogXCJub1wiKSArIFwiIGZvcm0gZm91bmQgJiBkZWxldGVkXCIpKTtcclxuICAgICAgICBpZiAoZXJyKSByZXR1cm4gcmVzLnN0YXR1cyg1MDApLnNlbmQoXCJUaGVyZSB3YXMgYSBwcm9ibGVtIHRyeWluZyB0byBkZWxldGUgZm9ybS5cIik7XHJcbiAgICAgICAgbXlMb2cubG9nKGZvcm0pO1xyXG5cclxuICAgICAgICBpZiAoIWZvcm0pIHJldHVybiByZXMuc3RhdHVzKDQwNCkuc2VuZChgRm9ybSBub3QgZm91bmQgLSBmb3IgZGVsZXRlIG9wZXJhdGlvbiB3aXRoIGtleXM6ICR7SlNPTi5zdHJpbmdpZnkobG9va3VwKX1gKTtcclxuICAgICAgICBlbHNlIHJlcy5zdGF0dXMoMjAwKS5zZW5kKGBGb3JtIGRlbGV0ZWQgLSB3aXRoIGtleXMgJHtKU09OLnN0cmluZ2lmeShsb29rdXApfWApO1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2FuY2VsRmlsZShyZXE6IGV4cHJlc3MuUmVxdWVzdCwgcmVzOiBleHByZXNzLlJlc3BvbnNlLCBuZXh0OiBleHByZXNzLk5leHRGdW5jdGlvbikge1xyXG4gICAgLy90aGlzIHdpbGwgbmVlZCB0byByZWFkIGFsbCB0aGUgZmFjdHMgd2hpY2ggY29udGFpbiB0aGUgZmlsZSBiZXQjIChvciBtYXliZSB0aGUgbG9kZ2VyJ3MgcmVmIG51bWJlcikgYW5kIFxyXG4gICAgLy9zZXQgdGhlbSB0byBzdGF0dXMgcGVuZGluZyBjYW5jZWxsYXRpb25cclxuICAgIC8vdGhlbiByZWFkIGVhY2ggZmFjdCB3aXRoIHBlbmRpbmcgY2FuY2VsbGF0aW9uIGFuZCByZXBvc3Qgd2l0aCBhIGNhbmNlbGF0aW9uIHN0YXR1cywgbGVhZGluZyB0byBleGVjdXRpb24gb2YgY2FuY2VsbGF0aW9uIHJ1bGVzLlxyXG4gICAgLy93aG8gJiB3aHkgY2FuY2VsbGVkXHJcblxyXG4gICAgLy9hbHNvIG5lZWQgdG8gaWdub3JlIGFueSBzdWJzZXF1ZW50IG1lc3NhZ2VzIHdpdGggdGhhdCBmaWxlIGJldCNcclxuICAgIGlmICghcmVxLnBhcmFtcy5UcmFuc2FjdGlvbklkIHx8ICFyZXEucGFyYW1zLkRUX1VwZGF0ZSB8fCAhcmVxLnBhcmFtcy5UTV9VcGRhdGUgfHwgIXJlcS5wYXJhbXMuQ2xpZW50SWRlbnRpZmllclR5cGUgfHwgIXJlcS5wYXJhbXMuQ2xpZW50SWRlbnRpZmllclZhbHVlKSB7XHJcbiAgICAgICAgbXlMb2cuZXJyb3IoYFVSSSBkaWQgbm90IGluY2x1ZGUgYWxsIHRoZSBwYXJhbWV0ZXJzIG5lZWRlZCB0byBjYW5jZWwgYSBmaWxlLCAke3JlcS5vcmlnaW5hbFVybH1gKTtcclxuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLnNlbmQoXCJVUkkgZGlkIG5vdCBpbmNsdWRlIGFsbCB0aGUgcGFyYW1ldGVycyBuZWVkZWQgdG8gY2FuY2VsIGEgZmlsZS5cIik7XHJcbiAgICB9XHJcbiAgICBjb25zdCBidWxrVHJhbnNtaXNzaW9uTG9va3VwOiBhbnkgPSB7IEZvcm1UeXBlOiBcImJ1bGtUcmFuc21pc3Npb25cIiwgUHJvY2Vzc2luZ1N0YXR1c0NkOiB7ICRuZTogOSB9IH07XHJcbiAgICBidWxrVHJhbnNtaXNzaW9uTG9va3VwLlRyYW5zYWN0aW9uSWQgPSBwYXJzZUludChyZXEucGFyYW1zLlRyYW5zYWN0aW9uSWQpO1xyXG4gICAgYnVsa1RyYW5zbWlzc2lvbkxvb2t1cC5EVF9VcGRhdGUgPSBuZXcgRGF0ZShyZXEucGFyYW1zLkRUX1VwZGF0ZSkudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XHJcbiAgICBidWxrVHJhbnNtaXNzaW9uTG9va3VwLlRNX1VwZGF0ZSA9IHJlcS5wYXJhbXMuVE1fVXBkYXRlO1xyXG4gICAgYnVsa1RyYW5zbWlzc2lvbkxvb2t1cFsnc3ViamVjdENsaWVudC5DbGllbnRJZGVudGlmaWVyVHlwZSddID0gcmVxLnBhcmFtcy5DbGllbnRJZGVudGlmaWVyVHlwZTtcclxuICAgIGJ1bGtUcmFuc21pc3Npb25Mb29rdXBbJ3N1YmplY3RDbGllbnQuQ2xpZW50SWRlbnRpZmllclZhbHVlJ10gPSBwYXJzZUludChyZXEucGFyYW1zLkNsaWVudElkZW50aWZpZXJWYWx1ZSk7XHJcblxyXG4gICAgY29uc3QgcmVjb3JkTG9va3VwOiBhbnkgPSB7IFByb2Nlc3NpbmdTdGF0dXNDZDogeyAkbmU6IDkgfSB9O1xyXG4gICAgcmVjb3JkTG9va3VwWydUcmFuc21pc3Npb25EZXRhaWxzLlRyYW5zbWlzc2lvbkJFVCddID0gcGFyc2VJbnQocmVxLnBhcmFtcy5UcmFuc2FjdGlvbklkKTtcclxuICAgIHJlY29yZExvb2t1cFsnVHJhbnNtaXNzaW9uRGV0YWlscy5DbGllbnRJZGVudGlmaWVyVHlwZSddID0gcmVxLnBhcmFtcy5DbGllbnRJZGVudGlmaWVyVHlwZTtcclxuICAgIHJlY29yZExvb2t1cFsnVHJhbnNtaXNzaW9uRGV0YWlscy5DbGllbnRJZGVudGlmaWVyVmFsdWUnXSA9IHBhcnNlSW50KHJlcS5wYXJhbXMuQ2xpZW50SWRlbnRpZmllclZhbHVlKTtcclxuXHJcbiAgICBsZXQgZXhwZWN0ZWRDb3VudCA9IDA7XHJcbiAgICBpZiAoIXJlcS5wYXJhbXMuc2tpcENvdW50Q2hlY2spIHtcclxuICAgICAgICB2YXIgYnVsa1RyYW5zbWlzc2lvbkZhY3QgPSBhd2FpdCBCYXNlRm9ybS5maW5kT25lKGJ1bGtUcmFuc21pc3Npb25Mb29rdXApIGFzIGFueTtcclxuICAgICAgICBpZiAoIWJ1bGtUcmFuc21pc3Npb25GYWN0KSB7XHJcbiAgICAgICAgICAgIHJlcy5zdGF0dXMoNDA0KS5zZW5kKGBDb3VsZG4ndCBmaW5kIGZhY3QgcmVwcmVzZW50aW5nIHRoZSBidWxrIHRyYW5zbWlzc2lvbjogJHtKU09OLnN0cmluZ2lmeShidWxrVHJhbnNtaXNzaW9uTG9va3VwKX1gKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBleHBlY3RlZENvdW50ID0gYnVsa1RyYW5zbWlzc2lvbkZhY3QuVHJhbnNtaXNzaW9uRGV0YWlscy5SZWNvcmRDb3VudCArIDE7IC8vIEJlY2F1c2UgdGhlIGNvdW50IHdpbGwgaW5jbHVkZSB0aGUgQnVsa1RyYW5zbWlzc2lvbiBcclxuXHJcbiAgICAgICAgLy8gY29uc3QgY291bnRPZkRvY3VtZW50cyA9IGF3YWl0IEJhc2VGb3JtLmNvdW50RG9jdW1lbnRzKHJlY29yZExvb2t1cCk7XHJcbiAgICAgICAgY29uc3QgY291bnRPZkRvY3VtZW50cyA9IGF3YWl0IEJhc2VGb3JtLmNvdW50KHJlY29yZExvb2t1cCk7XHJcbiAgICAgICAgaWYgKGNvdW50T2ZEb2N1bWVudHMgIT09IGV4cGVjdGVkQ291bnQpIHtcclxuICAgICAgICAgICAgcmVzLnN0YXR1cyg1MDApLnNlbmQoYE5vdCBhbGwgZG9jdW1lbnRzIHNlZW0gdG8gYmUgcHJlc2VudCwgZXhwZWN0ZWQgJHtleHBlY3RlZENvdW50fSwgYnV0IGFjdHVhbGx5IGZvdW5kICR7Y291bnRPZkRvY3VtZW50c31gKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBjb25zdCBsb29rdXAyID0geyAuLi5yZXMubG9jYWxzLmxvb2t1cCwgRFRfVXBkYXRlOiBidWxrVHJhbnNtaXNzaW9uRmFjdC5EVF9VcGRhdGUsIFRNX1VwZGF0ZTogYnVsa1RyYW5zbWlzc2lvbkZhY3QuVE1fVXBkYXRlIH07XHJcbiAgICBjb25zdCBmb3JtQ2FuY2VsYXRpb25QZW5kaW5nU3RhdHVzID0geyBQcm9jZXNzaW5nU3RhdHVzQ2Q6IDgsIERUX1VwZGF0ZTogbmV3IERhdGUoKS50b0xvY2FsZURhdGVTdHJpbmcoKSwgVE1fVXBkYXRlOiBuZXcgRGF0ZSgpLnRvTG9jYWxlVGltZVN0cmluZygpIH07O1xyXG4gICAgYnVsa1RyYW5zbWlzc2lvbkZhY3QgPSBhd2FpdCBCYXNlRm9ybS5maW5kT25lQW5kVXBkYXRlKGJ1bGtUcmFuc21pc3Npb25Mb29rdXAsIGZvcm1DYW5jZWxhdGlvblBlbmRpbmdTdGF0dXMpO1xyXG4gICAgaWYgKCFidWxrVHJhbnNtaXNzaW9uRmFjdCkge1xyXG4gICAgICAgIHJlcy5zdGF0dXMoNDA0KS5zZW5kKGBDb3VsZG4ndCBmaW5kIGJ1bGsgdHJhbnNtaXNzaW9uIGZhY3QgZm9yOiAke0pTT04uc3RyaW5naWZ5KGJ1bGtUcmFuc21pc3Npb25Mb29rdXApfSwgbm90aGluZyB1cGRhdGVkYCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGZvcm1DYW5jZWxhdGlvblBlbmRpbmdTdGF0dXMuUHJvY2Vzc2luZ1N0YXR1c0NkID0gOTtcclxuICAgIGNvbnN0IHVwZFJlc3VsdCA9IGF3YWl0IEJhc2VGb3JtLnVwZGF0ZU1hbnkocmVjb3JkTG9va3VwLCBmb3JtQ2FuY2VsYXRpb25QZW5kaW5nU3RhdHVzKTtcclxuICAgIGlmICh1cGRSZXN1bHQubiAhPT0gZXhwZWN0ZWRDb3VudCB8fCB1cGRSZXN1bHQubiAhPT0gdXBkUmVzdWx0Lm5Nb2RpZmllZCkge1xyXG4gICAgICAgIHJlcy5zdGF0dXMoNTAwKS5zZW5kKGBFeHBlY3RlZCB0byB1cGRhdGUgJHtleHBlY3RlZENvdW50fSwgYnV0IGFjdHVhbGx5IHVwZGF0ZWQgJHt1cGRSZXN1bHQubk1vZGlmaWVkfWApO1xyXG4gICAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIHJlcy5zdGF0dXMoMjAwKS5zZW5kKHVwZFJlc3VsdCk7XHJcbn1cclxuXHJcbi8vIC8vIFVQREFURVMgQSBTSU5HTEUgRk9STSAtIFRISVMgU0hPVUxEIE5FVkVSIEJFIFVTRUQgKE9VVFNJREUgT0YgVEVTVElORykgQkVDQVVTRSBOT09ORSBXSUxMIEtOT1cgVEhFIF9JRFxyXG4vLyByb3V0ZXIucHV0KCcvRm9ybXMvOmlkJywgcHV0Rm9ybVdpdGhJZCk7XHJcblxyXG4vLyBmdW5jdGlvbiBwdXRGb3JtV2l0aElkIChyZXE6ZXhwcmVzcy5SZXF1ZXN0LCByZXM6ZXhwcmVzcy5SZXNwb25zZSkge1xyXG4vLyAgICAgbXlMb2cuZGVidWcocmVxLmJvZHkpO1xyXG4vLyAgICAgY29uc3QgbmV4dHggPSAoKSA9PiB7fTtcclxuLy8gICAgIGNvbnN0IGxvb2t1cDogZm9ybVF1ZXJ5VHlwZSA9IHR1cm5VUkxTdGVtc0ludG9Mb29rdXBPYmplY3QocmVxLCBuZXh0eCk7XHJcbi8vICAgICBteUxvZy5kZWJ1ZyhgUG9zdGVkIGJvZHkgZm9yIHVwZGF0ZSAke0pTT04uc3RyaW5naWZ5KHJlcS5ib2R5KX1gKTtcclxuXHJcbi8vICAgICBsZXQgbmV3Qm9keSA9IHNldEZvb3RwcmludFByb3BlcnRpZXMocmVxLmJvZHksdHJ1ZSk7XHJcbi8vICAgICBteUxvZy5kZWJ1ZyhcIkFib3V0IHRvIGFwcGx5IHVwZGF0ZSB0bzogXCIgKyByZXEucGFyYW1zLl9pZCArIFwiIHdpdGggYm9keSBcIiArIEpTT04uc3RyaW5naWZ5KG5ld0JvZHkpKTtcclxuXHJcbi8vICAgICBGb3JtLmZpbmRCeUlkQW5kVXBkYXRlKHJlcS5wYXJhbXMuX2lkLCBuZXdCb2R5LCB7dXBzZXJ0OmZhbHNlLCBuZXc6IHRydWV9LCBmdW5jdGlvbiAoZXJyOiBhbnksIGZvcm06IGFueSkge1xyXG4vLyAgICAgaWYgKGVycikgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5zZW5kKFwiVGhlcmUgd2FzIGEgcHJvYmxlbSB1cGRhdGluZyB0aGUgZm9ybS5cIik7XHJcbi8vICAgICAgICAgcmVzLnN0YXR1cygyMDApLnNlbmQoZm9ybSk7XHJcbi8vICAgICB9KTsgIFxyXG4vLyB9OyBcclxuXHJcbi8vIENSRUFURVMgQSBORVcgRk9STSAtIGRvbid0IHRoaW5rIHdlIG5lZWQgdGhpcyEhICBKdXN0IG1lYW5zIHRoZSBjb25zdW1lciBtdXN0IHN1cHBseSBhIHZhbGlkIGJldCMgYW5kIGNhbGwgcHV0XHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVGb3JtKHJlcTogYW55LCByZXM6IGFueSkge1xyXG4gICAgbXlMb2cuZGVidWcoJ0luc2lkZSBwb3N0Jyk7XHJcbiAgICBteUxvZy5kZWJ1ZygncmVxLmJvZHk6ICcgKyByZXEuYm9keSk7XHJcblxyXG4gICAgLy90b2RvOiBpZiB0aGlzIGlzIG5vdCB0aHJvd24gYXdheTpcclxuICAgIC8vdG9kbzogLSBlbnN1cmUgdXJpIGluZm8gbWF0Y2hlZCBhZ2FpbnN0IGhlYWRlciwgXHJcbiAgICAvL3RvZG86IC0gc2V0dXAgZm9vdHByaW50IGluZm9cclxuICAgIC8vdG9kbzogLSBzZWxlY3RpdmVseSBlbmNyeXB0IGxpbmUgaXRlbXNcclxuICAgIC8vdG9kbzogLSBjYWxsIGpzcmUgdmFsaWRhdGlvbiBydWxlc1xyXG5cclxuXHJcbiAgICBGb3JtKFwiXCIpLmNyZWF0ZShyZXEuYm9keSxcclxuICAgICAgICBmdW5jdGlvbiAoZXJyOiBtb25nb29zZS5FcnJvciwgZm9ybTogbW9uZ29vc2UuTW9kZWw8bW9uZ29vc2UuRG9jdW1lbnQ+KSB7XHJcbiAgICAgICAgICAgIG15TG9nLmRlYnVnKCdwb3N0IGNhbGwgYmFjayByZWNlaXZlZCcpO1xyXG4gICAgICAgICAgICBpZiAoZXJyKSByZXR1cm4gcmVzLnN0YXR1cyg1MDApLnNlbmQoXCJUaGVyZSB3YXMgYSBwcm9ibGVtIGFkZGluZyB0aGUgaW5mb3JtYXRpb24gdG8gdGhlIGRhdGFiYXNlLlxcblwiICsgZXJyLm1lc3NhZ2UpO1xyXG5cclxuICAgICAgICAgICAgLy90b2RvOiBhcHBseSBmb3JtIHVwZGF0ZSBydWxlc1xyXG4gICAgICAgICAgICAvL3RvZG86IHJlc3RpZnkgdGhlIHJlc3BvbnNlXHJcbiAgICAgICAgICAgIC8vdG9kbzogZGVjcnlwdCBsaW5lIGl0ZW1zIFxyXG5cclxuICAgICAgICAgICAgcmVzLnN0YXR1cygyMDApLnNlbmQoZm9ybSk7XHJcbiAgICAgICAgfSk7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY29kZUxvb2t1cChkZWNvZGU6IFN0cmluZyk6IG51bWJlciB7XHJcbiAgICAvL3RvZG86IGR1bW15XHJcbiAgICBpZiAoZGVjb2RlID09IFwiSVRcIikgcmV0dXJuIDU7XHJcbiAgICBpZiAoZGVjb2RlID09IFwiR1NUXCIpIHJldHVybiAxMDtcclxuICAgIGlmIChkZWNvZGUgPT0gXCJTVFBcIikgcmV0dXJuIDY2O1xyXG4gICAgcmV0dXJuIC0xO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHJvdXRlcjsiXX0=
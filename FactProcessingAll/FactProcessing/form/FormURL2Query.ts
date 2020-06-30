import * as myLog from '../../myLog';
import * as express from 'express';
import { codeLookup } from './FormController';
myLog.debug("in FormURL2Query");

export interface formQueryType {
    ClientInternalId?: number;
    AccountSequenceNumber?: number;
    RoleTypeCode?: number;
    PeriodStartDt?: any;
    FormType?: string;
    TransactionId?: number;
    DT_Update?: string;
    TM_Update?: string;
    _id?: any;
    $and?: object;
    //subjectClient?: subjectClient;
    [index: string]: any;
}

export interface subjectClient { //this isn't actually used
    ClientIdentifierType?: string;
    ClientIdentifierValue?: number;
    MatchingStatus?: string;
}

export function turnURLStemsIntoLookupObject(req: express.Request, next: express.NextFunction): formQueryType {
let lookup: formQueryType = {};

    if (req.params.ClientInternalId)
        lookup.ClientInternalId = parseInt(req.params.ClientInternalId);
    
    if (req.params.AccountSequenceNumber)
        lookup.AccountSequenceNumber = parseInt(req.params.AccountSequenceNumber);
    
    if (req.params.RoleTypeShortDecode)
        lookup.RoleTypeCode = codeLookup(req.params.RoleTypeShortDecode);
    
    if (req.params.PeriodStartDt)
        lookup.PeriodStartDt = req.params.PeriodStartDt;
    
    //strip a "Form" suffix off here.  Its dumb. But trying to align with published URI.
    if (req.params.FormTypeMung) {
        if (!req.params.FormTypeMung.toLowerCase().endsWith("form"))
            next(new Error("Invalid FormType Stem"));
        lookup.FormType = req.params.FormTypeMung.slice(0, -4);
    }
    
    if (req.params.TransactionId)
        lookup.TransactionId = parseInt(req.params.TransactionId);
    
    if (req.params._id)
        lookup.TransactionId = parseInt(req.params._id);  
    
    let filterProperty: string = <string> req.query.filter;
    myLog.debug(`filterProperty: ${filterProperty}`);
    //url filter should look like: PeriodBeginDate=2018-12-31,PeriodEndDate=2019-03-31
    //want it to look like: {  ClientInternalId: 12345 ,...blah..., $and: [{ PeriodStartDt: { $gt: "2018-12-31" } }, { PeriodStartDt: { $lt: "2019-01-02" } }] }
    let periodFilter = (filterProperty || "").split(",");
    let periodBeginFilter = (periodFilter[0] || "PeriodBeginDate=2000-01-01").split("=")[1] || "2000-01-01";
    let periodEndFilter = (periodFilter[1] || "PeriodEndDate=9999-31-12").split("=")[1] || "9999-31-12";
    let filter = [{ PeriodStartDt: { $gt: "2000-01-10" } }, { PeriodStartDt: { $lt: "9999-31-12" } }];
    filter[0].PeriodStartDt.$gt = periodBeginFilter;
    filter[1].PeriodStartDt.$lt = periodEndFilter;
    // todo: can't get dates to work  
    // lookup.$and = filter;
    // tried: https://stackoverflow.com/questions/19819870/date-query-with-isodate-in-mongodb-doesnt-seem-to-work
    // lookup = {PeriodStartDt:{$gte:"2019-01-01"}}
    // lookup = {PeriodStartDt: {"$gte" : new Date("2013-10-01").toISOString() } };
    // lookup = {ClientInternalId:12345,AccountSequenceNumber:1,RoleTypeCode:5,FormType:"myFT6",TransactionId:1122330};
    // lookup = {ClientInternalId:12345,AccountSequenceNumber:1,RoleTypeCode:5,FormType:"myFT6",TransactionId:1122330,$and:[{PeriodStartDt:{$gt:"2018-12-31"}},{PeriodStartDt:{$lt:"2019-03-31"}}]};
    // lookup = {$and:[{PeriodStartDt:{$gt:"2018-12-31"}}]};
    // this one does work because its not a date: lookup.AccountSequenceNumber = {$gt: 0}
    //todo: add form line item filter properties...
    
    lookup = addOptimisticLockingConstraint(lookup, req.body);
    
    if (req.params.ClientIdentifierType && req.params.ClientIdentifierValue) {
        lookup['subjectClient.ClientIdentifierType']=req.params.ClientIdentifierType;
        //todo: can't remember why I'm multiplying by 1
        lookup['subjectClient.ClientIdentifierValue']=<any>req.params.ClientIdentifierValue * 1;
    }

    myLog.debug(`Looking up database with: ${JSON.stringify(lookup)}`);
    
    if (!req.params.ClientInternalId && !(req.params.ClientIdentifierType && req.params.ClientIdentifierValue))
        next(new Error("No Client Identifier, so who am I doing this for??"));

        const doingFormIdentity = req.path.indexOf('/FormIdentity/') > 1
    if ((req.method == "PUT" || req.method == "DELETE") && !doingFormIdentity && !req.params.TransactionId  )
        next(new Error("No Transaction Id"));

    return lookup;
}


// add DT/TM_Update for optimistic locking check (double update will result in "not found", 
// which may result in an insert with duplicate Transaction_Id, hence unique index violation)
export function addOptimisticLockingConstraint(lookup: formQueryType, tobeForm: any) {
  if (tobeForm.DT_Update){
      lookup.DT_Update = tobeForm.DT_Update;
      lookup.TM_Update = tobeForm.TM_Update;
  }
  return lookup;
}

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
const myLog = __importStar(require("../../../myLog"));
myLog.debug('Inside FormIdentityValidator');
;
exports.formSpecific = {};
function getFactSpecificStuff(formTypeMung, next) {
    myLog.debug("Loading form specific stuff for " + formTypeMung);
    Promise.resolve().then(() => __importStar(require("./UniqueFormRules_" + formTypeMung))).then((m) => {
        myLog.debug("Have loaded form specific stuff for " + formTypeMung);
        exports.formSpecific[formTypeMung] = m;
        exports.formMetaData = m.formMetaData;
        exports.formMetaDataById = m.formMetaDataById;
        exports.formMetaDataByName = m.formMetaDataByName;
        // priorLodgmentLookup = formSpecific.priorLodgmentLookup;
        // formIdLookup = formSpecific.formIdLookup;
        // confirmCanTakeIdentityFromPriorLodgment = formSpecific.confirmCanTakeIdentityFromPriorLodgment;
        exports.lineItemsSchema_FormSpecific = m.lineItemsSchema_FormSpecific;
        exports.businessRulesLanguage = m.businessRulesLanguage;
        exports.wireFormat = m.wireFormat;
        next();
    }).catch((reason) => {
        myLog.error("Module load failed, because" + reason + " will try to carry on.");
        next();
    });
}
exports.getFactSpecificStuff = getFactSpecificStuff;
function getPriorLodgmentLookupCriteria(formTypeMung, req, res) {
    if (!exports.formSpecific || !exports.formSpecific[formTypeMung])
        myLog.error('Curious', exports.formSpecific);
    let identityCriteria = addCommonIdentityCriteria({ FormType: exports.formSpecific[formTypeMung].FormType }, req, res);
    exports.formSpecific[formTypeMung].addToFormSpecificIdentityCriteria(identityCriteria, req, res);
    return identityCriteria;
}
exports.getPriorLodgmentLookupCriteria = getPriorLodgmentLookupCriteria;
function addCommonIdentityCriteria(identityCriteria, req, res) {
    if (req.body.ClientInternalId)
        identityCriteria.ClientInternalId = req.body.ClientInternalId;
    else {
        identityCriteria = universalIdentityCriteria(identityCriteria, res);
    }
    return identityCriteria;
}
function identityLookupCriteria(formTypeMung, req, res) {
    if (!exports.formSpecific || !exports.formSpecific[formTypeMung])
        myLog.error('Curious', exports.formSpecific);
    let identityCriteria = universalIdentityCriteria({ FormType: exports.formSpecific[formTypeMung].FormType }, res);
    exports.formSpecific[formTypeMung].addToFormSpecificIdentityCriteria(identityCriteria, req, res);
    identityCriteria["subjectClient.MatchingStatus"] = "UnMatched";
    return identityCriteria;
}
exports.identityLookupCriteria = identityLookupCriteria;
function universalIdentityCriteria(identityCriteria, res) {
    identityCriteria['subjectClient.ClientIdentifierType'] = res.locals.lookup['subjectClient.ClientIdentifierType'];
    identityCriteria['subjectClient.ClientIdentifierValue'] = res.locals.lookup['subjectClient.ClientIdentifierValue'];
    identityCriteria['subjectClient.MatchingStatus'] = "Matched";
    return identityCriteria;
}
//Confirm that identity info on the new form matches info from the retrieved form
function confirmCanTakeIdentityFromPriorLodgment(formTypeMung, req, foundForm, res) {
    if (!req.body.ClientInternalId)
        req.body.ClientInternalId = foundForm.ClientInternalId;
    else {
        res.locals.lookup.ClientInternalId = req.body.ClientInternalId; //use client internal id by preference
        delete res.locals.lookup.ClientIdentifierType;
        delete res.locals.lookup.ClientIdentifierValue;
    }
    exports.formSpecific[formTypeMung].confirmCanTakeIdentityFromPriorLodgment(formTypeMung, req, foundForm, res);
    myLog.debug('Prior lodgemnt lookup result: ' + req.body.subjectClient.MatchingStatus + " with client internal id: " + req.body.ClientInternalId);
    myLog.debug("After Prior lodgment lookup the body looks like: " + JSON.stringify(req.body).substr(0, 150));
}
exports.confirmCanTakeIdentityFromPriorLodgment = confirmCanTakeIdentityFromPriorLodgment;
function postPutPreReturnHook(formTypeMung, req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        myLog.debug("Will do form specific fiddling here");
        return;
    });
}
exports.postPutPreReturnHook = postPutPreReturnHook;
function decideWhatToPutInPrefill(formTypeMung, meaningfulNameForm) {
    return __awaiter(this, void 0, void 0, function* () {
        myLog.debug("Will do form specific repliation here", formTypeMung);
        let x = exports.formSpecific[formTypeMung].decideWhatToPutInPrefill(formTypeMung, meaningfulNameForm);
        return x;
    });
}
exports.decideWhatToPutInPrefill = decideWhatToPutInPrefill;
function bulkTransmissionTracking(formTypeMung, req, res, meaningfulNameForm) {
    return __awaiter(this, void 0, void 0, function* () {
        myLog.debug("Seeing if need to upate File Counts for:", formTypeMung);
        return exports.formSpecific[formTypeMung].bulkTransmissionTracking(formTypeMung, req, res, meaningfulNameForm);
    });
}
exports.bulkTransmissionTracking = bulkTransmissionTracking;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFjdFNwZWNpZmljUGx1Z2luLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmFjdFNwZWNpZmljUGx1Z2luLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHNEQUF3QztBQUN4QyxLQUFLLENBQUMsS0FBSyxDQUFDLDhCQUE4QixDQUFDLENBQUM7QUFjM0MsQ0FBQztBQUNTLFFBQUEsWUFBWSxHQUErQyxFQUFFLENBQUM7QUFJekUsU0FBZ0Isb0JBQW9CLENBQUMsWUFBb0IsRUFBRSxJQUFTO0lBRWhFLEtBQUssQ0FBQyxLQUFLLENBQUMsa0NBQWtDLEdBQUcsWUFBWSxDQUFDLENBQUM7SUFDL0Qsa0RBQU8sb0JBQW9CLEdBQUcsWUFBWSxJQUNyQyxJQUFJLENBQUMsQ0FBQyxDQUF3QixFQUFFLEVBQUU7UUFDL0IsS0FBSyxDQUFDLEtBQUssQ0FBQyxzQ0FBc0MsR0FBRyxZQUFZLENBQUMsQ0FBQztRQUNuRSxvQkFBWSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUUvQixvQkFBWSxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUM7UUFDOUIsd0JBQWdCLEdBQUcsQ0FBQyxDQUFDLGdCQUFnQixDQUFDO1FBQ3RDLDBCQUFrQixHQUFHLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQztRQUMxQywwREFBMEQ7UUFDMUQsNENBQTRDO1FBQzVDLGtHQUFrRztRQUVsRyxvQ0FBNEIsR0FBRyxDQUFDLENBQUMsNEJBQTRCLENBQUM7UUFDOUQsNkJBQXFCLEdBQUcsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO1FBQ2hELGtCQUFVLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQztRQUMxQixJQUFJLEVBQUUsQ0FBQztJQUNYLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO1FBQ2hCLEtBQUssQ0FBQyxLQUFLLENBQUMsNkJBQTZCLEdBQUcsTUFBTSxHQUFHLHdCQUF3QixDQUFDLENBQUM7UUFD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QUUsR0FBRyxFQUFFLGtCQUFrQixDQUFDLENBQUM7SUFDM0csQ0FBQztDQUFBO0FBSEQsNERBR0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBteUxvZyBmcm9tICcuLi8uLi8uLi9teUxvZyc7XHJcbm15TG9nLmRlYnVnKCdJbnNpZGUgRm9ybUlkZW50aXR5VmFsaWRhdG9yJyk7XHJcbmltcG9ydCB7IGZvcm1RdWVyeVR5cGUgfSBmcm9tICcuLi9Gb3JtVVJMMlF1ZXJ5JztcclxuXHJcbmltcG9ydCAqIGFzIG1vbmdvb3NlIGZyb20gJ21vbmdvb3NlJztcclxuaW50ZXJmYWNlIGZvcm1TcGVjaWZpY0Z1bmN0aW9ucyB7XHJcbiAgICBsaW5lSXRlbXNTY2hlbWFfRm9ybVNwZWNpZmljOiBtb25nb29zZS5TY2hlbWEsXHJcbiAgICBhZGRUb0Zvcm1TcGVjaWZpY0lkZW50aXR5Q3JpdGVyaWE6IChpZGVudGl0eUNyaXRlcmlhOiBhbnksIHJlcTogYW55LCByZXM6IGFueSkgPT4gT2JqZWN0LFxyXG4gICAgZm9ybUxvb2t1cEZvcklkZW50aXR5VXBkYXRlOiAocmVxOiBhbnksIHJlczogYW55KSA9PiBPYmplY3QsXHJcbiAgICBjb25maXJtQ2FuVGFrZUlkZW50aXR5RnJvbVByaW9yTG9kZ21lbnQ6IChGb3JtVHlwZU11bmc6IHN0cmluZywgcmVxOiBhbnksIGZvdW5kRm9ybTogYW55LCByZXM6IGFueSkgPT4gYW55LFxyXG4gICAgcG9zdFB1dFByZVJldHVybkhvb2s6IChmb3JtVHlwZU11bmc6IHN0cmluZywgcmVxOiBhbnksIHJlczogYW55KSA9PiBhbnksXHJcbiAgICBkZWNpZGVXaGF0VG9QdXRJblByZWZpbGw6IChmb3JtVHlwZU11bmc6IHN0cmluZywgbWVhbmluZ2Z1bE5hbWVGb3JtOiBhbnkpID0+IGFueSwgLy8ge3ByZUZpbGxGb3JtVHlwZU11bmc6c3RyaW5nLCBwcmVGaWxsU2NoZW1hOmFueSwgcHJlRmlsbExvb2t1cDpPYmplY3QsICBwcmVmaWxsVXBkYXRlUGF5bG9hZDpPYmplY3QgfSxcclxuICAgIGJ1bGtUcmFuc21pc3Npb25UcmFja2luZzogKGZvcm1UeXBlTXVuZzogc3RyaW5nLCByZXE6IGFueSwgcmVzOiBhbnksIG1lYW5pbmdmdWxOYW1lRm9ybTogYW55KSA9PiBhbnksIC8ve2xvb2t1cDpzdHJpbmcsIHVwZGF0ZTpzdHJpbmd9XHJcbiAgICBmb3JtTWV0YURhdGE6IGFueSwgZm9ybU1ldGFEYXRhQnlJZDogYW55LCBmb3JtTWV0YURhdGFCeU5hbWU6IGFueSwgRm9ybVR5cGU6IHN0cmluZ1xyXG4gICAgYnVzaW5lc3NSdWxlc0xhbmd1YWdlOiBzdHJpbmcsIHdpcmVGb3JtYXQ6IHN0cmluZ1xyXG59O1xyXG5leHBvcnQgdmFyIGZvcm1TcGVjaWZpYzogeyBbaW5kZXg6IHN0cmluZ106IGZvcm1TcGVjaWZpY0Z1bmN0aW9ucyB9ID0ge307XHJcblxyXG5leHBvcnQgbGV0IGZvcm1NZXRhRGF0YTogYW55LCBmb3JtTWV0YURhdGFCeUlkOiBhbnksIGZvcm1NZXRhRGF0YUJ5TmFtZTogYW55LCBsaW5lSXRlbXNTY2hlbWFfRm9ybVNwZWNpZmljOiBtb25nb29zZS5TY2hlbWEsIGJ1c2luZXNzUnVsZXNMYW5ndWFnZTogc3RyaW5nLCB3aXJlRm9ybWF0OiBzdHJpbmc7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0RmFjdFNwZWNpZmljU3R1ZmYoZm9ybVR5cGVNdW5nOiBzdHJpbmcsIG5leHQ6IGFueSkge1xyXG5cclxuICAgIG15TG9nLmRlYnVnKFwiTG9hZGluZyBmb3JtIHNwZWNpZmljIHN0dWZmIGZvciBcIiArIGZvcm1UeXBlTXVuZyk7XHJcbiAgICBpbXBvcnQoXCIuL1VuaXF1ZUZvcm1SdWxlc19cIiArIGZvcm1UeXBlTXVuZylcclxuICAgICAgICAudGhlbigobTogZm9ybVNwZWNpZmljRnVuY3Rpb25zKSA9PiB7XHJcbiAgICAgICAgICAgIG15TG9nLmRlYnVnKFwiSGF2ZSBsb2FkZWQgZm9ybSBzcGVjaWZpYyBzdHVmZiBmb3IgXCIgKyBmb3JtVHlwZU11bmcpO1xyXG4gICAgICAgICAgICBmb3JtU3BlY2lmaWNbZm9ybVR5cGVNdW5nXSA9IG07XHJcblxyXG4gICAgICAgICAgICBmb3JtTWV0YURhdGEgPSBtLmZvcm1NZXRhRGF0YTtcclxuICAgICAgICAgICAgZm9ybU1ldGFEYXRhQnlJZCA9IG0uZm9ybU1ldGFEYXRhQnlJZDtcclxuICAgICAgICAgICAgZm9ybU1ldGFEYXRhQnlOYW1lID0gbS5mb3JtTWV0YURhdGFCeU5hbWU7XHJcbiAgICAgICAgICAgIC8vIHByaW9yTG9kZ21lbnRMb29rdXAgPSBmb3JtU3BlY2lmaWMucHJpb3JMb2RnbWVudExvb2t1cDtcclxuICAgICAgICAgICAgLy8gZm9ybUlkTG9va3VwID0gZm9ybVNwZWNpZmljLmZvcm1JZExvb2t1cDtcclxuICAgICAgICAgICAgLy8gY29uZmlybUNhblRha2VJZGVudGl0eUZyb21QcmlvckxvZGdtZW50ID0gZm9ybVNwZWNpZmljLmNvbmZpcm1DYW5UYWtlSWRlbnRpdHlGcm9tUHJpb3JMb2RnbWVudDtcclxuXHJcbiAgICAgICAgICAgIGxpbmVJdGVtc1NjaGVtYV9Gb3JtU3BlY2lmaWMgPSBtLmxpbmVJdGVtc1NjaGVtYV9Gb3JtU3BlY2lmaWM7XHJcbiAgICAgICAgICAgIGJ1c2luZXNzUnVsZXNMYW5ndWFnZSA9IG0uYnVzaW5lc3NSdWxlc0xhbmd1YWdlO1xyXG4gICAgICAgICAgICB3aXJlRm9ybWF0ID0gbS53aXJlRm9ybWF0O1xyXG4gICAgICAgICAgICBuZXh0KCk7XHJcbiAgICAgICAgfSkuY2F0Y2goKHJlYXNvbikgPT4ge1xyXG4gICAgICAgICAgICBteUxvZy5lcnJvcihcIk1vZHVsZSBsb2FkIGZhaWxlZCwgYmVjYXVzZVwiICsgcmVhc29uICsgXCIgd2lsbCB0cnkgdG8gY2Fycnkgb24uXCIpO1xyXG4gICAgICAgICAgICBuZXh0KCk7XHJcbiAgICAgICAgfSk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFByaW9yTG9kZ21lbnRMb29rdXBDcml0ZXJpYShmb3JtVHlwZU11bmc6IHN0cmluZywgcmVxOiBhbnksIHJlczogYW55KTogZm9ybVF1ZXJ5VHlwZSB7XHJcbiAgICBpZiAoIWZvcm1TcGVjaWZpYyB8fCAhZm9ybVNwZWNpZmljW2Zvcm1UeXBlTXVuZ10pIG15TG9nLmVycm9yKCdDdXJpb3VzJywgZm9ybVNwZWNpZmljKTtcclxuICAgIGxldCBpZGVudGl0eUNyaXRlcmlhID0gYWRkQ29tbW9uSWRlbnRpdHlDcml0ZXJpYSh7IEZvcm1UeXBlOiBmb3JtU3BlY2lmaWNbZm9ybVR5cGVNdW5nXS5Gb3JtVHlwZSB9LCByZXEsIHJlcyk7XHJcbiAgICBmb3JtU3BlY2lmaWNbZm9ybVR5cGVNdW5nXS5hZGRUb0Zvcm1TcGVjaWZpY0lkZW50aXR5Q3JpdGVyaWEoaWRlbnRpdHlDcml0ZXJpYSwgcmVxLCByZXMpO1xyXG5cclxuICAgIHJldHVybiBpZGVudGl0eUNyaXRlcmlhO1xyXG59XHJcblxyXG5mdW5jdGlvbiBhZGRDb21tb25JZGVudGl0eUNyaXRlcmlhKGlkZW50aXR5Q3JpdGVyaWE6IGFueSwgcmVxOiBhbnksIHJlczogYW55KSB7XHJcbiAgICBpZiAocmVxLmJvZHkuQ2xpZW50SW50ZXJuYWxJZClcclxuICAgICAgICBpZGVudGl0eUNyaXRlcmlhLkNsaWVudEludGVybmFsSWQgPSByZXEuYm9keS5DbGllbnRJbnRlcm5hbElkO1xyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgaWRlbnRpdHlDcml0ZXJpYSA9IHVuaXZlcnNhbElkZW50aXR5Q3JpdGVyaWEoaWRlbnRpdHlDcml0ZXJpYSwgcmVzKTtcclxuICAgIH1cclxuICAgIHJldHVybiBpZGVudGl0eUNyaXRlcmlhO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaWRlbnRpdHlMb29rdXBDcml0ZXJpYShmb3JtVHlwZU11bmc6IHN0cmluZywgcmVxOiBhbnksIHJlczogYW55KTogZm9ybVF1ZXJ5VHlwZSB7XHJcbiAgICBpZiAoIWZvcm1TcGVjaWZpYyB8fCAhZm9ybVNwZWNpZmljW2Zvcm1UeXBlTXVuZ10pIG15TG9nLmVycm9yKCdDdXJpb3VzJywgZm9ybVNwZWNpZmljKTtcclxuICAgIGxldCBpZGVudGl0eUNyaXRlcmlhID0gdW5pdmVyc2FsSWRlbnRpdHlDcml0ZXJpYSh7IEZvcm1UeXBlOiBmb3JtU3BlY2lmaWNbZm9ybVR5cGVNdW5nXS5Gb3JtVHlwZSB9LCByZXMpO1xyXG4gICAgZm9ybVNwZWNpZmljW2Zvcm1UeXBlTXVuZ10uYWRkVG9Gb3JtU3BlY2lmaWNJZGVudGl0eUNyaXRlcmlhKGlkZW50aXR5Q3JpdGVyaWEsIHJlcSwgcmVzKTtcclxuICAgIGlkZW50aXR5Q3JpdGVyaWFbXCJzdWJqZWN0Q2xpZW50Lk1hdGNoaW5nU3RhdHVzXCJdID0gXCJVbk1hdGNoZWRcIjtcclxuICAgIHJldHVybiBpZGVudGl0eUNyaXRlcmlhO1xyXG59XHJcblxyXG5mdW5jdGlvbiB1bml2ZXJzYWxJZGVudGl0eUNyaXRlcmlhKGlkZW50aXR5Q3JpdGVyaWE6IGFueSwgcmVzOiBhbnkpIHtcclxuICAgIGlkZW50aXR5Q3JpdGVyaWFbJ3N1YmplY3RDbGllbnQuQ2xpZW50SWRlbnRpZmllclR5cGUnXSA9IHJlcy5sb2NhbHMubG9va3VwWydzdWJqZWN0Q2xpZW50LkNsaWVudElkZW50aWZpZXJUeXBlJ107XHJcbiAgICBpZGVudGl0eUNyaXRlcmlhWydzdWJqZWN0Q2xpZW50LkNsaWVudElkZW50aWZpZXJWYWx1ZSddID0gcmVzLmxvY2Fscy5sb29rdXBbJ3N1YmplY3RDbGllbnQuQ2xpZW50SWRlbnRpZmllclZhbHVlJ107XHJcbiAgICBpZGVudGl0eUNyaXRlcmlhWydzdWJqZWN0Q2xpZW50Lk1hdGNoaW5nU3RhdHVzJ10gPSBcIk1hdGNoZWRcIjtcclxuICAgIHJldHVybiBpZGVudGl0eUNyaXRlcmlhO1xyXG59XHJcblxyXG4vL0NvbmZpcm0gdGhhdCBpZGVudGl0eSBpbmZvIG9uIHRoZSBuZXcgZm9ybSBtYXRjaGVzIGluZm8gZnJvbSB0aGUgcmV0cmlldmVkIGZvcm1cclxuZXhwb3J0IGZ1bmN0aW9uIGNvbmZpcm1DYW5UYWtlSWRlbnRpdHlGcm9tUHJpb3JMb2RnbWVudChmb3JtVHlwZU11bmc6IHN0cmluZywgcmVxOiBhbnksIGZvdW5kRm9ybTogYW55LCByZXM6IGFueSk6IGFueSB7XHJcbiAgICBpZiAoIXJlcS5ib2R5LkNsaWVudEludGVybmFsSWQpIHJlcS5ib2R5LkNsaWVudEludGVybmFsSWQgPSBmb3VuZEZvcm0uQ2xpZW50SW50ZXJuYWxJZDtcclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJlcy5sb2NhbHMubG9va3VwLkNsaWVudEludGVybmFsSWQgPSByZXEuYm9keS5DbGllbnRJbnRlcm5hbElkOyAgLy91c2UgY2xpZW50IGludGVybmFsIGlkIGJ5IHByZWZlcmVuY2VcclxuICAgICAgICBkZWxldGUgcmVzLmxvY2Fscy5sb29rdXAuQ2xpZW50SWRlbnRpZmllclR5cGU7XHJcbiAgICAgICAgZGVsZXRlIHJlcy5sb2NhbHMubG9va3VwLkNsaWVudElkZW50aWZpZXJWYWx1ZTtcclxuICAgIH1cclxuICAgIGZvcm1TcGVjaWZpY1tmb3JtVHlwZU11bmddLmNvbmZpcm1DYW5UYWtlSWRlbnRpdHlGcm9tUHJpb3JMb2RnbWVudChmb3JtVHlwZU11bmcsIHJlcSwgZm91bmRGb3JtLCByZXMpO1xyXG4gICAgbXlMb2cuZGVidWcoJ1ByaW9yIGxvZGdlbW50IGxvb2t1cCByZXN1bHQ6ICcgKyByZXEuYm9keS5zdWJqZWN0Q2xpZW50Lk1hdGNoaW5nU3RhdHVzICsgXCIgd2l0aCBjbGllbnQgaW50ZXJuYWwgaWQ6IFwiICsgcmVxLmJvZHkuQ2xpZW50SW50ZXJuYWxJZClcclxuICAgIG15TG9nLmRlYnVnKFwiQWZ0ZXIgUHJpb3IgbG9kZ21lbnQgbG9va3VwIHRoZSBib2R5IGxvb2tzIGxpa2U6IFwiICsgSlNPTi5zdHJpbmdpZnkocmVxLmJvZHkpLnN1YnN0cigwLCAxNTApKTtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBvc3RQdXRQcmVSZXR1cm5Ib29rKGZvcm1UeXBlTXVuZzogc3RyaW5nLCByZXE6IGFueSwgcmVzOiBhbnkpIHtcclxuICAgIG15TG9nLmRlYnVnKFwiV2lsbCBkbyBmb3JtIHNwZWNpZmljIGZpZGRsaW5nIGhlcmVcIik7XHJcbiAgICByZXR1cm47XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWNpZGVXaGF0VG9QdXRJblByZWZpbGwoZm9ybVR5cGVNdW5nOiBzdHJpbmcsIG1lYW5pbmdmdWxOYW1lRm9ybTogYW55KTogUHJvbWlzZTx7IHByZWZpbGxMb29rdXA6IGFueSwgcHJlZmlsbEluc2VydDogT2JqZWN0LCBwcmVmaWxsVXBkYXRlOiBPYmplY3QgfVtdPiB7XHJcbiAgICBteUxvZy5kZWJ1ZyhcIldpbGwgZG8gZm9ybSBzcGVjaWZpYyByZXBsaWF0aW9uIGhlcmVcIiwgZm9ybVR5cGVNdW5nKTtcclxuICAgIGxldCB4ID0gZm9ybVNwZWNpZmljW2Zvcm1UeXBlTXVuZ10uZGVjaWRlV2hhdFRvUHV0SW5QcmVmaWxsKGZvcm1UeXBlTXVuZywgbWVhbmluZ2Z1bE5hbWVGb3JtKTtcclxuICAgIHJldHVybiB4O1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYnVsa1RyYW5zbWlzc2lvblRyYWNraW5nKGZvcm1UeXBlTXVuZzogc3RyaW5nLCByZXE6IGFueSwgcmVzOiBhbnksIG1lYW5pbmdmdWxOYW1lRm9ybTogYW55KTogUHJvbWlzZTx7IGxvb2t1cEZpbHRlcjogYW55LCB1cHNlcnRCb2R5OiBhbnksIHNjaGVtYTphbnkgfSB8IG51bGw+IHtcclxuICAgIG15TG9nLmRlYnVnKFwiU2VlaW5nIGlmIG5lZWQgdG8gdXBhdGUgRmlsZSBDb3VudHMgZm9yOlwiLCBmb3JtVHlwZU11bmcpO1xyXG4gICAgcmV0dXJuIGZvcm1TcGVjaWZpY1tmb3JtVHlwZU11bmddLmJ1bGtUcmFuc21pc3Npb25UcmFja2luZyhmb3JtVHlwZU11bmcsIHJlcSwgcmVzLCBtZWFuaW5nZnVsTmFtZUZvcm0pO1xyXG59Il19
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
exports.formMetaData = {};
exports.formDef = {};
exports.FormType = 'bulkTransmission', exports.businessRulesLanguage = "", exports.wireFormat = "JSRE";
;
const schema = {};
const byId = {};
const byName = {};
exports.lineItemsSchema_FormSpecific = schema, exports.formMetaDataById = byId, exports.formMetaDataByName = byName;
myLog.debug("Additional " + exports.FormType + " line items schema definition " + JSON.stringify(exports.lineItemsSchema_FormSpecific));
function addToFormSpecificIdentityCriteria(identityCriteria, req, res) {
    return identityCriteria;
}
exports.addToFormSpecificIdentityCriteria = addToFormSpecificIdentityCriteria;
function confirmCanTakeIdentityFromPriorLodgment(FormTypeMung, req, foundForm, res) {
    //because we found a matched form for corresponding details, we can make this form matched
    if (req.body.ClientInternalId && req.body.ClientInternalId > 0)
        req.body.subjectClient.MatchingStatus = "Matched";
    else
        req.body.subjectClient.MatchingStatus = "UnMatched";
    myLog.debug(`Client Internal Id ${JSON.stringify(req.body.ClientInternalId)}`);
    return req;
}
exports.confirmCanTakeIdentityFromPriorLodgment = confirmCanTakeIdentityFromPriorLodgment;
function postPutPreReturnHook(formTypeMung, req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        myLog.debug("Will do form specific fiddling here");
        return;
    });
}
exports.postPutPreReturnHook = postPutPreReturnHook;
function decideWhatToPutInPrefill(formTypeMung, req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        myLog.debug("Will do form specific repliation here");
        return;
    });
}
exports.decideWhatToPutInPrefill = decideWhatToPutInPrefill;
function bulkTransmissionTracking(formTypeMung, req, res, meaningfulNameForm) {
    return __awaiter(this, void 0, void 0, function* () {
        return null;
    });
}
exports.bulkTransmissionTracking = bulkTransmissionTracking;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVW5pcXVlRm9ybVJ1bGVzX2J1bGtUcmFuc21pc3Npb25Gb3JtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiVW5pcXVlRm9ybVJ1bGVzX2J1bGtUcmFuc21pc3Npb25Gb3JtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHNEQUF3QztBQUMzQixRQUFBLFlBQVksR0FBRyxFQUFFLENBQUM7QUFDbEIsUUFBQSxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ2IsUUFBQSxRQUFRLEdBQUcsa0JBQWtCLEVBQUUsUUFBQSxxQkFBcUIsR0FBRyxFQUFFLEVBQUUsUUFBQSxVQUFVLEdBQUcsTUFBTSxDQUFDO0FBQUEsQ0FBQztBQUU3RixNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFFbEIsTUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBRWhCLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUVMLFFBQUEsNEJBQTRCLEdBQUcsTUFBTSxFQUFFLFFBQUEsZ0JBQWdCLEdBQUcsSUFBSSxFQUFFLFFBQUEsa0JBQWtCLEdBQUcsTUFBTSxDQUFDO0FBR3pHLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxHQUFHLGdCQUFRLEdBQUcsZ0NBQWdDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQ0FBNEIsQ0FBQyxDQUFDLENBQUM7QUFFeEgsU0FBZ0IsaUNBQWlDLENBQUMsZ0JBQXFCLEVBQUUsR0FBUSxFQUFFLEdBQVE7SUFDdkYsT0FBTyxnQkFBZ0IsQ0FBQztBQUM1QixDQUFDO0FBRkQsOEVBRUM7QUFFRCxTQUFnQix1Q0FBdUMsQ0FBQyxZQUFvQixFQUFFLEdBQVEsRUFBRSxTQUFjLEVBQUUsR0FBUTtJQUM1RywwRkFBMEY7SUFDMUYsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQztRQUMxRCxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLEdBQUcsU0FBUyxDQUFDOztRQUVsRCxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLEdBQUcsV0FBVyxDQUFDO0lBRXhELEtBQUssQ0FBQyxLQUFLLENBQUMsc0JBQXNCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMvRSxPQUFPLEdBQUcsQ0FBQztBQUNmLENBQUM7QUFURCwwRkFTQztBQUVELFNBQXNCLG9CQUFvQixDQUFDLFlBQW9CLEVBQUUsR0FBUSxFQUFFLEdBQVE7O1FBQy9FLEtBQUssQ0FBQyxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztRQUNuRCxPQUFPO0lBQ1gsQ0FBQztDQUFBO0FBSEQsb0RBR0M7QUFFRCxTQUFzQix3QkFBd0IsQ0FBQyxZQUFvQixFQUFFLEdBQVEsRUFBRSxHQUFROztRQUNuRixLQUFLLENBQUMsS0FBSyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7UUFDckQsT0FBTztJQUNYLENBQUM7Q0FBQTtBQUhELDREQUdDO0FBRUQsU0FBc0Isd0JBQXdCLENBQUMsWUFBb0IsRUFBRSxHQUFRLEVBQUUsR0FBUSxFQUFFLGtCQUF1Qjs7UUFDNUcsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztDQUFBO0FBRkQsNERBRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBteUxvZyBmcm9tICcuLi8uLi8uLi9teUxvZyc7XHJcbmV4cG9ydCBjb25zdCBmb3JtTWV0YURhdGEgPSB7fTtcclxuZXhwb3J0IGNvbnN0IGZvcm1EZWYgPSB7fTtcclxuZXhwb3J0IGNvbnN0IEZvcm1UeXBlID0gJ2J1bGtUcmFuc21pc3Npb24nLCBidXNpbmVzc1J1bGVzTGFuZ3VhZ2UgPSBcIlwiLCB3aXJlRm9ybWF0ID0gXCJKU1JFXCI7O1xyXG5cclxuY29uc3Qgc2NoZW1hID0ge307XHJcblxyXG5jb25zdCBieUlkID0ge307XHJcblxyXG5jb25zdCBieU5hbWUgPSB7fTtcclxuXHJcbmV4cG9ydCBjb25zdCBsaW5lSXRlbXNTY2hlbWFfRm9ybVNwZWNpZmljID0gc2NoZW1hLCBmb3JtTWV0YURhdGFCeUlkID0gYnlJZCwgZm9ybU1ldGFEYXRhQnlOYW1lID0gYnlOYW1lO1xyXG5cclxuXHJcbm15TG9nLmRlYnVnKFwiQWRkaXRpb25hbCBcIiArIEZvcm1UeXBlICsgXCIgbGluZSBpdGVtcyBzY2hlbWEgZGVmaW5pdGlvbiBcIiArIEpTT04uc3RyaW5naWZ5KGxpbmVJdGVtc1NjaGVtYV9Gb3JtU3BlY2lmaWMpKTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBhZGRUb0Zvcm1TcGVjaWZpY0lkZW50aXR5Q3JpdGVyaWEoaWRlbnRpdHlDcml0ZXJpYTogYW55LCByZXE6IGFueSwgcmVzOiBhbnkpOiBvYmplY3Qge1xyXG4gICAgcmV0dXJuIGlkZW50aXR5Q3JpdGVyaWE7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjb25maXJtQ2FuVGFrZUlkZW50aXR5RnJvbVByaW9yTG9kZ21lbnQoRm9ybVR5cGVNdW5nOiBzdHJpbmcsIHJlcTogYW55LCBmb3VuZEZvcm06IGFueSwgcmVzOiBhbnkpOiBhbnkge1xyXG4gICAgLy9iZWNhdXNlIHdlIGZvdW5kIGEgbWF0Y2hlZCBmb3JtIGZvciBjb3JyZXNwb25kaW5nIGRldGFpbHMsIHdlIGNhbiBtYWtlIHRoaXMgZm9ybSBtYXRjaGVkXHJcbiAgICBpZiAocmVxLmJvZHkuQ2xpZW50SW50ZXJuYWxJZCAmJiByZXEuYm9keS5DbGllbnRJbnRlcm5hbElkID4gMClcclxuICAgICAgICByZXEuYm9keS5zdWJqZWN0Q2xpZW50Lk1hdGNoaW5nU3RhdHVzID0gXCJNYXRjaGVkXCI7XHJcbiAgICBlbHNlXHJcbiAgICAgICAgcmVxLmJvZHkuc3ViamVjdENsaWVudC5NYXRjaGluZ1N0YXR1cyA9IFwiVW5NYXRjaGVkXCI7XHJcblxyXG4gICAgbXlMb2cuZGVidWcoYENsaWVudCBJbnRlcm5hbCBJZCAke0pTT04uc3RyaW5naWZ5KHJlcS5ib2R5LkNsaWVudEludGVybmFsSWQpfWApO1xyXG4gICAgcmV0dXJuIHJlcTtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBvc3RQdXRQcmVSZXR1cm5Ib29rKGZvcm1UeXBlTXVuZzogc3RyaW5nLCByZXE6IGFueSwgcmVzOiBhbnkpIHtcclxuICAgIG15TG9nLmRlYnVnKFwiV2lsbCBkbyBmb3JtIHNwZWNpZmljIGZpZGRsaW5nIGhlcmVcIik7XHJcbiAgICByZXR1cm47XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWNpZGVXaGF0VG9QdXRJblByZWZpbGwoZm9ybVR5cGVNdW5nOiBzdHJpbmcsIHJlcTogYW55LCByZXM6IGFueSkge1xyXG4gICAgbXlMb2cuZGVidWcoXCJXaWxsIGRvIGZvcm0gc3BlY2lmaWMgcmVwbGlhdGlvbiBoZXJlXCIpO1xyXG4gICAgcmV0dXJuO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYnVsa1RyYW5zbWlzc2lvblRyYWNraW5nKGZvcm1UeXBlTXVuZzogc3RyaW5nLCByZXE6IGFueSwgcmVzOiBhbnksIG1lYW5pbmdmdWxOYW1lRm9ybTogYW55KTogUHJvbWlzZTx7IGxvb2t1cEZpbHRlcjogYW55LCB1cHNlcnRCb2R5OiBhbnksIHNjaGVtYTphbnkgIH0gfCBudWxsPiB7XHJcbiAgICByZXR1cm4gbnVsbDtcclxufSJdfQ==
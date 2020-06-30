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
exports.FormType = 'myFT6', exports.businessRulesLanguage = "", exports.wireFormat = "";
exports.lineItemsSchema_FormSpecific = {}, exports.formMetaDataById = {}, exports.formMetaDataByName = {};
myLog.debug("Additional " + exports.FormType + " line items schema definition " + JSON.stringify(exports.lineItemsSchema_FormSpecific));
function addToFormSpecificIdentityCriteria(identityCriteria, req, res) {
    const payeeDetails = req.body.Sections.find((s) => s.SectionId == "1");
    if (!payeeDetails) {
        req.subjectClient.MatchingStatus = "UnMatched";
        return {};
    }
    const familyName = payeeDetails.LineItems.find((l) => l.FieldId == "1").Value;
    const firstName = payeeDetails.LineItems.find((l) => l.FieldId == "2").Value;
    identityCriteria.Sections = {
        $elemMatch: {
            "SectionId": "1",
            "LineItems": {
                $all: [{ $elemMatch: { "Value": familyName, "FieldId": "1" } },
                    { $elemMatch: { "Value": firstName, "FieldId": "2" } }]
            }
        }
    };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVW5pcXVlRm9ybVJ1bGVzX215RlQ2Rm9ybS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlVuaXF1ZUZvcm1SdWxlc19teUZUNkZvcm0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsc0RBQXdDO0FBQzNCLFFBQUEsWUFBWSxHQUFHLEVBQUUsQ0FBQztBQUNsQixRQUFBLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDYixRQUFBLFFBQVEsR0FBRyxPQUFPLEVBQUUsUUFBQSxxQkFBcUIsR0FBRyxFQUFFLEVBQUUsUUFBQSxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBRWhFLFFBQUEsNEJBQTRCLEdBQUcsRUFBRSxFQUFFLFFBQUEsZ0JBQWdCLEdBQUcsRUFBRSxFQUFFLFFBQUEsa0JBQWtCLEdBQUcsRUFBRSxDQUFDO0FBRS9GLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxHQUFHLGdCQUFRLEdBQUcsZ0NBQWdDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQ0FBNEIsQ0FBQyxDQUFDLENBQUM7QUFFeEgsU0FBZ0IsaUNBQWlDLENBQUMsZ0JBQXFCLEVBQUUsR0FBUSxFQUFFLEdBQVE7SUFDdkYsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0lBQzVFLElBQUksQ0FBQyxZQUFZLEVBQUU7UUFDZixHQUFHLENBQUMsYUFBYSxDQUFDLGNBQWMsR0FBRyxXQUFXLENBQUM7UUFDL0MsT0FBTyxFQUFFLENBQUM7S0FDYjtJQUNELE1BQU0sVUFBVSxHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUNuRixNQUFNLFNBQVMsR0FBRyxZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFFbEYsZ0JBQWdCLENBQUMsUUFBUSxHQUFHO1FBQ3hCLFVBQVUsRUFDVjtZQUNJLFdBQVcsRUFBRSxHQUFHO1lBQ2hCLFdBQVcsRUFBRTtnQkFDVCxJQUFJLEVBQ0EsQ0FBQyxFQUFFLFVBQVUsRUFBRSxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxFQUFFO29CQUN4RCxFQUFFLFVBQVUsRUFBRSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7YUFDOUQ7U0FDSjtLQUNKLENBQUM7SUFDRixPQUFPLGdCQUFnQixDQUFDO0FBQzVCLENBQUM7QUFyQkQsOEVBcUJDO0FBRUQsU0FBZ0IsdUNBQXVDLENBQUMsWUFBb0IsRUFBRSxHQUFRLEVBQUUsU0FBYyxFQUFFLEdBQVE7SUFDNUcsMEZBQTBGO0lBQzFGLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLENBQUM7UUFDMUQsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxHQUFHLFNBQVMsQ0FBQzs7UUFFbEQsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxHQUFHLFdBQVcsQ0FBQztJQUV4RCxLQUFLLENBQUMsS0FBSyxDQUFDLHNCQUFzQixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDL0UsT0FBTyxHQUFHLENBQUM7QUFDZixDQUFDO0FBVEQsMEZBU0M7QUFFRCxTQUFzQixvQkFBb0IsQ0FBQyxZQUFvQixFQUFFLEdBQVEsRUFBRSxHQUFROztRQUMvRSxLQUFLLENBQUMsS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7UUFDbkQsT0FBTztJQUNYLENBQUM7Q0FBQTtBQUhELG9EQUdDO0FBRUQsU0FBc0Isd0JBQXdCLENBQUMsWUFBb0IsRUFBRSxHQUFRLEVBQUUsR0FBUTs7UUFDbkYsS0FBSyxDQUFDLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO1FBQ3JELE9BQU87SUFDWCxDQUFDO0NBQUE7QUFIRCw0REFHQztBQUVELFNBQXNCLHdCQUF3QixDQUFDLFlBQW9CLEVBQUUsR0FBUSxFQUFFLEdBQVEsRUFBRSxrQkFBdUI7O1FBQzVHLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7Q0FBQTtBQUZELDREQUVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgbXlMb2cgZnJvbSAnLi4vLi4vLi4vbXlMb2cnO1xyXG5leHBvcnQgY29uc3QgZm9ybU1ldGFEYXRhID0ge307XHJcbmV4cG9ydCBjb25zdCBmb3JtRGVmID0ge307XHJcbmV4cG9ydCBjb25zdCBGb3JtVHlwZSA9ICdteUZUNicsIGJ1c2luZXNzUnVsZXNMYW5ndWFnZSA9IFwiXCIsIHdpcmVGb3JtYXQgPSBcIlwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IGxpbmVJdGVtc1NjaGVtYV9Gb3JtU3BlY2lmaWMgPSB7fSwgZm9ybU1ldGFEYXRhQnlJZCA9IHt9LCBmb3JtTWV0YURhdGFCeU5hbWUgPSB7fTtcclxuXHJcbm15TG9nLmRlYnVnKFwiQWRkaXRpb25hbCBcIiArIEZvcm1UeXBlICsgXCIgbGluZSBpdGVtcyBzY2hlbWEgZGVmaW5pdGlvbiBcIiArIEpTT04uc3RyaW5naWZ5KGxpbmVJdGVtc1NjaGVtYV9Gb3JtU3BlY2lmaWMpKTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBhZGRUb0Zvcm1TcGVjaWZpY0lkZW50aXR5Q3JpdGVyaWEoaWRlbnRpdHlDcml0ZXJpYTogYW55LCByZXE6IGFueSwgcmVzOiBhbnkpOiBvYmplY3Qge1xyXG4gICAgY29uc3QgcGF5ZWVEZXRhaWxzID0gcmVxLmJvZHkuU2VjdGlvbnMuZmluZCgoczogYW55KSA9PiBzLlNlY3Rpb25JZCA9PSBcIjFcIik7XHJcbiAgICBpZiAoIXBheWVlRGV0YWlscykge1xyXG4gICAgICAgIHJlcS5zdWJqZWN0Q2xpZW50Lk1hdGNoaW5nU3RhdHVzID0gXCJVbk1hdGNoZWRcIjtcclxuICAgICAgICByZXR1cm4ge307XHJcbiAgICB9XHJcbiAgICBjb25zdCBmYW1pbHlOYW1lID0gcGF5ZWVEZXRhaWxzLkxpbmVJdGVtcy5maW5kKChsOiBhbnkpID0+IGwuRmllbGRJZCA9PSBcIjFcIikuVmFsdWU7XHJcbiAgICBjb25zdCBmaXJzdE5hbWUgPSBwYXllZURldGFpbHMuTGluZUl0ZW1zLmZpbmQoKGw6IGFueSkgPT4gbC5GaWVsZElkID09IFwiMlwiKS5WYWx1ZTtcclxuXHJcbiAgICBpZGVudGl0eUNyaXRlcmlhLlNlY3Rpb25zID0ge1xyXG4gICAgICAgICRlbGVtTWF0Y2g6XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBcIlNlY3Rpb25JZFwiOiBcIjFcIixcclxuICAgICAgICAgICAgXCJMaW5lSXRlbXNcIjoge1xyXG4gICAgICAgICAgICAgICAgJGFsbDpcclxuICAgICAgICAgICAgICAgICAgICBbeyAkZWxlbU1hdGNoOiB7IFwiVmFsdWVcIjogZmFtaWx5TmFtZSwgXCJGaWVsZElkXCI6IFwiMVwiIH0gfSxcclxuICAgICAgICAgICAgICAgICAgICB7ICRlbGVtTWF0Y2g6IHsgXCJWYWx1ZVwiOiBmaXJzdE5hbWUsIFwiRmllbGRJZFwiOiBcIjJcIiB9IH1dXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIGlkZW50aXR5Q3JpdGVyaWE7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjb25maXJtQ2FuVGFrZUlkZW50aXR5RnJvbVByaW9yTG9kZ21lbnQoRm9ybVR5cGVNdW5nOiBzdHJpbmcsIHJlcTogYW55LCBmb3VuZEZvcm06IGFueSwgcmVzOiBhbnkpOiBhbnkge1xyXG4gICAgLy9iZWNhdXNlIHdlIGZvdW5kIGEgbWF0Y2hlZCBmb3JtIGZvciBjb3JyZXNwb25kaW5nIGRldGFpbHMsIHdlIGNhbiBtYWtlIHRoaXMgZm9ybSBtYXRjaGVkXHJcbiAgICBpZiAocmVxLmJvZHkuQ2xpZW50SW50ZXJuYWxJZCAmJiByZXEuYm9keS5DbGllbnRJbnRlcm5hbElkID4gMClcclxuICAgICAgICByZXEuYm9keS5zdWJqZWN0Q2xpZW50Lk1hdGNoaW5nU3RhdHVzID0gXCJNYXRjaGVkXCI7XHJcbiAgICBlbHNlXHJcbiAgICAgICAgcmVxLmJvZHkuc3ViamVjdENsaWVudC5NYXRjaGluZ1N0YXR1cyA9IFwiVW5NYXRjaGVkXCI7XHJcblxyXG4gICAgbXlMb2cuZGVidWcoYENsaWVudCBJbnRlcm5hbCBJZCAke0pTT04uc3RyaW5naWZ5KHJlcS5ib2R5LkNsaWVudEludGVybmFsSWQpfWApO1xyXG4gICAgcmV0dXJuIHJlcTtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBvc3RQdXRQcmVSZXR1cm5Ib29rKGZvcm1UeXBlTXVuZzogc3RyaW5nLCByZXE6IGFueSwgcmVzOiBhbnkpIHtcclxuICAgIG15TG9nLmRlYnVnKFwiV2lsbCBkbyBmb3JtIHNwZWNpZmljIGZpZGRsaW5nIGhlcmVcIik7XHJcbiAgICByZXR1cm47XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWNpZGVXaGF0VG9QdXRJblByZWZpbGwoZm9ybVR5cGVNdW5nOiBzdHJpbmcsIHJlcTogYW55LCByZXM6IGFueSkge1xyXG4gICAgbXlMb2cuZGVidWcoXCJXaWxsIGRvIGZvcm0gc3BlY2lmaWMgcmVwbGlhdGlvbiBoZXJlXCIpO1xyXG4gICAgcmV0dXJuO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYnVsa1RyYW5zbWlzc2lvblRyYWNraW5nKGZvcm1UeXBlTXVuZzogc3RyaW5nLCByZXE6IGFueSwgcmVzOiBhbnksIG1lYW5pbmdmdWxOYW1lRm9ybTogYW55KTogUHJvbWlzZTx7IGxvb2t1cEZpbHRlcjogYW55LCB1cHNlcnRCb2R5OiBhbnksIHNjaGVtYTphbnkgIH0gfCBudWxsPiB7XHJcbiAgICByZXR1cm4gbnVsbDtcclxufSJdfQ==
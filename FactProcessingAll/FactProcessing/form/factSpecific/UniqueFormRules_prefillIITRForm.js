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
exports.FormType = 'prefillIITR', exports.businessRulesLanguage = "", exports.wireFormat = "";
;
exports.lineItemsSchema_FormSpecific = {}, exports.formMetaDataById = {}, exports.formMetaDataByName = {};
myLog.debug("Additional " + exports.FormType + " line items schema definition " + JSON.stringify(exports.lineItemsSchema_FormSpecific));
function addToFormSpecificIdentityCriteria(identityCriteria, req, res) {
    return identityCriteria;
}
exports.addToFormSpecificIdentityCriteria = addToFormSpecificIdentityCriteria;
function confirmCanTakeIdentityFromPriorLodgment(FormTypeMung, req, foundForm, res) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVW5pcXVlRm9ybVJ1bGVzX3ByZWZpbGxJSVRSRm9ybS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlVuaXF1ZUZvcm1SdWxlc19wcmVmaWxsSUlUUkZvcm0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsc0RBQXdDO0FBQzNCLFFBQUEsWUFBWSxHQUFHLEVBQUUsQ0FBQztBQUNsQixRQUFBLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDYixRQUFBLFFBQVEsR0FBRyxhQUFhLEVBQUUsUUFBQSxxQkFBcUIsR0FBRyxFQUFFLEVBQUUsUUFBQSxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBQUEsQ0FBQztBQUV2RSxRQUFBLDRCQUE0QixHQUFHLEVBQUUsRUFBRSxRQUFBLGdCQUFnQixHQUFHLEVBQUUsRUFBRSxRQUFBLGtCQUFrQixHQUFHLEVBQUUsQ0FBQztBQUUvRixLQUFLLENBQUMsS0FBSyxDQUFDLGFBQWEsR0FBRyxnQkFBUSxHQUFHLGdDQUFnQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsb0NBQTRCLENBQUMsQ0FBQyxDQUFDO0FBRXhILFNBQWdCLGlDQUFpQyxDQUFDLGdCQUFxQixFQUFFLEdBQVEsRUFBRSxHQUFRO0lBQ3ZGLE9BQU8sZ0JBQWdCLENBQUM7QUFDNUIsQ0FBQztBQUZELDhFQUVDO0FBRUQsU0FBZ0IsdUNBQXVDLENBQUMsWUFBb0IsRUFBRSxHQUFRLEVBQUUsU0FBYyxFQUFFLEdBQVE7SUFDNUcsT0FBTyxHQUFHLENBQUM7QUFDZixDQUFDO0FBRkQsMEZBRUM7QUFFRCxTQUFzQixvQkFBb0IsQ0FBQyxZQUFvQixFQUFFLEdBQVEsRUFBRSxHQUFROztRQUMvRSxLQUFLLENBQUMsS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7UUFDbkQsT0FBTztJQUNYLENBQUM7Q0FBQTtBQUhELG9EQUdDO0FBRUQsU0FBc0Isd0JBQXdCLENBQUMsWUFBb0IsRUFBRSxHQUFRLEVBQUUsR0FBUTs7UUFDbkYsS0FBSyxDQUFDLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO1FBQ3JELE9BQU87SUFDWCxDQUFDO0NBQUE7QUFIRCw0REFHQztBQUVELFNBQXNCLHdCQUF3QixDQUFDLFlBQW9CLEVBQUUsR0FBUSxFQUFFLEdBQVEsRUFBRSxrQkFBdUI7O1FBQzVHLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7Q0FBQTtBQUZELDREQUVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgbXlMb2cgZnJvbSAnLi4vLi4vLi4vbXlMb2cnO1xyXG5leHBvcnQgY29uc3QgZm9ybU1ldGFEYXRhID0ge307XHJcbmV4cG9ydCBjb25zdCBmb3JtRGVmID0ge307XHJcbmV4cG9ydCBjb25zdCBGb3JtVHlwZSA9ICdwcmVmaWxsSUlUUicsIGJ1c2luZXNzUnVsZXNMYW5ndWFnZSA9IFwiXCIsIHdpcmVGb3JtYXQgPSBcIlwiOztcclxuXHJcbmV4cG9ydCBjb25zdCBsaW5lSXRlbXNTY2hlbWFfRm9ybVNwZWNpZmljID0ge30sIGZvcm1NZXRhRGF0YUJ5SWQgPSB7fSwgZm9ybU1ldGFEYXRhQnlOYW1lID0ge307XHJcblxyXG5teUxvZy5kZWJ1ZyhcIkFkZGl0aW9uYWwgXCIgKyBGb3JtVHlwZSArIFwiIGxpbmUgaXRlbXMgc2NoZW1hIGRlZmluaXRpb24gXCIgKyBKU09OLnN0cmluZ2lmeShsaW5lSXRlbXNTY2hlbWFfRm9ybVNwZWNpZmljKSk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gYWRkVG9Gb3JtU3BlY2lmaWNJZGVudGl0eUNyaXRlcmlhKGlkZW50aXR5Q3JpdGVyaWE6IGFueSwgcmVxOiBhbnksIHJlczogYW55KTogb2JqZWN0IHtcclxuICAgIHJldHVybiBpZGVudGl0eUNyaXRlcmlhO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY29uZmlybUNhblRha2VJZGVudGl0eUZyb21QcmlvckxvZGdtZW50KEZvcm1UeXBlTXVuZzogc3RyaW5nLCByZXE6IGFueSwgZm91bmRGb3JtOiBhbnksIHJlczogYW55KTogYW55IHtcclxuICAgIHJldHVybiByZXE7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwb3N0UHV0UHJlUmV0dXJuSG9vayhmb3JtVHlwZU11bmc6IHN0cmluZywgcmVxOiBhbnksIHJlczogYW55KSB7XHJcbiAgICBteUxvZy5kZWJ1ZyhcIldpbGwgZG8gZm9ybSBzcGVjaWZpYyBmaWRkbGluZyBoZXJlXCIpO1xyXG4gICAgcmV0dXJuO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVjaWRlV2hhdFRvUHV0SW5QcmVmaWxsKGZvcm1UeXBlTXVuZzogc3RyaW5nLCByZXE6IGFueSwgcmVzOiBhbnkpIHtcclxuICAgIG15TG9nLmRlYnVnKFwiV2lsbCBkbyBmb3JtIHNwZWNpZmljIHJlcGxpYXRpb24gaGVyZVwiKTtcclxuICAgIHJldHVybjtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJ1bGtUcmFuc21pc3Npb25UcmFja2luZyhmb3JtVHlwZU11bmc6IHN0cmluZywgcmVxOiBhbnksIHJlczogYW55LCBtZWFuaW5nZnVsTmFtZUZvcm06IGFueSk6IFByb21pc2U8eyBsb29rdXBGaWx0ZXI6IGFueSwgdXBzZXJ0Qm9keTogYW55LCBzY2hlbWE6YW55ICB9IHwgbnVsbD4ge1xyXG4gICAgcmV0dXJuIG51bGw7XHJcbn0iXX0=
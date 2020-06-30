"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const myLog = __importStar(require("../../myLog"));
myLog.debug("Need to implement secure coding checks");
//this module checks the input form is reasonably clean, no XSS/ SQL Injections
//- it does this by applying regEx expressions to any string form line items to check it doesn't contain unsavory characters or strings
//
exports.doCleanInputCheck = function (req, res, next) {
    myLog.debug('Checking that body is squeaky cleana');
    // let result: boolean = false;
    // var frm: string = req.body.FormTypeMung;
    // req.body.Sections.forEach((section:any) => {
    //     section.LineItems.forEach((lineItem:any) => {
    //         const reString: string = regExs[frm][<number>section.SectionId][<number>lineItem.FieldId];
    //         if (reString) {
    //             result = new RegExp(reString).test(<string> lineItem.FieldValue);
    //             if (!result) 
    //                 next(new Error("Invalid input in field" + section.SectionId + " " + lineItem.FieldId));
    //         }
    //     })
    // });
    next();
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9TZWN1cmVDb2RpbmdDaGVja3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkb1NlY3VyZUNvZGluZ0NoZWNrcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxtREFBcUM7QUFDckMsS0FBSyxDQUFDLEtBQUssQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO0FBS3RELCtFQUErRTtBQUMvRSx1SUFBdUk7QUFDdkksRUFBRTtBQUNXLFFBQUEsaUJBQWlCLEdBQUcsVUFBVSxHQUFvQixFQUFFLEdBQXFCLEVBQUUsSUFBMEI7SUFDOUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO0lBQ3BELCtCQUErQjtJQUMvQiwyQ0FBMkM7SUFDM0MsK0NBQStDO0lBQy9DLG9EQUFvRDtJQUNwRCxxR0FBcUc7SUFDckcsMEJBQTBCO0lBQzFCLGdGQUFnRjtJQUNoRiw0QkFBNEI7SUFDNUIsMEdBQTBHO0lBQzFHLFlBQVk7SUFDWixTQUFTO0lBQ1QsTUFBTTtJQUNOLElBQUksRUFBRSxDQUFDO0FBQ1gsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgbXlMb2cgZnJvbSAnLi4vLi4vbXlMb2cnO1xyXG5teUxvZy5kZWJ1ZyhcIk5lZWQgdG8gaW1wbGVtZW50IHNlY3VyZSBjb2RpbmcgY2hlY2tzXCIpO1xyXG5cclxuaW1wb3J0ICogYXMgZXhwcmVzcyBmcm9tICdleHByZXNzJztcclxuaW1wb3J0IHtyZWdFeHN9IGZyb20gJy4vc2VjdXJlQ29kaW5nUmVnRXhlcyc7XHJcblxyXG4vL3RoaXMgbW9kdWxlIGNoZWNrcyB0aGUgaW5wdXQgZm9ybSBpcyByZWFzb25hYmx5IGNsZWFuLCBubyBYU1MvIFNRTCBJbmplY3Rpb25zXHJcbi8vLSBpdCBkb2VzIHRoaXMgYnkgYXBwbHlpbmcgcmVnRXggZXhwcmVzc2lvbnMgdG8gYW55IHN0cmluZyBmb3JtIGxpbmUgaXRlbXMgdG8gY2hlY2sgaXQgZG9lc24ndCBjb250YWluIHVuc2F2b3J5IGNoYXJhY3RlcnMgb3Igc3RyaW5nc1xyXG4vL1xyXG5leHBvcnQgY29uc3QgZG9DbGVhbklucHV0Q2hlY2sgPSBmdW5jdGlvbiAocmVxOiBleHByZXNzLlJlcXVlc3QsIHJlczogZXhwcmVzcy5SZXNwb25zZSwgbmV4dDogZXhwcmVzcy5OZXh0RnVuY3Rpb24pIHtcclxuICAgIG15TG9nLmRlYnVnKCdDaGVja2luZyB0aGF0IGJvZHkgaXMgc3F1ZWFreSBjbGVhbmEnKTtcclxuICAgIC8vIGxldCByZXN1bHQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIC8vIHZhciBmcm06IHN0cmluZyA9IHJlcS5ib2R5LkZvcm1UeXBlTXVuZztcclxuICAgIC8vIHJlcS5ib2R5LlNlY3Rpb25zLmZvckVhY2goKHNlY3Rpb246YW55KSA9PiB7XHJcbiAgICAvLyAgICAgc2VjdGlvbi5MaW5lSXRlbXMuZm9yRWFjaCgobGluZUl0ZW06YW55KSA9PiB7XHJcbiAgICAvLyAgICAgICAgIGNvbnN0IHJlU3RyaW5nOiBzdHJpbmcgPSByZWdFeHNbZnJtXVs8bnVtYmVyPnNlY3Rpb24uU2VjdGlvbklkXVs8bnVtYmVyPmxpbmVJdGVtLkZpZWxkSWRdO1xyXG4gICAgLy8gICAgICAgICBpZiAocmVTdHJpbmcpIHtcclxuICAgIC8vICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBSZWdFeHAocmVTdHJpbmcpLnRlc3QoPHN0cmluZz4gbGluZUl0ZW0uRmllbGRWYWx1ZSk7XHJcbiAgICAvLyAgICAgICAgICAgICBpZiAoIXJlc3VsdCkgXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgbmV4dChuZXcgRXJyb3IoXCJJbnZhbGlkIGlucHV0IGluIGZpZWxkXCIgKyBzZWN0aW9uLlNlY3Rpb25JZCArIFwiIFwiICsgbGluZUl0ZW0uRmllbGRJZCkpO1xyXG4gICAgLy8gICAgICAgICB9XHJcbiAgICAvLyAgICAgfSlcclxuICAgIC8vIH0pO1xyXG4gICAgbmV4dCgpO1xyXG59OyJdfQ==
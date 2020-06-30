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
myLog.debug("Inside mockcheckAuthentication");
let baseCheckAuthentication; //I wonder if I can turn NodeModule;
exports.base = function (_baseCheckAuthentication) {
    baseCheckAuthentication = _baseCheckAuthentication;
    return exports.checkAuthentication;
};
exports.checkAuthentication = function (req, res, next) {
    let atoIDPAccessToken = {
        clientInternalId: 1234,
        clientExternalIdentifier: {
            type: 'ABN',
            value: '1234567890'
        }
    };
    req.headers['atoIdpAccessToken'] = JSON.stringify(atoIDPAccessToken);
    baseCheckAuthentication(req, res, next);
    //next is called by parent.
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja0NoZWNrQXV0aGVudGljYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJtb2NrQ2hlY2tBdXRoZW50aWNhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxtREFBcUM7QUFFckMsS0FBSyxDQUFDLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0FBQzlDLElBQUksdUJBQTRCLENBQUMsQ0FBQyxvQ0FBb0M7QUFFekQsUUFBQSxJQUFJLEdBQUcsVUFBVSx3QkFBNkI7SUFDdkQsdUJBQXVCLEdBQUcsd0JBQXdCLENBQUM7SUFDbkQsT0FBTywyQkFBbUIsQ0FBQztBQUMvQixDQUFDLENBQUE7QUFFWSxRQUFBLG1CQUFtQixHQUFHLFVBQVUsR0FBb0IsRUFBRSxHQUFxQixFQUFFLElBQTBCO0lBQ2hILElBQUksaUJBQWlCLEdBQUc7UUFDcEIsZ0JBQWdCLEVBQUUsSUFBSTtRQUN0Qix3QkFBd0IsRUFBRTtZQUN0QixJQUFJLEVBQUUsS0FBSztZQUNYLEtBQUssRUFBRSxZQUFZO1NBQ3RCO0tBQ0osQ0FBQTtJQUVELEdBQUcsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFFckUsdUJBQXVCLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN4QywyQkFBMkI7QUFDL0IsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgbXlMb2cgZnJvbSAnLi4vLi4vbXlMb2cnO1xyXG5pbXBvcnQgKiBhcyBleHByZXNzIGZyb20gJ2V4cHJlc3MnO1xyXG5teUxvZy5kZWJ1ZyhcIkluc2lkZSBtb2NrY2hlY2tBdXRoZW50aWNhdGlvblwiKTtcclxubGV0IGJhc2VDaGVja0F1dGhlbnRpY2F0aW9uOiBhbnk7IC8vSSB3b25kZXIgaWYgSSBjYW4gdHVybiBOb2RlTW9kdWxlO1xyXG5cclxuZXhwb3J0IGNvbnN0IGJhc2UgPSBmdW5jdGlvbiAoX2Jhc2VDaGVja0F1dGhlbnRpY2F0aW9uOiBhbnkpOmFueSB7XHJcbiAgICBiYXNlQ2hlY2tBdXRoZW50aWNhdGlvbiA9IF9iYXNlQ2hlY2tBdXRoZW50aWNhdGlvbjtcclxuICAgIHJldHVybiBjaGVja0F1dGhlbnRpY2F0aW9uO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgY2hlY2tBdXRoZW50aWNhdGlvbiA9IGZ1bmN0aW9uIChyZXE6IGV4cHJlc3MuUmVxdWVzdCwgcmVzOiBleHByZXNzLlJlc3BvbnNlLCBuZXh0OiBleHByZXNzLk5leHRGdW5jdGlvbikge1xyXG4gICAgbGV0IGF0b0lEUEFjY2Vzc1Rva2VuID0ge1xyXG4gICAgICAgIGNsaWVudEludGVybmFsSWQ6IDEyMzQsXHJcbiAgICAgICAgY2xpZW50RXh0ZXJuYWxJZGVudGlmaWVyOiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdBQk4nLFxyXG4gICAgICAgICAgICB2YWx1ZTogJzEyMzQ1Njc4OTAnXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlcS5oZWFkZXJzWydhdG9JZHBBY2Nlc3NUb2tlbiddID0gSlNPTi5zdHJpbmdpZnkoYXRvSURQQWNjZXNzVG9rZW4pO1xyXG5cclxuICAgIGJhc2VDaGVja0F1dGhlbnRpY2F0aW9uKHJlcSwgcmVzLCBuZXh0KTtcclxuICAgIC8vbmV4dCBpcyBjYWxsZWQgYnkgcGFyZW50LlxyXG59OyJdfQ==
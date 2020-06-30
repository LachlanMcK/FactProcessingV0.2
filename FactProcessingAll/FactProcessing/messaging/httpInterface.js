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
const bulkProcessControl_1 = require("./bulkProcessControl");
const reqPromise = require('request-promise-native');
//todo: suspsect request-promise-native is depricated so investigate alternative, https://github.com/request/request/issues/3143, e.g. https://www.npmjs.com/package/node-fetch
function httpInterface(BI, IC, protocol = 'http', hostName = 'ato.gov.au', localPort = 3000, headers, method, url, body) {
    return __awaiter(this, void 0, void 0, function* () {
        //reqPromise.debug = true;
        bulkProcessControl_1.incrementBPCCount(BI + '.' + IC, url, body);
        try {
            let endpointDetails = { resolveWithFullResponse: true }; //by default request-promise-native just returns the body
            endpointDetails.url = protocol + "://" + hostName + ":" + localPort + url;
            endpointDetails.headers = headers;
            delete endpointDetails.headers["content-length"];
            endpointDetails.method = method;
            if (method == 'PUT') {
                endpointDetails.body = body;
                endpointDetails.json = true;
            }
            myLog.debug("httpInterface - about to out of process call to: " + endpointDetails.url);
            myLog.debug("   headers: " + JSON.stringify(endpointDetails.headers));
            myLog.debug("   method: " + endpointDetails.method);
            myLog.debug("   body (start): " + JSON.stringify(endpointDetails.body || {}).substr(0, 80));
            let response = yield reqPromise(endpointDetails);
            myLog.debug("httpInterface - response status code:" + response.statusCode);
            myLog.log(response);
            return response;
        }
        catch (error) {
            if (!(error.statusCode == 404 || error.statusCode == 304 || error.statusCode == 409 || error.statusCode == 500))
                myLog.error('In httpInterface.ts/ httpInterface, encountered unexpected error: ', error);
            return error.response;
        }
    });
}
exports.httpInterface = httpInterface;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cEludGVyZmFjZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImh0dHBJbnRlcmZhY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbURBQXFDO0FBRXJDLDZEQUF1RDtBQUV2RCxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUNyRCwrS0FBK0s7QUFFL0ssU0FBc0IsYUFBYSxDQUFDLEVBQVUsRUFBRSxFQUFVLEVBQUUsV0FBbUIsTUFBTSxFQUFFLFdBQW1CLFlBQVksRUFBRSxZQUFvQixJQUFJLEVBQUUsT0FBNEIsRUFBRSxNQUFjLEVBQUUsR0FBVyxFQUFFLElBQWE7O1FBQ3ROLDBCQUEwQjtRQUUxQixzQ0FBaUIsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFNUMsSUFBSTtZQUNBLElBQUksZUFBZSxHQUFRLEVBQUUsdUJBQXVCLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyx5REFBeUQ7WUFDdkgsZUFBZSxDQUFDLEdBQUcsR0FBRyxRQUFRLEdBQUcsS0FBSyxHQUFHLFFBQVEsR0FBRyxHQUFHLEdBQUcsU0FBUyxHQUFHLEdBQUcsQ0FBQztZQUMxRSxlQUFlLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztZQUNsQyxPQUFPLGVBQWUsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUNqRCxlQUFlLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtZQUMvQixJQUFJLE1BQU0sSUFBSSxLQUFLLEVBQUU7Z0JBQ2pCLGVBQWUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO2dCQUM1QixlQUFlLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQzthQUMvQjtZQUVELEtBQUssQ0FBQyxLQUFLLENBQUMsbURBQW1ELEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZGLEtBQUssQ0FBQyxLQUFLLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDdEUsS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUFhLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3BELEtBQUssQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUU1RixJQUFJLFFBQVEsR0FBRyxNQUFNLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNqRCxLQUFLLENBQUMsS0FBSyxDQUFDLHVDQUF1QyxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUMzRSxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3BCLE9BQU8sUUFBUSxDQUFDO1NBQ25CO1FBQ0QsT0FBTyxLQUFLLEVBQUU7WUFDVixJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsVUFBVSxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsVUFBVSxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsVUFBVSxJQUFJLEdBQUcsQ0FBQztnQkFDM0csS0FBSyxDQUFDLEtBQUssQ0FBQyxvRUFBb0UsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM3RixPQUFPLEtBQUssQ0FBQyxRQUFRLENBQUM7U0FDekI7SUFDTCxDQUFDO0NBQUE7QUEvQkQsc0NBK0JDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgbXlMb2cgZnJvbSAnLi4vLi4vbXlMb2cnO1xyXG5pbXBvcnQgeyBJbmNvbWluZ0h0dHBIZWFkZXJzIH0gZnJvbSAnaHR0cCdcclxuaW1wb3J0IHtpbmNyZW1lbnRCUENDb3VudH0gZnJvbSAnLi9idWxrUHJvY2Vzc0NvbnRyb2wnO1xyXG5cclxuY29uc3QgcmVxUHJvbWlzZSA9IHJlcXVpcmUoJ3JlcXVlc3QtcHJvbWlzZS1uYXRpdmUnKTtcclxuLy90b2RvOiBzdXNwc2VjdCByZXF1ZXN0LXByb21pc2UtbmF0aXZlIGlzIGRlcHJpY2F0ZWQgc28gaW52ZXN0aWdhdGUgYWx0ZXJuYXRpdmUsIGh0dHBzOi8vZ2l0aHViLmNvbS9yZXF1ZXN0L3JlcXVlc3QvaXNzdWVzLzMxNDMsIGUuZy4gaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2Uvbm9kZS1mZXRjaFxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGh0dHBJbnRlcmZhY2UoQkk6IFN0cmluZywgSUM6IFN0cmluZywgcHJvdG9jb2w6IHN0cmluZyA9ICdodHRwJywgaG9zdE5hbWU6IHN0cmluZyA9ICdhdG8uZ292LmF1JywgbG9jYWxQb3J0OiBudW1iZXIgPSAzMDAwLCBoZWFkZXJzOiBJbmNvbWluZ0h0dHBIZWFkZXJzLCBtZXRob2Q6IHN0cmluZywgdXJsOiBzdHJpbmcsIGJvZHk/OiBPYmplY3QpIHtcclxuICAgIC8vcmVxUHJvbWlzZS5kZWJ1ZyA9IHRydWU7XHJcblxyXG4gICAgaW5jcmVtZW50QlBDQ291bnQoQkkgKyAnLicgKyBJQywgdXJsLCBib2R5KTtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIGxldCBlbmRwb2ludERldGFpbHM6IGFueSA9IHsgcmVzb2x2ZVdpdGhGdWxsUmVzcG9uc2U6IHRydWUgfTsgLy9ieSBkZWZhdWx0IHJlcXVlc3QtcHJvbWlzZS1uYXRpdmUganVzdCByZXR1cm5zIHRoZSBib2R5XHJcbiAgICAgICAgZW5kcG9pbnREZXRhaWxzLnVybCA9IHByb3RvY29sICsgXCI6Ly9cIiArIGhvc3ROYW1lICsgXCI6XCIgKyBsb2NhbFBvcnQgKyB1cmw7XHJcbiAgICAgICAgZW5kcG9pbnREZXRhaWxzLmhlYWRlcnMgPSBoZWFkZXJzO1xyXG4gICAgICAgIGRlbGV0ZSBlbmRwb2ludERldGFpbHMuaGVhZGVyc1tcImNvbnRlbnQtbGVuZ3RoXCJdO1xyXG4gICAgICAgIGVuZHBvaW50RGV0YWlscy5tZXRob2QgPSBtZXRob2RcclxuICAgICAgICBpZiAobWV0aG9kID09ICdQVVQnKSB7XHJcbiAgICAgICAgICAgIGVuZHBvaW50RGV0YWlscy5ib2R5ID0gYm9keTtcclxuICAgICAgICAgICAgZW5kcG9pbnREZXRhaWxzLmpzb24gPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbXlMb2cuZGVidWcoXCJodHRwSW50ZXJmYWNlIC0gYWJvdXQgdG8gb3V0IG9mIHByb2Nlc3MgY2FsbCB0bzogXCIgKyBlbmRwb2ludERldGFpbHMudXJsKTtcclxuICAgICAgICBteUxvZy5kZWJ1ZyhcIiAgIGhlYWRlcnM6IFwiICsgSlNPTi5zdHJpbmdpZnkoZW5kcG9pbnREZXRhaWxzLmhlYWRlcnMpKTtcclxuICAgICAgICBteUxvZy5kZWJ1ZyhcIiAgIG1ldGhvZDogXCIgKyBlbmRwb2ludERldGFpbHMubWV0aG9kKTtcclxuICAgICAgICBteUxvZy5kZWJ1ZyhcIiAgIGJvZHkgKHN0YXJ0KTogXCIgKyBKU09OLnN0cmluZ2lmeShlbmRwb2ludERldGFpbHMuYm9keSB8fCB7fSkuc3Vic3RyKDAsIDgwKSk7XHJcblxyXG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHJlcVByb21pc2UoZW5kcG9pbnREZXRhaWxzKTtcclxuICAgICAgICBteUxvZy5kZWJ1ZyhcImh0dHBJbnRlcmZhY2UgLSByZXNwb25zZSBzdGF0dXMgY29kZTpcIiArIHJlc3BvbnNlLnN0YXR1c0NvZGUpO1xyXG4gICAgICAgIG15TG9nLmxvZyhyZXNwb25zZSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgaWYgKCEoZXJyb3Iuc3RhdHVzQ29kZSA9PSA0MDQgfHwgZXJyb3Iuc3RhdHVzQ29kZSA9PSAzMDQgfHwgZXJyb3Iuc3RhdHVzQ29kZSA9PSA0MDkgfHwgZXJyb3Iuc3RhdHVzQ29kZSA9PSA1MDApKVxyXG4gICAgICAgICAgICBteUxvZy5lcnJvcignSW4gaHR0cEludGVyZmFjZS50cy8gaHR0cEludGVyZmFjZSwgZW5jb3VudGVyZWQgdW5leHBlY3RlZCBlcnJvcjogJywgZXJyb3IpO1xyXG4gICAgICAgIHJldHVybiBlcnJvci5yZXNwb25zZTtcclxuICAgIH1cclxufSJdfQ==
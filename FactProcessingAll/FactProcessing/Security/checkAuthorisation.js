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
myLog.debug("Inside checkAuthorisaitons, runtimeEnvironment: " + (process.env.runtimeEnvironment || "") + " mockAuthzModule: " + (process.env.mockAuthzModule || ""));
exports.checkAuthorisation = function (req, res, next) {
    console.log("AM goes here - checks that the security principle (user) can act on subject (identified in the URI), I assume will call existing AM MQ API");
    const user = req.params.securityPrincipleId;
    const URI = req.originalUrl;
    //make MQ call to AM passing user & URI.  AM will do:
    //-verifySubjectClientLinks check that does:
    //  - a relationship existence check between the securityPrinciple (user) & URI (which embeds both the subject client & protected resource being accessed)
    //one day this MQ call may be turned into a ReST call.
    next();
};
//Restrict mocks to coming from predetermined mock folder
//Mock will replace checkAuthentication, assume all it will do is populate atoIdpAccessToken header property
if ((process.env.runtimeEnvironment || 'unknown') !== 'PROD' && process.env.mockAuthzModule)
    exports.checkAuthorisation = require('../mocks/' + process.env.mockAuthzModule).checkAuthorisation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tBdXRob3Jpc2F0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2hlY2tBdXRob3Jpc2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLG1EQUFxQztBQUNyQyxLQUFLLENBQUMsS0FBSyxDQUFDLGtEQUFrRCxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsSUFBSSxFQUFFLENBQUMsR0FBSSxvQkFBb0IsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxJQUFJLEVBQUUsQ0FBQyxDQUFFLENBQUM7QUFJN0osUUFBQSxrQkFBa0IsR0FBRSxVQUFVLEdBQW9CLEVBQUUsR0FBcUIsRUFBRSxJQUEwQjtJQUM1RyxPQUFPLENBQUMsR0FBRyxDQUFDLDRJQUE0SSxDQUFDLENBQUM7SUFFMUosTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQztJQUM1QyxNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDO0lBRTVCLHFEQUFxRDtJQUNyRCw0Q0FBNEM7SUFDNUMsMEpBQTBKO0lBRTFKLHNEQUFzRDtJQUV0RCxJQUFJLEVBQUUsQ0FBQztBQUNYLENBQUMsQ0FBQztBQUVGLHlEQUF5RDtBQUN6RCw0R0FBNEc7QUFDNUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLElBQUksU0FBUyxDQUFDLEtBQUssTUFBTSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZTtJQUN2RiwwQkFBa0IsR0FBRyxPQUFPLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBeUIsQ0FBQyxDQUFDLGtCQUFrQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgbXlMb2cgZnJvbSAnLi4vLi4vbXlMb2cnO1xyXG5teUxvZy5kZWJ1ZyhcIkluc2lkZSBjaGVja0F1dGhvcmlzYWl0b25zLCBydW50aW1lRW52aXJvbm1lbnQ6IFwiICsgKHByb2Nlc3MuZW52LnJ1bnRpbWVFbnZpcm9ubWVudCB8fCBcIlwiKSAgKyBcIiBtb2NrQXV0aHpNb2R1bGU6IFwiICsgKHByb2Nlc3MuZW52Lm1vY2tBdXRoek1vZHVsZSB8fCBcIlwiKSApO1xyXG5cclxuaW1wb3J0ICogYXMgZXhwcmVzcyBmcm9tICdleHByZXNzJztcclxuXHJcbmV4cG9ydCB2YXIgY2hlY2tBdXRob3Jpc2F0aW9uPSBmdW5jdGlvbiAocmVxOiBleHByZXNzLlJlcXVlc3QsIHJlczogZXhwcmVzcy5SZXNwb25zZSwgbmV4dDogZXhwcmVzcy5OZXh0RnVuY3Rpb24pIHtcclxuICAgIGNvbnNvbGUubG9nKFwiQU0gZ29lcyBoZXJlIC0gY2hlY2tzIHRoYXQgdGhlIHNlY3VyaXR5IHByaW5jaXBsZSAodXNlcikgY2FuIGFjdCBvbiBzdWJqZWN0IChpZGVudGlmaWVkIGluIHRoZSBVUkkpLCBJIGFzc3VtZSB3aWxsIGNhbGwgZXhpc3RpbmcgQU0gTVEgQVBJXCIpO1xyXG5cclxuICAgIGNvbnN0IHVzZXIgPSByZXEucGFyYW1zLnNlY3VyaXR5UHJpbmNpcGxlSWQ7XHJcbiAgICBjb25zdCBVUkkgPSByZXEub3JpZ2luYWxVcmw7XHJcblxyXG4gICAgLy9tYWtlIE1RIGNhbGwgdG8gQU0gcGFzc2luZyB1c2VyICYgVVJJLiAgQU0gd2lsbCBkbzpcclxuICAgIC8vLXZlcmlmeVN1YmplY3RDbGllbnRMaW5rcyBjaGVjayB0aGF0IGRvZXM6XHJcbiAgICAvLyAgLSBhIHJlbGF0aW9uc2hpcCBleGlzdGVuY2UgY2hlY2sgYmV0d2VlbiB0aGUgc2VjdXJpdHlQcmluY2lwbGUgKHVzZXIpICYgVVJJICh3aGljaCBlbWJlZHMgYm90aCB0aGUgc3ViamVjdCBjbGllbnQgJiBwcm90ZWN0ZWQgcmVzb3VyY2UgYmVpbmcgYWNjZXNzZWQpXHJcblxyXG4gICAgLy9vbmUgZGF5IHRoaXMgTVEgY2FsbCBtYXkgYmUgdHVybmVkIGludG8gYSBSZVNUIGNhbGwuXHJcblxyXG4gICAgbmV4dCgpO1xyXG59O1xyXG5cclxuLy9SZXN0cmljdCBtb2NrcyB0byBjb21pbmcgZnJvbSBwcmVkZXRlcm1pbmVkIG1vY2sgZm9sZGVyXHJcbi8vTW9jayB3aWxsIHJlcGxhY2UgY2hlY2tBdXRoZW50aWNhdGlvbiwgYXNzdW1lIGFsbCBpdCB3aWxsIGRvIGlzIHBvcHVsYXRlIGF0b0lkcEFjY2Vzc1Rva2VuIGhlYWRlciBwcm9wZXJ0eVxyXG5pZiAoKHByb2Nlc3MuZW52LnJ1bnRpbWVFbnZpcm9ubWVudCB8fCAndW5rbm93bicpICE9PSAnUFJPRCcgJiYgcHJvY2Vzcy5lbnYubW9ja0F1dGh6TW9kdWxlKSBcclxuICAgIGNoZWNrQXV0aG9yaXNhdGlvbiA9IHJlcXVpcmUoJy4uL21vY2tzLycgKyBwcm9jZXNzLmVudi5tb2NrQXV0aHpNb2R1bGUgYXMgc3RyaW5nKS5jaGVja0F1dGhvcmlzYXRpb247Il19
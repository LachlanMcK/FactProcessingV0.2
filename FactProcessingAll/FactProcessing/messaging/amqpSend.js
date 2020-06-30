#!/usr/bin/env node
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
/**@module amqpSend - This module manages the sending of messges by AMQP protocol.  It is opinionated to implement ATO concepts like BI & IC and (todo) BPC counts.
 */
const myLog = __importStar(require("../../myLog"));
const amqpChannelOpener_1 = require("./amqpChannelOpener");
/**
 * This function sends a message (data param) via an AMQP queue (concatenation of BI & IC).  IF the channel field is null, will open the channel and assert the exchange & queue.
 * @param {string} BI   - Business Interface - Both the 'amqp exchange' and the 'prefix to the queue name' use the BI.
 * @param {string} IC   - Interface Component - the suffix to the queue (BI.IC) - may contain a period to and content after that is a Topic.
 * @param {Buffer} data - the data to send in the message.
 * @param {string} [routingKey] - Expected to be format BI.IC.Topic (but doesn't have to be).  If supplied this will be used as the queue name instead of BI.IC.
 * @param {string} [bindingPattern] - If supplied will set up a binding between the queue and exchange.  As a side-effect will also assert the queue/routing key.
 * @param {string} [messageProperties] - Allow specifying message properties, e.g persistence, corelation id, etc.
 * @returns {Channel} - Returns the channel connected to
 */
function amqpOpenChannel(BI, IC, queue = BI + "." + IC) {
    return __awaiter(this, void 0, void 0, function* () {
        exports.channel = (yield amqpChannelOpener_1.openAMQPConnection(BI, queue));
    });
}
exports.amqpOpenChannel = amqpOpenChannel;
function amqpSendMessage(BI, IC, data, routingKey, bindingPattern, messageProperties) {
    return __awaiter(this, void 0, void 0, function* () {
        messageProperties = messageProperties || {};
        messageProperties.correlationId = messageProperties.correlationId || Date.now().toString();
        messageProperties.persistent = true;
        myLog.debug(`messageProperties`, messageProperties);
        //todo: need to look up config info based on bi & ic definitions, just fudging for now
        var queue = routingKey || BI + "." + IC;
        let exchange = BI;
        if (!exports.channel)
            exports.channel = (yield amqpChannelOpener_1.openAMQPConnection(exchange, queue));
        if (!exports.channel)
            throw "AMQP Channel didn't open";
        if (bindingPattern) {
            exports.channel.assertQueue(queue); //optional in case we want to live dangrously
            yield exports.channel.bindQueue(queue, exchange, bindingPattern);
        }
        yield exports.channel.publish(exchange, queue, data, messageProperties);
        myLog.debug(` [x] sendMessage ${data.toString().substr(0, 150)} to exch:${exchange}, queue:${queue}, routingKey ${routingKey || queue}`);
        return exports.channel;
    });
}
exports.amqpSendMessage = amqpSendMessage;
;
function closeAMQPConnection(specifiedChannel) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(specifiedChannel || exports.channel))
            throw "Need to give me a channel to close";
        amqpChannelOpener_1.closeAMQPConnection(specifiedChannel || exports.channel);
        if (!specifiedChannel)
            exports.channel = null;
    });
}
exports.closeAMQPConnection = closeAMQPConnection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW1xcFNlbmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbXFwU2VuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0E7R0FDRztBQUNILG1EQUFxQztBQUNyQywyREFBc0g7QUFVdEg7Ozs7Ozs7OztHQVNHO0FBRUgsU0FBc0IsZUFBZSxDQUFDLEVBQVUsRUFBRSxFQUFVLEVBQUUsUUFBZSxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUU7O1FBQ3RGLGVBQU8sSUFBWSxNQUFNLHNDQUFrQixDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQSxDQUFDO0lBQzNELENBQUM7Q0FBQTtBQUZELDBDQUVDO0FBRUQsU0FBc0IsZUFBZSxDQUFDLEVBQVUsRUFBRSxFQUFVLEVBQUUsSUFBWSxFQUFFLFVBQW1CLEVBQUUsY0FBdUIsRUFBRSxpQkFBdUI7O1FBQzdJLGlCQUFpQixHQUFHLGlCQUFpQixJQUFJLEVBQUUsQ0FBQztRQUM1QyxpQkFBaUIsQ0FBQyxhQUFhLEdBQUcsaUJBQWlCLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUMzRixpQkFBaUIsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQ3BDLEtBQUssQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEVBQUUsaUJBQWlCLENBQUMsQ0FBQTtRQUVuRCxzRkFBc0Y7UUFDdEYsSUFBSSxLQUFLLEdBQUcsVUFBVSxJQUFJLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ3hDLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUNsQixJQUFJLENBQUMsZUFBTztZQUFFLGVBQU8sSUFBWSxNQUFNLHNDQUFrQixDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQSxDQUFDO1FBQzNFLElBQUksQ0FBQyxlQUFPO1lBQUUsTUFBTSwwQkFBMEIsQ0FBQztRQUUvQyxJQUFJLGNBQWMsRUFBRTtZQUNoQixlQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsNkNBQTZDO1lBQ3pFLE1BQU0sZUFBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1NBQzVEO1FBRUQsTUFBTSxlQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFDaEUsS0FBSyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLFlBQVksUUFBUSxXQUFXLEtBQUssZ0JBQWdCLFVBQVUsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBRXpJLE9BQU8sZUFBTyxDQUFDO0lBQ25CLENBQUM7Q0FBQTtBQXJCRCwwQ0FxQkM7QUFBQSxDQUFDO0FBRUYsU0FBc0IsbUJBQW1CLENBQUUsZ0JBQWdDOztRQUN2RSxJQUFJLENBQUMsQ0FBQyxnQkFBZ0IsSUFBSSxlQUFPLENBQUM7WUFBRSxNQUFNLG9DQUFvQyxDQUFDO1FBQy9FLHVDQUFrQixDQUFDLGdCQUFnQixJQUFjLGVBQU8sQ0FBQyxDQUFDO1FBQzFELElBQUksQ0FBQyxnQkFBZ0I7WUFBRSxlQUFPLEdBQUcsSUFBSSxDQUFDO0lBQzFDLENBQUM7Q0FBQTtBQUpELGtEQUlDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxyXG4vKipAbW9kdWxlIGFtcXBTZW5kIC0gVGhpcyBtb2R1bGUgbWFuYWdlcyB0aGUgc2VuZGluZyBvZiBtZXNzZ2VzIGJ5IEFNUVAgcHJvdG9jb2wuICBJdCBpcyBvcGluaW9uYXRlZCB0byBpbXBsZW1lbnQgQVRPIGNvbmNlcHRzIGxpa2UgQkkgJiBJQyBhbmQgKHRvZG8pIEJQQyBjb3VudHMuXHJcbiAqL1xyXG5pbXBvcnQgKiBhcyBteUxvZyBmcm9tICcuLi8uLi9teUxvZyc7XHJcbmltcG9ydCB7IG9wZW5BTVFQQ29ubmVjdGlvbiwgY2xvc2VBTVFQQ29ubmVjdGlvbiBhcyBjbG9zZVNlbmRlckNoYW5uZWwsIENoYW5uZWwsIE1lc3NhZ2UgfSBmcm9tIFwiLi9hbXFwQ2hhbm5lbE9wZW5lclwiO1xyXG5leHBvcnQgeyBDaGFubmVsLCBNZXNzYWdlIH07XHJcbi8qKiB7Q2hhbm5lbH0gY2hhbm5lbCAtIFN0YXRlZnVsbHkgaG9sZHMgdGhlIGNoYW5uZWwuXHJcbiAqICAgICAgICAgICAgICAgICAgICAgIFdoZW4gYW1xcFNlbmRNZXNzYWdlIGlzIGludm9rZWQsIGlmIHRoaXMgcHJvcGVydHkgaXMgbnVsbCwgYSBuZXcgY29ubmVjdGlvbiAmIGNoYW5uZWwgYXJlIG9wZW5lZCBhbmQgYXMgYSBzaWRlLWVmZmVjdCB0aGUgY2hhbm5lbCBpcyBzdG9yZWQgaGVyZSBmb3Igc3Vic2VxdWVudCBzZW5kcy5cclxuICogICAgICAgICAgICAgICAgICAgICAgV2hlbiBvcGVubmluZyBhIGNvbm5lY3Rpb24gJiBjaGFubmVsLCB0aGUgZXhjaGFuZ2UgYW5kIHF1ZXVlcyBhcmUgYXNzZXJ0ZWQgdG8gZW5zdXJlIHRoZXkgZXhpc3QuIFRvIGNyZWF0ZSBhIG5ldyBleGNoYW5nZS9xdWV1ZSBzZXQgdGhpcyBwcm9wZXJ0eSB0byBudWxsLiBcclxuICovXHJcbmV4cG9ydCBsZXQgY2hhbm5lbDogQ2hhbm5lbCB8IG51bGw7XHJcbi8qKiBtZXNzYWdlUHJvcGVyZXRpZXMgLSBTdGF0ZWZ1bGx5IGhvbGRzIHRoZSBtZXNzYWdlIHByb3BlcnRpZXMgZm9yIHNlbmRpbmcgbWVzc2FnZXMgdG8gcXVldWVzLiAgVGhlc2UgcHJvcGVydGllcyBpbmNsdWRlOiBwZXJzaXN0ZW50ICYgY29ycmVsYXRpb25JZCAqL1xyXG5leHBvcnQgbGV0IG1lc3NhZ2VQcm9wZXJldGllczogYW55O1xyXG5cclxuLyoqXHJcbiAqIFRoaXMgZnVuY3Rpb24gc2VuZHMgYSBtZXNzYWdlIChkYXRhIHBhcmFtKSB2aWEgYW4gQU1RUCBxdWV1ZSAoY29uY2F0ZW5hdGlvbiBvZiBCSSAmIElDKS4gIElGIHRoZSBjaGFubmVsIGZpZWxkIGlzIG51bGwsIHdpbGwgb3BlbiB0aGUgY2hhbm5lbCBhbmQgYXNzZXJ0IHRoZSBleGNoYW5nZSAmIHF1ZXVlLlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gQkkgICAtIEJ1c2luZXNzIEludGVyZmFjZSAtIEJvdGggdGhlICdhbXFwIGV4Y2hhbmdlJyBhbmQgdGhlICdwcmVmaXggdG8gdGhlIHF1ZXVlIG5hbWUnIHVzZSB0aGUgQkkuXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBJQyAgIC0gSW50ZXJmYWNlIENvbXBvbmVudCAtIHRoZSBzdWZmaXggdG8gdGhlIHF1ZXVlIChCSS5JQykgLSBtYXkgY29udGFpbiBhIHBlcmlvZCB0byBhbmQgY29udGVudCBhZnRlciB0aGF0IGlzIGEgVG9waWMuXHJcbiAqIEBwYXJhbSB7QnVmZmVyfSBkYXRhIC0gdGhlIGRhdGEgdG8gc2VuZCBpbiB0aGUgbWVzc2FnZS5cclxuICogQHBhcmFtIHtzdHJpbmd9IFtyb3V0aW5nS2V5XSAtIEV4cGVjdGVkIHRvIGJlIGZvcm1hdCBCSS5JQy5Ub3BpYyAoYnV0IGRvZXNuJ3QgaGF2ZSB0byBiZSkuICBJZiBzdXBwbGllZCB0aGlzIHdpbGwgYmUgdXNlZCBhcyB0aGUgcXVldWUgbmFtZSBpbnN0ZWFkIG9mIEJJLklDLlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gW2JpbmRpbmdQYXR0ZXJuXSAtIElmIHN1cHBsaWVkIHdpbGwgc2V0IHVwIGEgYmluZGluZyBiZXR3ZWVuIHRoZSBxdWV1ZSBhbmQgZXhjaGFuZ2UuICBBcyBhIHNpZGUtZWZmZWN0IHdpbGwgYWxzbyBhc3NlcnQgdGhlIHF1ZXVlL3JvdXRpbmcga2V5LlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gW21lc3NhZ2VQcm9wZXJ0aWVzXSAtIEFsbG93IHNwZWNpZnlpbmcgbWVzc2FnZSBwcm9wZXJ0aWVzLCBlLmcgcGVyc2lzdGVuY2UsIGNvcmVsYXRpb24gaWQsIGV0Yy5cclxuICogQHJldHVybnMge0NoYW5uZWx9IC0gUmV0dXJucyB0aGUgY2hhbm5lbCBjb25uZWN0ZWQgdG9cclxuICovXHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYW1xcE9wZW5DaGFubmVsKEJJOiBzdHJpbmcsIElDOiBzdHJpbmcsIHF1ZXVlOnN0cmluZyA9IEJJICsgXCIuXCIgKyBJQykge1xyXG4gICAgY2hhbm5lbCA9IDxDaGFubmVsPmF3YWl0IG9wZW5BTVFQQ29ubmVjdGlvbihCSSwgcXVldWUpO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYW1xcFNlbmRNZXNzYWdlKEJJOiBzdHJpbmcsIElDOiBzdHJpbmcsIGRhdGE6IEJ1ZmZlciwgcm91dGluZ0tleT86IHN0cmluZywgYmluZGluZ1BhdHRlcm4/OiBzdHJpbmcsIG1lc3NhZ2VQcm9wZXJ0aWVzPzogYW55KSB7XHJcbiAgICBtZXNzYWdlUHJvcGVydGllcyA9IG1lc3NhZ2VQcm9wZXJ0aWVzIHx8IHt9O1xyXG4gICAgbWVzc2FnZVByb3BlcnRpZXMuY29ycmVsYXRpb25JZCA9IG1lc3NhZ2VQcm9wZXJ0aWVzLmNvcnJlbGF0aW9uSWQgfHwgRGF0ZS5ub3coKS50b1N0cmluZygpO1xyXG4gICAgbWVzc2FnZVByb3BlcnRpZXMucGVyc2lzdGVudCA9IHRydWU7XHJcbiAgICBteUxvZy5kZWJ1ZyhgbWVzc2FnZVByb3BlcnRpZXNgLCBtZXNzYWdlUHJvcGVydGllcylcclxuXHJcbiAgICAvL3RvZG86IG5lZWQgdG8gbG9vayB1cCBjb25maWcgaW5mbyBiYXNlZCBvbiBiaSAmIGljIGRlZmluaXRpb25zLCBqdXN0IGZ1ZGdpbmcgZm9yIG5vd1xyXG4gICAgdmFyIHF1ZXVlID0gcm91dGluZ0tleSB8fCBCSSArIFwiLlwiICsgSUM7XHJcbiAgICBsZXQgZXhjaGFuZ2UgPSBCSTtcclxuICAgIGlmICghY2hhbm5lbCkgY2hhbm5lbCA9IDxDaGFubmVsPmF3YWl0IG9wZW5BTVFQQ29ubmVjdGlvbihleGNoYW5nZSwgcXVldWUpO1xyXG4gICAgaWYgKCFjaGFubmVsKSB0aHJvdyBcIkFNUVAgQ2hhbm5lbCBkaWRuJ3Qgb3BlblwiO1xyXG5cclxuICAgIGlmIChiaW5kaW5nUGF0dGVybikge1xyXG4gICAgICAgIGNoYW5uZWwuYXNzZXJ0UXVldWUocXVldWUpOyAvL29wdGlvbmFsIGluIGNhc2Ugd2Ugd2FudCB0byBsaXZlIGRhbmdyb3VzbHlcclxuICAgICAgICBhd2FpdCBjaGFubmVsLmJpbmRRdWV1ZShxdWV1ZSwgZXhjaGFuZ2UsIGJpbmRpbmdQYXR0ZXJuKTtcclxuICAgIH1cclxuXHJcbiAgICBhd2FpdCBjaGFubmVsLnB1Ymxpc2goZXhjaGFuZ2UsIHF1ZXVlLCBkYXRhLCBtZXNzYWdlUHJvcGVydGllcyk7XHJcbiAgICBteUxvZy5kZWJ1ZyhgIFt4XSBzZW5kTWVzc2FnZSAke2RhdGEudG9TdHJpbmcoKS5zdWJzdHIoMCwgMTUwKX0gdG8gZXhjaDoke2V4Y2hhbmdlfSwgcXVldWU6JHtxdWV1ZX0sIHJvdXRpbmdLZXkgJHtyb3V0aW5nS2V5IHx8IHF1ZXVlfWApO1xyXG5cclxuICAgIHJldHVybiBjaGFubmVsO1xyXG59O1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsb3NlQU1RUENvbm5lY3Rpb24gKHNwZWNpZmllZENoYW5uZWw/OkNoYW5uZWwgfCBudWxsKXtcclxuICAgIGlmICghKHNwZWNpZmllZENoYW5uZWwgfHwgY2hhbm5lbCkpIHRocm93IFwiTmVlZCB0byBnaXZlIG1lIGEgY2hhbm5lbCB0byBjbG9zZVwiO1xyXG4gICAgY2xvc2VTZW5kZXJDaGFubmVsKHNwZWNpZmllZENoYW5uZWwgfHwgPENoYW5uZWw+IGNoYW5uZWwpO1xyXG4gICAgaWYgKCFzcGVjaWZpZWRDaGFubmVsKSBjaGFubmVsID0gbnVsbDtcclxufSJdfQ==
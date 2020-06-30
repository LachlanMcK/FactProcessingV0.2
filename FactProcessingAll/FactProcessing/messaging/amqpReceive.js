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
/** amqpReceive - This module manages the receiving of messges by AMQP protocol.  It is opinionated to implement ATO concepts like BI & IC and (todo) BPC counts. */
const myLog = __importStar(require("../../myLog"));
const amqpChannelOpener_1 = require("./amqpChannelOpener");
function defaultMessageHandler(msg) {
    if (!exports.channel)
        throw "It should be impossible for the channel to be null as we've just received a message, but typescript compiler is making me do this!";
    myLog.info(" [x] DummyReceiver %s", msg.content.toString());
    exports.channel.ack(msg);
}
/** {boolean} safe - When this property is true it will assert the queue.  If this is not done the process terminates with an error.
 *                   By default this property is false, trusting that the consumer knows the listen to queue already exists - this is to save the (presumed) unnecessary overhead
 *                   of asserting the queue on each get. This overhead is probably negligable as getMessage gets many messages.
 */
exports.safe = false;
/**
 * This function starts a listener for AMQP messages on the queue formed by concatenating BI.IC.  This listener runs until: the connection/ process is closed.
 * @param {string} BI - Business Interface - Both the 'amqp exchange' and the 'prefix to the queue name' use the BI.
 * @param {string} IC - Interface Component - the suffix to the queue - may contain a period to and content after that is a Topic.
 * @param {(message)=>{}} messageHandler - this function will be invoked for each message taken off the queue.  Note - this handler will need to Ack the message.
 */
function amqpGetMessages(BI, IC, messageHandler = defaultMessageHandler) {
    return __awaiter(this, void 0, void 0, function* () {
        //todo: need to look up config info based on BI/IC
        let queue = BI + "." + IC;
        let exchange = BI;
        if (!exports.channel)
            exports.channel = (yield amqpChannelOpener_1.openAMQPConnection(exchange, queue));
        if (!exports.channel)
            throw "AMQP Channel didn't open";
        if (exports.safe)
            exports.channel.assertQueue(queue); //don't want to slow things down b aways checking the queue is there.
        myLog.info(` [*] Waiting for messages in %s. To exit press CTRL+C, ${queue}`);
        try {
            yield exports.channel.consume(queue, messageHandler, { noAck: false });
            myLog.debug(` [*] Finished consuming messages!`);
        }
        catch (e) {
            myLog.error(`Error encountered consuming messages from queue ${queue}`, e);
        }
    });
}
exports.amqpGetMessages = amqpGetMessages;
;
function closeAMQPConnection(specifiedChannel) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!specifiedChannel && !exports.channel)
            throw "Need to give me a channel to close";
        amqpChannelOpener_1.closeAMQPConnection(specifiedChannel || exports.channel);
        if (!specifiedChannel)
            exports.channel = null;
    });
}
exports.closeAMQPConnection = closeAMQPConnection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW1xcFJlY2VpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbXFwUmVjZWl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0Esb0tBQW9LO0FBQ3BLLG1EQUFxQztBQUNyQywyREFBd0g7QUFHeEgsU0FBUyxxQkFBcUIsQ0FBQyxHQUFZO0lBQ3ZDLElBQUksQ0FBQyxlQUFPO1FBQUUsTUFBTSxvSUFBb0ksQ0FBQztJQUN6SixLQUFLLENBQUMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUM1RCxlQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3JCLENBQUM7QUFPRDs7O0dBR0c7QUFDUSxRQUFBLElBQUksR0FBRyxLQUFLLENBQUM7QUFFeEI7Ozs7O0dBS0c7QUFDSCxTQUFzQixlQUFlLENBQUMsRUFBVSxFQUFFLEVBQVUsRUFBRSxpQkFBc0IscUJBQXFCOztRQUNyRyxrREFBa0Q7UUFDbEQsSUFBSSxLQUFLLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDMUIsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxlQUFPO1lBQUUsZUFBTyxJQUFZLE1BQU0sc0NBQWtCLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFBLENBQUM7UUFDM0UsSUFBSSxDQUFDLGVBQU87WUFBRSxNQUFNLDBCQUEwQixDQUFDO1FBRS9DLElBQUksWUFBSTtZQUFFLGVBQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxxRUFBcUU7UUFDM0csS0FBSyxDQUFDLElBQUksQ0FBQywwREFBMEQsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUM5RSxJQUFJO1lBQ0EsTUFBTSxlQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxjQUFjLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUMvRCxLQUFLLENBQUMsS0FBSyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7U0FDcEQ7UUFDRCxPQUFPLENBQUMsRUFBRTtZQUNOLEtBQUssQ0FBQyxLQUFLLENBQUMsbURBQW1ELEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO1NBQzdFO0lBQ0wsQ0FBQztDQUFBO0FBaEJELDBDQWdCQztBQUFBLENBQUM7QUFFRixTQUFzQixtQkFBbUIsQ0FBRSxnQkFBZ0M7O1FBQ3ZFLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLGVBQU87WUFBRSxNQUFNLG9DQUFvQyxDQUFDO1FBQzlFLHVDQUFvQixDQUFDLGdCQUFnQixJQUFjLGVBQU8sQ0FBQyxDQUFDO1FBQzVELElBQUksQ0FBQyxnQkFBZ0I7WUFBRSxlQUFPLEdBQUcsSUFBSSxDQUFDO0lBQzFDLENBQUM7Q0FBQTtBQUpELGtEQUlDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxyXG4vKiogYW1xcFJlY2VpdmUgLSBUaGlzIG1vZHVsZSBtYW5hZ2VzIHRoZSByZWNlaXZpbmcgb2YgbWVzc2dlcyBieSBBTVFQIHByb3RvY29sLiAgSXQgaXMgb3BpbmlvbmF0ZWQgdG8gaW1wbGVtZW50IEFUTyBjb25jZXB0cyBsaWtlIEJJICYgSUMgYW5kICh0b2RvKSBCUEMgY291bnRzLiAqL1xyXG5pbXBvcnQgKiBhcyBteUxvZyBmcm9tICcuLi8uLi9teUxvZyc7XHJcbmltcG9ydCB7IG9wZW5BTVFQQ29ubmVjdGlvbiwgY2xvc2VBTVFQQ29ubmVjdGlvbiBhcyBjbG9zZVJlY2VpdmVyQ2hhbm5lbCwgQ2hhbm5lbCwgTWVzc2FnZSB9IGZyb20gXCIuL2FtcXBDaGFubmVsT3BlbmVyXCI7XHJcbmV4cG9ydCB7IENoYW5uZWwsIE1lc3NhZ2UgfTtcclxuXHJcbmZ1bmN0aW9uIGRlZmF1bHRNZXNzYWdlSGFuZGxlcihtc2c6IE1lc3NhZ2UpIHtcclxuICAgIGlmICghY2hhbm5lbCkgdGhyb3cgXCJJdCBzaG91bGQgYmUgaW1wb3NzaWJsZSBmb3IgdGhlIGNoYW5uZWwgdG8gYmUgbnVsbCBhcyB3ZSd2ZSBqdXN0IHJlY2VpdmVkIGEgbWVzc2FnZSwgYnV0IHR5cGVzY3JpcHQgY29tcGlsZXIgaXMgbWFraW5nIG1lIGRvIHRoaXMhXCI7XHJcbiAgICBteUxvZy5pbmZvKFwiIFt4XSBEdW1teVJlY2VpdmVyICVzXCIsIG1zZy5jb250ZW50LnRvU3RyaW5nKCkpO1xyXG4gICAgY2hhbm5lbC5hY2sobXNnKTtcclxufVxyXG5cclxuLyoqIHtDaGFubmVsfSBjaGFubmVsIC0gU3RhdGVmdWxseSBob2xkcyB0aGUgY2hhbm5lbC5cclxuICogICAgICAgICAgICAgICAgICAgICAgV2hlbiBhbXFwR2V0TWVzc2FnZSBpcyBpbnZva2VkLCBpZiB0aGlzIHByb3BlcnR5IGlzIG51bGwsIGEgbmV3IGNvbm5lY3Rpb24gJiBjaGFubmVsIGFyZSBvcGVuZWQgYW5kIGFzIGEgc2lkZS1lZmZlY3QgdGhlIGNoYW5uZWwgaXMgc3RvcmVkIGhlcmUgZm9yIHN1YnNlcXVlbnQgc2VuZHMuXHJcbiAqICAgICAgICAgICAgICAgICAgICAgIFdoZW4gb3BlbmluZyBhIGNvbm5lY3Rpb24gJiBjaGFubmVsLCB0aGUgZXhjaGFuZ2UgYW5kIHF1ZXVlcyBhcmUgYXNzZXJ0ZWQgdG8gZW5zdXJlIHRoZXkgZXhpc3QuIFRvIGNyZWF0ZSBhIG5ldyBleGNoYW5nZS9xdWV1ZSBzZXQgdGhpcyBwcm9wZXJ0eSB0byBudWxsLiBcclxuICovXHJcbmV4cG9ydCBsZXQgY2hhbm5lbDogQ2hhbm5lbCB8IG51bGw7XHJcbi8qKiB7Ym9vbGVhbn0gc2FmZSAtIFdoZW4gdGhpcyBwcm9wZXJ0eSBpcyB0cnVlIGl0IHdpbGwgYXNzZXJ0IHRoZSBxdWV1ZS4gIElmIHRoaXMgaXMgbm90IGRvbmUgdGhlIHByb2Nlc3MgdGVybWluYXRlcyB3aXRoIGFuIGVycm9yLlxyXG4gKiAgICAgICAgICAgICAgICAgICBCeSBkZWZhdWx0IHRoaXMgcHJvcGVydHkgaXMgZmFsc2UsIHRydXN0aW5nIHRoYXQgdGhlIGNvbnN1bWVyIGtub3dzIHRoZSBsaXN0ZW4gdG8gcXVldWUgYWxyZWFkeSBleGlzdHMgLSB0aGlzIGlzIHRvIHNhdmUgdGhlIChwcmVzdW1lZCkgdW5uZWNlc3Nhcnkgb3ZlcmhlYWRcclxuICogICAgICAgICAgICAgICAgICAgb2YgYXNzZXJ0aW5nIHRoZSBxdWV1ZSBvbiBlYWNoIGdldC4gVGhpcyBvdmVyaGVhZCBpcyBwcm9iYWJseSBuZWdsaWdhYmxlIGFzIGdldE1lc3NhZ2UgZ2V0cyBtYW55IG1lc3NhZ2VzLlxyXG4gKi9cclxuZXhwb3J0IGxldCBzYWZlID0gZmFsc2U7XHJcblxyXG4vKipcclxuICogVGhpcyBmdW5jdGlvbiBzdGFydHMgYSBsaXN0ZW5lciBmb3IgQU1RUCBtZXNzYWdlcyBvbiB0aGUgcXVldWUgZm9ybWVkIGJ5IGNvbmNhdGVuYXRpbmcgQkkuSUMuICBUaGlzIGxpc3RlbmVyIHJ1bnMgdW50aWw6IHRoZSBjb25uZWN0aW9uLyBwcm9jZXNzIGlzIGNsb3NlZC5cclxuICogQHBhcmFtIHtzdHJpbmd9IEJJIC0gQnVzaW5lc3MgSW50ZXJmYWNlIC0gQm90aCB0aGUgJ2FtcXAgZXhjaGFuZ2UnIGFuZCB0aGUgJ3ByZWZpeCB0byB0aGUgcXVldWUgbmFtZScgdXNlIHRoZSBCSS5cclxuICogQHBhcmFtIHtzdHJpbmd9IElDIC0gSW50ZXJmYWNlIENvbXBvbmVudCAtIHRoZSBzdWZmaXggdG8gdGhlIHF1ZXVlIC0gbWF5IGNvbnRhaW4gYSBwZXJpb2QgdG8gYW5kIGNvbnRlbnQgYWZ0ZXIgdGhhdCBpcyBhIFRvcGljLlxyXG4gKiBAcGFyYW0geyhtZXNzYWdlKT0+e319IG1lc3NhZ2VIYW5kbGVyIC0gdGhpcyBmdW5jdGlvbiB3aWxsIGJlIGludm9rZWQgZm9yIGVhY2ggbWVzc2FnZSB0YWtlbiBvZmYgdGhlIHF1ZXVlLiAgTm90ZSAtIHRoaXMgaGFuZGxlciB3aWxsIG5lZWQgdG8gQWNrIHRoZSBtZXNzYWdlLlxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFtcXBHZXRNZXNzYWdlcyhCSTogc3RyaW5nLCBJQzogc3RyaW5nLCBtZXNzYWdlSGFuZGxlcjogYW55ID0gZGVmYXVsdE1lc3NhZ2VIYW5kbGVyKSB7XHJcbiAgICAvL3RvZG86IG5lZWQgdG8gbG9vayB1cCBjb25maWcgaW5mbyBiYXNlZCBvbiBCSS9JQ1xyXG4gICAgbGV0IHF1ZXVlID0gQkkgKyBcIi5cIiArIElDO1xyXG4gICAgbGV0IGV4Y2hhbmdlID0gQkk7XHJcbiAgICBpZiAoIWNoYW5uZWwpIGNoYW5uZWwgPSA8Q2hhbm5lbD5hd2FpdCBvcGVuQU1RUENvbm5lY3Rpb24oZXhjaGFuZ2UsIHF1ZXVlKTtcclxuICAgIGlmICghY2hhbm5lbCkgdGhyb3cgXCJBTVFQIENoYW5uZWwgZGlkbid0IG9wZW5cIjtcclxuXHJcbiAgICBpZiAoc2FmZSkgY2hhbm5lbC5hc3NlcnRRdWV1ZShxdWV1ZSk7IC8vZG9uJ3Qgd2FudCB0byBzbG93IHRoaW5ncyBkb3duIGIgYXdheXMgY2hlY2tpbmcgdGhlIHF1ZXVlIGlzIHRoZXJlLlxyXG4gICAgbXlMb2cuaW5mbyhgIFsqXSBXYWl0aW5nIGZvciBtZXNzYWdlcyBpbiAlcy4gVG8gZXhpdCBwcmVzcyBDVFJMK0MsICR7cXVldWV9YCk7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IGNoYW5uZWwuY29uc3VtZShxdWV1ZSwgbWVzc2FnZUhhbmRsZXIsIHsgbm9BY2s6IGZhbHNlIH0pO1xyXG4gICAgICAgIG15TG9nLmRlYnVnKGAgWypdIEZpbmlzaGVkIGNvbnN1bWluZyBtZXNzYWdlcyFgKTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgbXlMb2cuZXJyb3IoYEVycm9yIGVuY291bnRlcmVkIGNvbnN1bWluZyBtZXNzYWdlcyBmcm9tIHF1ZXVlICR7cXVldWV9YCwgZSlcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbG9zZUFNUVBDb25uZWN0aW9uIChzcGVjaWZpZWRDaGFubmVsPzpDaGFubmVsIHwgbnVsbCl7XHJcbiAgICBpZiAoIXNwZWNpZmllZENoYW5uZWwgJiYgIWNoYW5uZWwpIHRocm93IFwiTmVlZCB0byBnaXZlIG1lIGEgY2hhbm5lbCB0byBjbG9zZVwiO1xyXG4gICAgY2xvc2VSZWNlaXZlckNoYW5uZWwoc3BlY2lmaWVkQ2hhbm5lbCB8fCA8Q2hhbm5lbD4gY2hhbm5lbCk7XHJcbiAgICBpZiAoIXNwZWNpZmllZENoYW5uZWwpIGNoYW5uZWwgPSBudWxsO1xyXG59XHJcbiJdfQ==
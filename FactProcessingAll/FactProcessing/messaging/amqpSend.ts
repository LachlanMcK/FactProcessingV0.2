#!/usr/bin/env node
/**@module amqpSend - This module manages the sending of messges by AMQP protocol.  It is opinionated to implement ATO concepts like BI & IC and (todo) BPC counts.
 */
import * as myLog from '../../myLog';
import { openAMQPConnection, closeAMQPConnection as closeSenderChannel, Channel, Message } from "./amqpChannelOpener";
export { Channel, Message };
/** {Channel} channel - Statefully holds the channel.
 *                      When amqpSendMessage is invoked, if this property is null, a new connection & channel are opened and as a side-effect the channel is stored here for subsequent sends.
 *                      When openning a connection & channel, the exchange and queues are asserted to ensure they exist. To create a new exchange/queue set this property to null. 
 */
export let channel: Channel | null;
/** messagePropereties - Statefully holds the message properties for sending messages to queues.  These properties include: persistent & correlationId */
export let messagePropereties: any;

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

export async function amqpOpenChannel(BI: string, IC: string, queue:string = BI + "." + IC) {
    channel = <Channel>await openAMQPConnection(BI, queue);
}

export async function amqpSendMessage(BI: string, IC: string, data: Buffer, routingKey?: string, bindingPattern?: string, messageProperties?: any) {
    messageProperties = messageProperties || {};
    messageProperties.correlationId = messageProperties.correlationId || Date.now().toString();
    messageProperties.persistent = true;
    myLog.debug(`messageProperties`, messageProperties)

    //todo: need to look up config info based on bi & ic definitions, just fudging for now
    var queue = routingKey || BI + "." + IC;
    let exchange = BI;
    if (!channel) channel = <Channel>await openAMQPConnection(exchange, queue);
    if (!channel) throw "AMQP Channel didn't open";

    if (bindingPattern) {
        channel.assertQueue(queue); //optional in case we want to live dangrously
        await channel.bindQueue(queue, exchange, bindingPattern);
    }

    await channel.publish(exchange, queue, data, messageProperties);
    myLog.debug(` [x] sendMessage ${data.toString().substr(0, 150)} to exch:${exchange}, queue:${queue}, routingKey ${routingKey || queue}`);

    return channel;
};

export async function closeAMQPConnection (specifiedChannel?:Channel | null){
    if (!(specifiedChannel || channel)) throw "Need to give me a channel to close";
    closeSenderChannel(specifiedChannel || <Channel> channel);
    if (!specifiedChannel) channel = null;
}
#!/usr/bin/env node
/** amqpReceive - This module manages the receiving of messges by AMQP protocol.  It is opinionated to implement ATO concepts like BI & IC and (todo) BPC counts. */
import * as myLog from '../../myLog';
import { openAMQPConnection, closeAMQPConnection as closeReceiverChannel, Channel, Message } from "./amqpChannelOpener";
export { Channel, Message };

function defaultMessageHandler(msg: Message) {
    if (!channel) throw "It should be impossible for the channel to be null as we've just received a message, but typescript compiler is making me do this!";
    myLog.info(" [x] DummyReceiver %s", msg.content.toString());
    channel.ack(msg);
}

/** {Channel} channel - Statefully holds the channel.
 *                      When amqpGetMessage is invoked, if this property is null, a new connection & channel are opened and as a side-effect the channel is stored here for subsequent sends.
 *                      When opening a connection & channel, the exchange and queues are asserted to ensure they exist. To create a new exchange/queue set this property to null. 
 */
export let channel: Channel | null;
/** {boolean} safe - When this property is true it will assert the queue.  If this is not done the process terminates with an error.
 *                   By default this property is false, trusting that the consumer knows the listen to queue already exists - this is to save the (presumed) unnecessary overhead
 *                   of asserting the queue on each get. This overhead is probably negligable as getMessage gets many messages.
 */
export let safe = false;

/**
 * This function starts a listener for AMQP messages on the queue formed by concatenating BI.IC.  This listener runs until: the connection/ process is closed.
 * @param {string} BI - Business Interface - Both the 'amqp exchange' and the 'prefix to the queue name' use the BI.
 * @param {string} IC - Interface Component - the suffix to the queue - may contain a period to and content after that is a Topic.
 * @param {(message)=>{}} messageHandler - this function will be invoked for each message taken off the queue.  Note - this handler will need to Ack the message.
 */
export async function amqpGetMessages(BI: string, IC: string, messageHandler: any = defaultMessageHandler) {
    //todo: need to look up config info based on BI/IC
    let queue = BI + "." + IC;
    let exchange = BI;
    if (!channel) channel = <Channel>await openAMQPConnection(exchange, queue);
    if (!channel) throw "AMQP Channel didn't open";

    if (safe) channel.assertQueue(queue); //don't want to slow things down b aways checking the queue is there.
    myLog.info(` [*] Waiting for messages in %s. To exit press CTRL+C, ${queue}`);
    try {
        await channel.consume(queue, messageHandler, { noAck: false });
        myLog.debug(` [*] Finished consuming messages!`);
    }
    catch (e) {
        myLog.error(`Error encountered consuming messages from queue ${queue}`, e)
    }
};

export async function closeAMQPConnection (specifiedChannel?:Channel | null){
    if (!specifiedChannel && !channel) throw "Need to give me a channel to close";
    closeReceiverChannel(specifiedChannel || <Channel> channel);
    if (!specifiedChannel) channel = null;
}

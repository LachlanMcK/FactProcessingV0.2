//const amqp = require('amqplib');
import * as myLog from '../../myLog';
import amqp from 'amqplib';
import {Channel, Message} from 'amqplib';
export {Channel, Message};

const workingDirectory = process.env.PWD || "";
const envPath = (workingDirectory.substr(-13, 13) == "amqpMessaging") ? '../.env' : './FactProcessing/.env';
const dotenv = require('dotenv').config({ path: envPath });

myLog.debug('workingDirectory:', workingDirectory);
myLog.debug('envPath:', envPath);
myLog.debug('env:', process.env.CLOUDAMQP_URL);
const ampqConnectionString = process.env.CLOUDAMQP_URL + "?heartbeat=60";

export let connectionState:amqp.Connection;
export async function openAMQPConnection(exchange: string, queue:string){

    myLog.debug(`Open AMQP exchange: ${exchange}, queue: ${queue} Conn Str: ${ampqConnectionString}`, );
    return await amqp.connect(ampqConnectionString)
        .then(async (connection) => {
            // exports.connection = connectionState;
            connectionState = connection;
            let channel = await connection.createChannel();
            await channel.assertQueue(queue, { durable: true });
            await channel.assertExchange(exchange, 'topic', {durable: true});
            await channel.bindQueue(queue,exchange,queue);
            return channel;
        })
        .catch(err => {
            debugger;
            myLog.debug("openAMQPConnection Found Error: ", err);
        });
}

export async function closeAMQPConnection(channel:amqp.Channel) {
    try {
        myLog.debug('Closing Channel');
        await channel.close();
        myLog.debug('Closing connection state');
        await connectionState.close();
        myLog.debug('All closed');

    } catch (err) {
        myLog.debug('Error closing connection ', err);
    }
}
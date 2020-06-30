interface bpcDetails { BPCName: string, BPCFreq: number, BPCInstanceFn: (url: string, body: object) => {} }
let interfaceConfigs: { [key: string]: bpcDetails } = {};
let bpcCounts: { [key: string]: { count: number, lastSent: number } } = {};
import * as  amqpSend from './amqpSend';

//todo: finish this off;
export function incrementBPCCount(interfaceName: string,  url: string, body: any) {
    //todo: finish this (using the inteface details to keep a running count, then every now & then send it to be reconciled.)
    return;

    if (!interfaceConfigs[interfaceName]) {
        const configFileName = (process.env[interfaceName] || interfaceName) + '.json';
        interfaceConfigs[interfaceName] = configFileName ? require(configFileName) : { BPCName: interfaceName, BPCFreq: 24 * 60 * 60 * 1000, BPCInstanceFn: (url: string, body: any) => new Date().toDateString() };
    }

    let thisInterfaceConfig = interfaceConfigs[interfaceName];
    const bpcInstance = thisInterfaceConfig.BPCName + thisInterfaceConfig.BPCInstanceFn(url, body);

    bpcCounts[bpcInstance].count += 1;

    let nextSend = bpcCounts[bpcInstance].lastSent + thisInterfaceConfig.BPCFreq;

    if (nextSend < Date.now()) {
        let channel = amqpSend.amqpSendMessage("BIBPC", "ICBPC", Buffer.from(bpcCounts[bpcInstance]));
        bpcCounts[bpcInstance].count = 0;
        bpcCounts[bpcInstance].lastSent = Date.now();
    }
}
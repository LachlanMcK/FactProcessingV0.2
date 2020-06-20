var stackTrace = require('stack-trace');
const dotenv = require('dotenv').config({ path: './FactProcessing/.env' });
const logr = require('debug')('FactProc:myLog')
logr(`Loading myLog with env variable DEBUG=${process.env.DEBUG}, Loglevel= ${process.env.LOGLEVEL}` );
debugger;
console.log(`  FactProc:myLog Loading myLog with env variable DEBUG=${process.env.DEBUG}, Loglevel= ${process.env.LOGLEVEL}` );

let loggers: {[key: string]:any }={};

function logWithLocationIfAboveThreashold(logThreashold: number, level: string, args: any) {
    if (logLevel > logThreashold) return args;
    let t = stackTrace.get();
    let f = t[2].getFileName();
    var funcN = level + f.substring(f.lastIndexOf("\\") + 1, f.length - 3);
    if (!loggers[funcN]) loggers[funcN] = require('debug')('FactProc:' + funcN);
    // let loc = t[2].getLineNumber();
    // console.log(`LT ${logThreashold}, lev ${level}, fileReference ${fileReference}, funcN ${funcN}`, ...args);
    if (fileReference == "1") loggers[funcN]("%s", t[2].toString());
    if (level == "E-") loggers[funcN]('************************************************** Encountered error **************************************************');
    let x = loggers[funcN]("%O", ...args);
    if (level == "E-") loggers[funcN]('************************************************** Encountered error **************************************************');
    return args;
}

export const logLevel = process.env.LOGLEVEL || 4;
export const fileReference = process.env.FILEREFERENCE || "0";

export var log = function (msg: any, msg2?: any) { logWithLocationIfAboveThreashold(0, "L-", arguments)}
export var debug = function (msg: any, msg2?: any) {logWithLocationIfAboveThreashold(1, "D-", arguments)}
export var debugStr = function (msg: any, msg2?: any) {return JSON.stringify(logWithLocationIfAboveThreashold(1, "D-", arguments)).substr(0,100)}
export var info = function (msg: any, msg2?: any) { logWithLocationIfAboveThreashold(2, "I-", arguments)}
export var warn = function (msg: any, ...msg2: any) { logWithLocationIfAboveThreashold(3, "W-", arguments)}
export var error = function (msg: any, ...msg2: any) { logWithLocationIfAboveThreashold(4, "E-", arguments)}
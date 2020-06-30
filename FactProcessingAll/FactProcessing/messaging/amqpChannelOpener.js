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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//const amqp = require('amqplib');
const myLog = __importStar(require("../../myLog"));
const amqplib_1 = __importDefault(require("amqplib"));
const workingDirectory = process.env.PWD || "";
const envPath = (workingDirectory.substr(-13, 13) == "amqpMessaging") ? '../.env' : './FactProcessing/.env';
const dotenv = require('dotenv').config({ path: envPath });
myLog.debug('workingDirectory:', workingDirectory);
myLog.debug('envPath:', envPath);
myLog.debug('env:', process.env.CLOUDAMQP_URL);
const ampqConnectionString = process.env.CLOUDAMQP_URL + "?heartbeat=60";
function openAMQPConnection(exchange, queue) {
    return __awaiter(this, void 0, void 0, function* () {
        myLog.debug(`Open AMQP exchange: ${exchange}, queue: ${queue} Conn Str: ${ampqConnectionString}`);
        return yield amqplib_1.default.connect(ampqConnectionString)
            .then((connection) => __awaiter(this, void 0, void 0, function* () {
            // exports.connection = connectionState;
            exports.connectionState = connection;
            let channel = yield connection.createChannel();
            yield channel.assertQueue(queue, { durable: true });
            yield channel.assertExchange(exchange, 'topic', { durable: true });
            yield channel.bindQueue(queue, exchange, queue);
            return channel;
        }))
            .catch(err => {
            debugger;
            myLog.debug("openAMQPConnection Found Error: ", err);
        });
    });
}
exports.openAMQPConnection = openAMQPConnection;
function closeAMQPConnection(channel) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            myLog.debug('Closing Channel');
            yield channel.close();
            myLog.debug('Closing connection state');
            yield exports.connectionState.close();
            myLog.debug('All closed');
        }
        catch (err) {
            myLog.debug('Error closing connection ', err);
        }
    });
}
exports.closeAMQPConnection = closeAMQPConnection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW1xcENoYW5uZWxPcGVuZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbXFwQ2hhbm5lbE9wZW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxrQ0FBa0M7QUFDbEMsbURBQXFDO0FBQ3JDLHNEQUEyQjtBQUkzQixNQUFNLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQztBQUMvQyxNQUFNLE9BQU8sR0FBRyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsSUFBSSxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQztBQUM1RyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFFM0QsS0FBSyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ25ELEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ2pDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDL0MsTUFBTSxvQkFBb0IsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsR0FBRyxlQUFlLENBQUM7QUFHekUsU0FBc0Isa0JBQWtCLENBQUMsUUFBZ0IsRUFBRSxLQUFZOztRQUVuRSxLQUFLLENBQUMsS0FBSyxDQUFDLHVCQUF1QixRQUFRLFlBQVksS0FBSyxjQUFjLG9CQUFvQixFQUFFLENBQUcsQ0FBQztRQUNwRyxPQUFPLE1BQU0saUJBQUksQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUM7YUFDMUMsSUFBSSxDQUFDLENBQU8sVUFBVSxFQUFFLEVBQUU7WUFDdkIsd0NBQXdDO1lBQ3hDLHVCQUFlLEdBQUcsVUFBVSxDQUFDO1lBQzdCLElBQUksT0FBTyxHQUFHLE1BQU0sVUFBVSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQy9DLE1BQU0sT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUNwRCxNQUFNLE9BQU8sQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxFQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUMsUUFBUSxFQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzlDLE9BQU8sT0FBTyxDQUFDO1FBQ25CLENBQUMsQ0FBQSxDQUFDO2FBQ0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ1QsUUFBUSxDQUFDO1lBQ1QsS0FBSyxDQUFDLEtBQUssQ0FBQyxrQ0FBa0MsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN6RCxDQUFDLENBQUMsQ0FBQztJQUNYLENBQUM7Q0FBQTtBQWpCRCxnREFpQkM7QUFFRCxTQUFzQixtQkFBbUIsQ0FBQyxPQUFvQjs7UUFDMUQsSUFBSTtZQUNBLEtBQUssQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUMvQixNQUFNLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN0QixLQUFLLENBQUMsS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUM7WUFDeEMsTUFBTSx1QkFBZSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQzlCLEtBQUssQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7U0FFN0I7UUFBQyxPQUFPLEdBQUcsRUFBRTtZQUNWLEtBQUssQ0FBQyxLQUFLLENBQUMsMkJBQTJCLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDakQ7SUFDTCxDQUFDO0NBQUE7QUFYRCxrREFXQyIsInNvdXJjZXNDb250ZW50IjpbIi8vY29uc3QgYW1xcCA9IHJlcXVpcmUoJ2FtcXBsaWInKTtcclxuaW1wb3J0ICogYXMgbXlMb2cgZnJvbSAnLi4vLi4vbXlMb2cnO1xyXG5pbXBvcnQgYW1xcCBmcm9tICdhbXFwbGliJztcclxuaW1wb3J0IHtDaGFubmVsLCBNZXNzYWdlfSBmcm9tICdhbXFwbGliJztcclxuZXhwb3J0IHtDaGFubmVsLCBNZXNzYWdlfTtcclxuXHJcbmNvbnN0IHdvcmtpbmdEaXJlY3RvcnkgPSBwcm9jZXNzLmVudi5QV0QgfHwgXCJcIjtcclxuY29uc3QgZW52UGF0aCA9ICh3b3JraW5nRGlyZWN0b3J5LnN1YnN0cigtMTMsIDEzKSA9PSBcImFtcXBNZXNzYWdpbmdcIikgPyAnLi4vLmVudicgOiAnLi9GYWN0UHJvY2Vzc2luZy8uZW52JztcclxuY29uc3QgZG90ZW52ID0gcmVxdWlyZSgnZG90ZW52JykuY29uZmlnKHsgcGF0aDogZW52UGF0aCB9KTtcclxuXHJcbm15TG9nLmRlYnVnKCd3b3JraW5nRGlyZWN0b3J5OicsIHdvcmtpbmdEaXJlY3RvcnkpO1xyXG5teUxvZy5kZWJ1ZygnZW52UGF0aDonLCBlbnZQYXRoKTtcclxubXlMb2cuZGVidWcoJ2VudjonLCBwcm9jZXNzLmVudi5DTE9VREFNUVBfVVJMKTtcclxuY29uc3QgYW1wcUNvbm5lY3Rpb25TdHJpbmcgPSBwcm9jZXNzLmVudi5DTE9VREFNUVBfVVJMICsgXCI/aGVhcnRiZWF0PTYwXCI7XHJcblxyXG5leHBvcnQgbGV0IGNvbm5lY3Rpb25TdGF0ZTphbXFwLkNvbm5lY3Rpb247XHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvcGVuQU1RUENvbm5lY3Rpb24oZXhjaGFuZ2U6IHN0cmluZywgcXVldWU6c3RyaW5nKXtcclxuXHJcbiAgICBteUxvZy5kZWJ1ZyhgT3BlbiBBTVFQIGV4Y2hhbmdlOiAke2V4Y2hhbmdlfSwgcXVldWU6ICR7cXVldWV9IENvbm4gU3RyOiAke2FtcHFDb25uZWN0aW9uU3RyaW5nfWAsICk7XHJcbiAgICByZXR1cm4gYXdhaXQgYW1xcC5jb25uZWN0KGFtcHFDb25uZWN0aW9uU3RyaW5nKVxyXG4gICAgICAgIC50aGVuKGFzeW5jIChjb25uZWN0aW9uKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIGV4cG9ydHMuY29ubmVjdGlvbiA9IGNvbm5lY3Rpb25TdGF0ZTtcclxuICAgICAgICAgICAgY29ubmVjdGlvblN0YXRlID0gY29ubmVjdGlvbjtcclxuICAgICAgICAgICAgbGV0IGNoYW5uZWwgPSBhd2FpdCBjb25uZWN0aW9uLmNyZWF0ZUNoYW5uZWwoKTtcclxuICAgICAgICAgICAgYXdhaXQgY2hhbm5lbC5hc3NlcnRRdWV1ZShxdWV1ZSwgeyBkdXJhYmxlOiB0cnVlIH0pO1xyXG4gICAgICAgICAgICBhd2FpdCBjaGFubmVsLmFzc2VydEV4Y2hhbmdlKGV4Y2hhbmdlLCAndG9waWMnLCB7ZHVyYWJsZTogdHJ1ZX0pO1xyXG4gICAgICAgICAgICBhd2FpdCBjaGFubmVsLmJpbmRRdWV1ZShxdWV1ZSxleGNoYW5nZSxxdWV1ZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBjaGFubmVsO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICAgIGRlYnVnZ2VyO1xyXG4gICAgICAgICAgICBteUxvZy5kZWJ1ZyhcIm9wZW5BTVFQQ29ubmVjdGlvbiBGb3VuZCBFcnJvcjogXCIsIGVycik7XHJcbiAgICAgICAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbG9zZUFNUVBDb25uZWN0aW9uKGNoYW5uZWw6YW1xcC5DaGFubmVsKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIG15TG9nLmRlYnVnKCdDbG9zaW5nIENoYW5uZWwnKTtcclxuICAgICAgICBhd2FpdCBjaGFubmVsLmNsb3NlKCk7XHJcbiAgICAgICAgbXlMb2cuZGVidWcoJ0Nsb3NpbmcgY29ubmVjdGlvbiBzdGF0ZScpO1xyXG4gICAgICAgIGF3YWl0IGNvbm5lY3Rpb25TdGF0ZS5jbG9zZSgpO1xyXG4gICAgICAgIG15TG9nLmRlYnVnKCdBbGwgY2xvc2VkJyk7XHJcblxyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgbXlMb2cuZGVidWcoJ0Vycm9yIGNsb3NpbmcgY29ubmVjdGlvbiAnLCBlcnIpO1xyXG4gICAgfVxyXG59Il19
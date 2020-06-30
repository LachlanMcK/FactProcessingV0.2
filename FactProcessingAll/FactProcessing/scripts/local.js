console.log("in local.js");//LM
const lambdaFunction = require('../../lambda.js') //LM added another ../
const apiGatewayEvent = require('../../api-gateway-event.json') //LM added another ../

console.log("app loaded, about to send simulated api gateway event");//LM

const server = lambdaFunction.handler(apiGatewayEvent, {
  succeed: v => {
    console.log("in local.js-succeed");//LM
    console.log(v)
    process.exit(0)
  }
}, (e, v) => {
  console.error(v)
  process.exit(1)
})

process.stdin.resume()

function exitHandler (options, err) {
  console.log("in local.js-exitHandler");//LM
  if (options.cleanup && server && server.close) {
    server.close()
  }

  if (err) console.error(err.stack)
  if (options.exit) process.exit()
}

process.on('exit', exitHandler.bind(null, { cleanup: true }))
process.on('SIGINT', exitHandler.bind(null, { exit: true })) // ctrl+c event
process.on('SIGTSTP', exitHandler.bind(null, { exit: true })) // ctrl+v event
process.on('uncaughtException', exitHandler.bind(null, { exit: true }))

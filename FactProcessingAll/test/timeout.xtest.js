myLog=require("../../myLog");
const dotenv = require('dotenv').config({ path: './FactProcessing/.env' });
console.log('process.end.DB', process.env.DB );

const mongoose = require('mongoose');
const options = {useMongoClient: true};

const DB='mongodb://Facts-Admin:Lotsofmongodbusers1@factsv1-shard-00-00-bw3to.mongodb.net:27017,factsv1-shard-00-01-bw3to.mongodb.net:27017,factsv1-shard-00-02-bw3to.mongodb.net:27017/Facts?ssl=true&replicaSet=FactsV1-shard-0&authSource=admin&retryWrites=true'
mongoose.connect(DB, options);

// require('../db_connectivity_test');

async function longTest(duration) {
  console.log(' ------------------ start ------------------------')

  await new Promise(resolve => setTimeout(resolve, duration));
  console.log(' ------------------  end  ------------------------');

}

describe("timeout tests", () => {

  test("timedyOut test 1", async (Done) => {
    await longTest(15000);
    Done();
  }, 20000);

  test("timedyOut test 2", async (Done) => {
    jest.setTimeout(20000);
    await longTest(15000);
    Done();
  });

  jest.setTimeout(20000);
  test("timedyOut test 3", async (Done) => {
    await longTest(15000);
    Done();
  });

});
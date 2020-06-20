const myLog = require('../myLog');
const chai = require('chai'), expect = chai.expect, Assertion = chai.Assertion;
const request = require('supertest');
const amqpReceive = require('../FactProcessing/messaging/amqpReceive');
const amqpSend = require('../FactProcessing/messaging/amqpSend');

//todo: think about: https://www.npmjs.com/package/JSONPath 

myLog.info('Environment variables:');
myLog.info('    DBProvider: ' + process.env.DBProvider);
myLog.info('    DB: ' + process.env.DB);
myLog.info('    runtimeEnvironment: ' + process.env.runtimeEnvironment);
myLog.info('    mockAuthnModule: ' + process.env.mockAuthnModule);
myLog.info('    mockAuthzModule: ' + process.env.mockAuthzModule);
myLog.info('    DEBUG: ' + process.env.DEBUG);
myLog.info('    LOGLEVEL: ' + process.env.LOGLEVEL);

var app = require('../FactProcessing/app');
var th = require('./testingHelpers')

let beforeEachTime;

// *****************************************************************************
// built own expect function to make checking form details easier
// *****************************************************************************

function sameForm(received, expected, ignoreList) {
  const pass = th.mySimpleyObjectCompare(received, expected, (ignoreList || []));
  if (pass == true) {
    myLog.debug('Passed Test');
    return true;
  } else {
    myLog.error('Failed Test');
    return pass;
  }
};

Assertion.addMethod('sameForm', function (expected, ignoreList) {
  var obj = this._obj;

  // first, our instanceof check, shortcut
  // new Assertion(this._obj).to.be.instanceof(Model);
  const result = sameForm(obj, expected, ignoreList);
  myLog.debug("Same Form Result" + JSON.stringify(result));
  // second, our type check
  this.assert(
    (result == true)
    , "expected forms to match, but they didn't due to " + JSON.stringify(result) + " expected #{this}, actual #{act}"
    , "expected forms to be different (ignoreList aside), but theybut they are not expected #{this}, actual #{act}, ignoreList: " + JSON.stringify(ignoreList)
    , expected        // expected
    , obj  // actual
    , true
  );
});

// *****************************************************************************
// Get Tests
// *****************************************************************************
describe("GET tests", function () { //return;//
  this.timeout(5000);
  const ignoreList = ["_id", "__v", "createdAt", "updatedAt", "DT_Update", "TM_Update"];
  const testURI = "/api/v1/Clients/All/Forms";
  const clientFormURI = "/api/v1/Clients/ABN/1234567890/Forms/myFT6Form";
  const longURI = "/api/v1/Clients/ABN/1234567890/Accounts/1/Roles/IT/Forms/myFT6Form/5432101";
  const notFoundURI = "/api/v1/Clients/ABN/1234567890/Accounts/2/Roles/IT/Forms/myFT6Form/5432101";

  // there is no practial reason to list all.  Just doing 'because I can'
  it("Get 1 - List all " + testURI + " Should return 200 OK", async function () {
    myLog.debug("Get 1 - List all ");
    debugger;
    return request(app).get(testURI)
      .then(response => {
        myLog.debug(`Client Internal Id ${response.body[0].ClientInternalId}`);
        expect(response.statusCode, "response statusCode should be 200").to.equal(200);

        let myFT6Forms = response.body.filter(f => f.FormType == 'myFT6' && f.Sections[0].LineItems.length == 2);
        expect(myFT6Forms.length).to.be.gte(4);
        expect(myFT6Forms[0].ClientInternalId, "Client Internal Id should be 12345, but got" + JSON.stringify(response.body[0])).to.equal(12345);

        let x10131Forms = response.body.filter(f => f.FormType == '10131' && f.Sections.length == 0);
        expect(x10131Forms.length).to.be.gte(4);
        let x10131MatchedForms = x10131Forms.filter(f => f.subjectClient.ClientIdentifierType == 'ABN' && f.subjectClient.ClientIdentifierValue == 1234567890 && !f.ClientInternalId)
        expect(x10131MatchedForms.length).to.be.eq(1);

      })
  });

  it("Get 2 - List one at client level" + clientFormURI + "Should return 200 OK", done => {
    myLog.debug("Get 2 - List one at client level");
    request(app).get(clientFormURI)
      .then(response => {
        expect(response.statusCode, "response statusCode should be 200").to.equal(200);
        expect(response.body[0].subjectClient.ClientIdentifierType).to.equal("ABN");
        expect(response.body[0].subjectClient.ClientIdentifierValue).to.equal(1234567890);
        expect(response.body[0].FormType).to.equal("myFT6");
        expect(response.body.length).to.be.greaterThan(0);
        expect(false).to.be.false; ``
        done();
      })
      .catch(e => { console.log(e); done() } /*myLog.error(e)*/);
  });

  it("Get 3 - List one at Account level " + longURI + "Should return 200 OK", async function () {
    myLog.debug("Get 3 - List one at Account level");
    let response = await request(app).get(longURI);
    expect(response.statusCode).to.equal(200);
    expect(response.body.length).to.equal(1);
    //verify all item returned have a ClientInternalId property with value 12345, account = 1 & role = 5
    expect(response.body.reduce((total, item) => total += (item.ClientInternalId == 12345) ? 1 : 0, 0)).to.equal(response.body.length);
    expect(response.body.reduce((total, item) => total += (item.AccountSequenceNumber == 1) ? 1 : 0, 0)).to.equal(response.body.length);
    expect(response.body.reduce((total, item) => total += (item.RoleTypeCode == 5) ? 1 : 0, 0)).to.equal(response.body.length);
  });

  it("Get 4 - List " + longURI + "0" + "Should return 404 OK", async function () {
    myLog.debug("Get 4 - List fails");
    let response = await request(app).get(longURI + "0");
    expect(response.statusCode).to.equal(404);
    expect(response.body, "Response body should be empty, but got" + JSON.stringify(response.body)).to.be.empty;
  });

  it("Get 5 - List " + notFoundURI + "Should return 404 OK", async function () {
    myLog.debug("Get 5 - List fails again");

    let response = await request(app).get(longURI + "0");
    expect(response.statusCode).to.equal(404);
    expect(response.body, "Response body should be empty, but got" + JSON.stringify(response.body)).to.be.empty;

  });

});

describe("PUT tests ", function () { //return;//

  const ignoreList = ["_id", "__v", "createdAt", "updatedAt", "DT_Update", "TM_Update", "kind"];
  const ignoreList2 = ["_id", "__v", "createdAt", "updatedAt", "DT_Update", "TM_Update", "kind", "TransactionId", "AccountSequenceNumber", "RoleTypeCode", "FormType"];
  const testURI = "/api/v1/Clients/All/Forms";
  const shortURI = "/api/v1/Clients/ABN/1234567890/Forms/myFT6Form/5432101";
  const shortURI2 = "/api/v1/Clients/ABN/1234567890/Forms/myFT6Form/5432102";
  const shortURI3 = "/api/v1/Clients/ABN/1234567890/Forms/myFT6Form/54321013";
  const shortURI4 = "/api/v1/Clients/ABN/1234567890/Forms/myFT6Form/54321014";

  const longURI = "/api/v1/Clients/ABN/1234567890/Accounts/1/Roles/IT/Forms/myFT6Form/5432101";
  const longURI2 = "/api/v1/Clients/ABN/1234567890/Accounts/1/Roles/IT/Forms/myFT6Form/5432102";
  const longURI3 = "/api/v1/Clients/ABN/1234567890/Accounts/1/Roles/IT/Forms/myFT6Form/54321013";
  const longURI4 = "/api/v1/Clients/ABN/1234567890/Accounts/1/Roles/IT/Forms/myFT6Form/54321014";
  const secretURI = "/api/v1/Clients/ABN/1234567890/Forms/myFT6Form/_id/"; //e.g 5c410abc35f35809ad24ba1b"
  const idMatchURI = "/api/v1/Clients/ABN/1234567890/FormIdentity/myFT6Form";

  const historyURI = "/api/v1/Clients/ABN/1234567890/FormsHistory";
  const historyURI4 = "/api/v1/Clients/ABN/1234567890/FormsHistory/54321014";

  it("Put 1 - Delete form " + shortURI + " result not checked as just cleanup", async function () {
    this.timeout(10000);
    myLog.debug("Put 1 - Delete form - cleanup");

    let response = await request(app).delete(shortURI);
    myLog.debug(`Put 1 - first delete - status code: ${response.statusCode}`);
    expect([200, 404]).to.include(response.statusCode);
    response = await request(app).delete(shortURI2);
    myLog.debug(`Put 1 - second delete - status code: ${response.statusCode}`);
    expect([200, 404]).to.include(response.statusCode);
    response = await request(app).delete(shortURI3);
    myLog.debug(`Put 1 - third delete - status code: ${response.statusCode}`);
    expect([200, 404]).to.include(response.statusCode);
    response = await request(app).delete(shortURI4);
    myLog.debug(`Put 1 - third delete - status code: ${response.statusCode}`);
    expect([200, 404]).to.include(response.statusCode);

  });

  it("Put 2 - Read " + longURI + " should return 404", async function () {
    this.timeout(10000);

    myLog.debug("Put 2 - Read ");

    request(app).get(longURI)
      .then(response => {
        expect(response.statusCode).to.equal(404);
      })

  });

  it("Put 3 - Delete form " + shortURI + " should return 404", async function () {
    this.timeout(10000);

    myLog.debug("Put 3 - Remove ");
    return request(app).delete(shortURI)
      .then(response => {
        expect(response.statusCode).to.equal(404);
      })
      .catch((reason) => { myLog.error(reason); });
  });

  it("Put 4 - Adding a new FORM with PUT " + longURI + " should return 201", async function () {
    this.timeout(10000);

    myLog.debug("Put 4 - Adding a new FORM with PUT");

    let postData = th.standardForm({ TransactionId: 5432101 });
    //set this up as if matched
    postData.subjectClient.MatchingStatus = "Matched";

    myLog.info("Put 4: About to put:" + JSON.stringify(postData));
    //let xx = require('fs').writeFileSync('./FactProcessing/Tests/PutTest4Data.json',JSON.stringify(postData));

    let response = await request(app).put(longURI)
      .set('Accept', 'application/json')
      .send(postData);

    myLog.debug(`Put 4 - TM_Update ${JSON.stringify(response.body.TM_Update)}`);

    expect(response.statusCode).to.equal(201);
    expect(response.body.subjectClient.MatchingStatus).to.equal("UnMatched");

    const lessThanOneMinuteAgo = (new Date() - new Date(response.body.updatedAt)) < 60000;
    expect(lessThanOneMinuteAgo).to.equal(true);

    postData.TransactionId = 5432101;
    postData.RoleTypeCode = 5;
    postData.FormType = "myFT6";

    expect(response.body).to.be.sameForm(postData, ignoreList);
  });

  it("Put 5 - Updating existing Form with PUT " + longURI3 + " should return 200", async function () {
    this.timeout(10000);
    myLog.debug("Put 5 - Updating existing Form with PUT");

    let response = await request(app).delete(shortURI3);
    myLog.debug(`Put 5 - delete - status code: ${response.statusCode}`);

    let postData = th.standardForm({ TransactionId: 54321013 });

    response = await request(app).put(longURI3)
      .set('Accept', 'application/json')
      .send(postData);
    if (response.statusCode !== 201) myLog.info(`Unexpected response code: ${response.statusCode}, text: ${response.text}`);
    expect(response.statusCode).to.equal(201);

    postData.Sections[1].LineItems[1].Value = "333 with more";
    postData.updatedAt = response.body.createdAt;
    postData.updatedAt = response.body.updatedAt;

    postData.DT_Update = response.body.DT_Update;
    postData.TM_Update = response.body.TM_Update;

    myLog.debug("Put 5: About to put:" + JSON.stringify(postData));
    response = await request(app).put(longURI3)
      .set('Accept', 'application/json')
      .send(postData);

    myLog.debug("Put 5: got back:" + JSON.stringify(response.body));

    expect(response.statusCode).to.equal(201);

    const lessThanOneMinuteAgo = (new Date() - new Date(response.body.updatedAt)) < 60000;
    expect(lessThanOneMinuteAgo).to.equal(true);

    postData.TransactionId = 54321013;
    postData.RoleTypeCode = 5;
    postData.FormType = "myFT6";

    expect(response.body).sameForm(postData, ignoreList);

    postData.updatedAt = response.body.createdAt;
    postData.updatedAt = response.body.updatedAt;

    postData.DT_Update = response.body.DT_Update;
    postData.TM_Update = response.body.TM_Update;

    response = await request(app).put(longURI3)
      .set('Accept', 'application/json')
      .send(postData);

    // await new Promise(resolve => setTimeout(resolve, 500));

  })

  it("Put 6 - Confirming identity of unmatched form " + idMatchURI + " should return 201", async function () {
    this.timeout(10000);
    myLog.debug("Put 6 - Confirming identity of unmatched form ");

    //Let's count how many unmatched 
    let response = await request(app).get(testURI);
    let unMatchedCount = response.body.reduce((total, item) => total += (
      !item.ClientInternalId &&
      item.subjectClient &&
      item.subjectClient.MatchingStatus == "UnMatched" &&
      item.subjectClient.ClientIdentifierType == "ABN" &&
      item.subjectClient.ClientIdentifierValue == 1234567890 &&
      item.FormType == "myFT6"
    ) ? 1 : 0, 0);

    expect(unMatchedCount).to.be.greaterThan(0);

    let postData = {
      ClientInternalId: 12345,
      subjectClient: {
        ClientIdentifierType: "ABN",
        ClientIdentifierValue: 1234567890,
        MatchingStatus: "Matched"
      },
      Sections: [{
        SectionId: "1",
        LineItems: [
          {
            FieldId: "1",
            Value: "1111's"
          },
          {
            FieldId: "2",
            Value: "222's"
          }
        ]
      }]
    }

    myLog.debug("About to put:" + JSON.stringify(postData));

    response = await request(app).put(idMatchURI)
      .set('Accept', 'application/json')
      .send(postData);

    if (response.statusCode !== 200) myLog.info(`Unexpected response code: ${response.statusCode}, text: ${response.text}`);

    expect(response.statusCode).to.equal(200);
    let modifiedRecords = response.body.results.nModified;
    expect(modifiedRecords).to.be.greaterThan(0)
    expect(response.body.message.substr(0, 8)).to.equal("Updated ")

    response = await request(app).get(testURI);
    unMatchedCount = response.body.reduce((total, item) => total += (
      !item.ClientInternalId &&
      item.subjectClient &&
      item.subjectClient.MatchingStatus == "UnMatched" &&
      item.subjectClient.ClientIdentifierType == "ABN" &&
      item.subjectClient.ClientIdentifierValue == 1234567890 &&
      item.FormType == "myFT6"
    ) ? 1 : 0, 0);

    let matchCount = response.body.reduce((total, item) => total += (
      item.ClientInternalId == 12345 &&
      item.subjectClient &&
      item.subjectClient.MatchingStatus == "Matched" &&
      item.subjectClient.ClientIdentifierType == "ABN" &&
      item.subjectClient.ClientIdentifierValue == 1234567890 &&
      item.FormType == "myFT6"
    ) ? 1 : 0, 0);
    expect(modifiedRecords).to.equal(matchCount);
  });

  it("Put 7 - Update failing optomistic locking " + longURI + ", should return 500", async function () {
    this.timeout(10000);
    myLog.debug("Put 7 - Updating failing optomistic locking ");

    // this test also checks unique index constraint on Transaction_Id

    let postData = th.standardForm({ TransactionId: 5432101, DT_Update: "2019-01-01", TM_Update: "5:59:07 PM" });

    let response = await request(app).put(longURI)
      .set('Accept', 'application/json')
      .send(postData);

    expect(response.statusCode).to.equal(409);
    expect(response.text).to.equal("There was a problem updating the form due to Duplicate Key (my guess it is an optomistic locking problem).");
  })

  it("Put 8 - Adding another form FORM with PUT " + longURI2 + " should return 201 with Matched ", async function () {
    this.timeout(10000);
    myLog.debug("Put 8 - Adding another form FORM with PUT ");
    let postData = th.standardForm({});
    postData.subjectClient.MatchingStatus = "Matched";

    myLog.debug("About to put:" + JSON.stringify(postData));

    let response = await request(app).put(longURI2)
      .set('Accept', 'application/json')
      .send(postData);

    if (response.statusCode !== 201) myLog.info(`Unexpected response code: ${response.statusCode}, text: ${response.text}`);

    if (response.body.createdAt == response.body.updatedAt)
      expect(response.statusCode).to.equal(201);
    else
      expect(response.statusCode).to.equal(200);

    const lessThanOneMinuteAgo = (new Date() - new Date(response.body.updatedAt)) < 60000;
    expect(lessThanOneMinuteAgo).to.equal(true);

    postData.ClientInternalId = 12345;
    postData.TransactionId = 5432102;
    postData.RoleTypeCode = 5;
    postData.FormType = "myFT6";

    expect(response.body.subjectClient.MatchingStatus).to.equal("Matched");

    expect(response.body).sameForm(postData, ignoreList);

  });

  it("Put 9 - Wrong Client Internal Id in body " + longURI2 + " should return 500 with error ", async function () {
    this.timeout(10000);
    myLog.debug("Put 9 - Wrong Client Internal Id in body ");
    let postData = th.standardForm({});
    postData.subjectClient = {};
    postData.subjectClient.ClientIdentifierType = "ABN";
    postData.subjectClient.ClientIdentifierValue = 1234567890;
    postData.subjectClient.MatchingStatus = "Matched";
    postData.ClientInternalId = 98765; //wrong id
    postData.DT_Update = new Date().toLocaleDateString();
    postData.TM_Update = new Date().toLocaleTimeString();

    myLog.debug("About to put:" + JSON.stringify(postData));

    let response = await request(app).put(longURI2)
      .set('Accept', 'application/json')
      .send(postData);

    expect(response.statusCode).to.equal(500);
    expect(response.text).to.equal(`Fatal Error: Cannot include ClientInternal Id in request.body if there is no prior "Matched" lodgment with that id (${postData.ClientInternalId})`);
  });

  it("Put 10 - Check History " + longURI4 + " should return 200", async function () {
    this.timeout(10000);
    myLog.debug("Put 10 - Checking out history records");

    let response = await request(app).delete(shortURI4);  // I don't have a API to delete history.
    myLog.debug(`Put 10 - delete - status code: ${response.statusCode}`);

    let postData = th.standardForm({ TransactionId: 54321013 });

    //count # of history records before update
    response = await request(app).get(historyURI4);
    let historyCount = response.body.length;
    if (response.statusCode == 404) historyCount = 0; else historyCount = response.body.length;
    //create a new record - no history exists, this won't create one.
    response = await request(app).put(longURI4)
      .set('Accept', 'application/json')
      .send(postData);
    expect(response.statusCode).to.equal(201, `Unexpected first put response code: ${response.statusCode}, text: ${response.text}`);

    postData.createdAt = response.body.createdAt;
    postData.updatedAt = response.body.updatedAt;
    postData.DT_Update = response.body.DT_Update;
    postData.TM_Update = response.body.TM_Update;

    postData.ClientInternalId = 12345;

    response = await request(app).get(historyURI4);
    expect((response.statusCode == 404 && historyCount == 0) || (response.statusCode == 200 && historyCount == response.body.length)).to.be.true;

    //1st update - creates first history entry
    response = await request(app).put(longURI4)
      .set('Accept', 'application/json')
      .send(postData);
    expect(response.statusCode).to.equal(200, `Unexpected 2nd put response code: ${response.statusCode}, text: ${response.text}`);

    postData.updatedAt = response.body.updatedAt;
    postData.DT_Update = response.body.DT_Update;
    postData.TM_Update = response.body.TM_Update;

    response = await request(app).get(historyURI4);
    expect(response.statusCode).to.equal(200);
    expect(response.body.length).to.equal(++historyCount, `2nd History Get Response body length ${response.body.length} not expected ${historyCount}`);
    expect(response.body[historyCount - 1].history).sameForm(postData, ignoreList2);
    // postData.updatedAt = response.body.createdAt;
    // postData.updatedAt = keepUpdateAt;
    // postData.DT_Update = keepDt_Update;
    // postData.TM_Update = keepTm_update;

    //2nd update - creates second history entry
    response = await request(app).put(longURI4)
      .set('Accept', 'application/json')
      .send(postData);
    if (response.statusCode !== 201) myLog.info(`Unexpected response code: ${response.statusCode}, text: ${response.text}`);
    debugger
    expect(response.statusCode).to.equal(200);
    response = await request(app).get(historyURI4);
    expect(response.statusCode).to.equal(200);
    expect(response.body.length).to.equal(++historyCount, `3rd History Get Response body length ${response.body.length} not expected ${historyCount}`);

    myLog.debug(`History contains: ${response.body.length} items`);
    myLog.log('History: ', response.body);

  })

})

// *****************************************************************************
// JSRE Tests
// *****************************************************************************
describe("STP tests", function () {
  this.timeout(10000);

  const realConsoleLog = console.log; //JSRE is poorely behaved and spews out log messages, so redirect them to myLog so I can manage it
  const realConsoleGroup = console.group
  before(function () {
    console.log = myLog.log;
    console.group = myLog.log
  });

  after(function () {
    // console.log = realConsoleLog;
    // console.group = realConsoleGroup;
  });

  const testPayrollURI = "/api/v1/Clients/All/Payrolls";

  const shortPayrollURI = "/api/v1/Clients/ABN/1234567890/Accounts/1/Roles/IT/Payrolls/10131Form";
  const deletePayrollURI = "/api/v1/Clients/ABN/1234567890/Accounts/1/Roles/IT/Payrolls/10131Form"
  const longPayrollURI = "/api/v1/Clients/ABN/1234567890/Accounts/1/Roles/IT/Payrolls/10131Form/111222333";
  const longPayrollURI2 = "/api/v1/Clients/TFN/1234567890/Accounts/1/Roles/IT/Payrolls/10131Form/111222333";
  const longURI = "/api/v1/Clients/ABN/1234567890/Accounts/1/Roles/IT/Forms/10131Form/111222333";
  const idMatchURI = "/api/v1/Clients/ABN/1234567890/FormIdentity/10131Form";
  const shortPrefillURI = "/api/v1/Clients/TFN/1234567890/Forms/prefillIITRForm";

  const ignoreList = ["_id", "__v", "createdAt", "updatedAt", "DT_Update", "TM_Update", "Sections", "field", "modified"];

  const realConsoleWarn = console.warn; //override console.warn because I'm not going to touch the jsre code and it is warning moment is depricated
  console.warn = myLog.warn;
  var stp = require('../FactProcessing/jsre/forms/oTH_PAYROLL_EVENT_CHILDValidate');
  console.warn = realConsoleWarn;

  //does 8 assertion checks
  function jsreDummyform() {
    let f = require("../FactProcessing/jsre/forms/oTH_PAYROLL_EVENT_CHILDForm.js");
    expect(f.id).to.equal(10131);
    expect(f.sections.length).to.equal(27);
    expect(f.validateRules.length).to.equal(88);
    //expect(f.validateBusinessRules.length).to.equal(88);
    expect(f.updateRules.length).to.equal(6);

    let re = require("../FactProcessing/loadRulesEngineWithPatches");
    expect(re.name).to.equal("RulesEngine");

    var stp = require('../FactProcessing/jsre/forms/oTH_PAYROLL_EVENT_CHILDValidate');
    expect(stp.name).to.equal("executeRules"); //not what you'd expect,is it!

    //LM fudge assumed globals until get the windows dependency removed
    const { addMissingBrowserStuff } = require("../FactProcessing/addMissingBrowserStuff");
    addMissingBrowserStuff();
    expect(console.group).to.be.ok;

    function ViewModel() { }
    let vm = new ViewModel();

    let th = require('./testingHelpers')
    vm = th.standardHeader({});
    vm = th.standardPayrollEventChild(vm, {});  //I didn't notice the provided sample form until after I did this.

    //LM interesting to note that no fields are required! ruleEngine.js lines 50 
    //LM there is a bug in rulesEngine.js line 163, it is trying to do a reduce over an object, not an array, hence not passing anything to GenVal.validate()!
    f[10956].validateRules[5].rule = function (e) { e.set(e.li(11128, 26142), 110); }
    //LM It is dodgy that these form rules are using "Lookup" on TF2Forms.
    //LM but we'll have access to the lodged STP forms, I guess there is no reason not to do it.
    //LM for the moment I'm just fudging it by returning '0' which I'm guessing means not found.
    f[60088].validateRules[1].rule = function (e) { e.set(e.li(60088, 19537), '0'); }

    //LM crashing in FdfValueOf - although current date is recorded as a string, it is trying to get it as a numeric - line 52
    //LM ...looking at constructor, if string this._numericValue = null; but here in FdfValueOf if numericValue is null it still calls getNumeric???
    let FdfValue = require("../FactProcessing/jsre/fdfValue");
    if (!FdfValue.prototype.oldValueOfFunc) {
      FdfValue.prototype.oldValueOfFunc = FdfValue.prototype.valueOf;
      FdfValue.prototype.valueOf = function () {
        return (this.type == "ALPHA") ? this._value : this.oldValueOfFunc();
      };
    }
    expect(FdfValue.name).to.equal("FdfValue");

    return vm;
  }

  function fudgeExpected(postData) {
    postData.TransactionId = 111222333;
    postData.ClientInternalId = 12345;
    delete postData.ClientIdentifierType;
    delete postData.ClientIdentifierValue;
    postData.AccountSequenceNumber = 1;
    postData.RoleTypeCode = 5;
    postData.FormType = "10131";
    postData.subjectClient = {
      MatchingStatus: "UnMatched",
      ClientIdentifierType: "ABN",
      ClientIdentifierValue: 1234567890
    }
    postData.kind = "10131Form";
    postData.ProcessingStatusCd = 1;

    return postData;
  }

  function fudgeResponse(responseBody) {
    delete responseBody['10955'];
    delete responseBody['10956'];
    delete responseBody['10958'];
    delete responseBody['11120'];
    delete responseBody['11121'];
    delete responseBody['11122'];
    delete responseBody['11123'];
    delete responseBody['11124'];
    delete responseBody['11125'];
    delete responseBody['11126'];
    delete responseBody['11127'];
    delete responseBody['11128'];
    delete responseBody['11306'];
    delete responseBody['11629'];
    delete responseBody['11630'];
    delete responseBody['11940'];
    delete responseBody['11941'];
    delete responseBody['12916'];
    delete responseBody['60088'];

    return responseBody;
  };
  // just test if can load form & rules engine
  it("STP 1 - STP Form loads", function () {
    myLog.info('STP 1 ------------------ start ------------------------ STP Form loads');

    const vm = jsreDummyform();
    expect(vm.formYear).to.equal("2019");
    expect(vm.oTH_WAGE_AND_TAX_ITEM_PaymentSummaryTotalGrossPaymentAmount()).to.equal(30000.3);
    const result = stp(vm);
    const didItWork = result.errors.length == 0;
    expect(didItWork).to.equal(true);
    expect(result.formLineItems[10936][26716]._value).to.equal("30000.3");
    //todo: add other expect statments around stored line items, but that'd mean I'd have to understand the business rules.
    myLog.info('STP 1 ------------------  end  ------------------------');
  });

  // just test if can load form & rules engine
  it("STP 2 - Check can invoke rules engine twice", function () {
    myLog.info('STP 2 ------------------ start ------------------------ Check can invoke rules engine twice');

    const vm = jsreDummyform();
    expect(vm.formYear).to.equal("2019");
    expect(vm.oTH_WAGE_AND_TAX_ITEM_PaymentSummaryTotalGrossPaymentAmount()).to.equal(30000.3);
    const result = stp(vm);
    const didItWork = result.errors.length == 0;
    expect(didItWork).to.equal(true);
    expect(result.formLineItems[10936][26716]._value).to.equal("30000.3");
    //todo: add other expect statments around stored line items, but that'd mean I'd have to understand the business rules.
    myLog.info('STP 2 ------------------  end  ------------------------');
  });

  it("STP 3 - Cleanup (Read & Remove) form " + shortPayrollURI + " result not checked as just cleanup", async function () {
    myLog.info('STP 3 ------------------ start ------------------------ Cleanup (Read & Remove) form')
    //get all forms
    debugger;
    let response = await request(app).get(testPayrollURI);
    myLog.info("Number of forms: " + response.body.length);
    expect(response.statusCode).to.equal(200, `Was expecting to find stuff to clean-up`);

    //filter to just the stp forms
    let deleteUrls = response.body.filter((f) => f.FormType == "10131" && f.subjectClient.ClientIdentifierType == "ABN" && f.subjectClient.ClientIdentifierValue == "1234567890").map(f => deletePayrollURI + "/" + f.TransactionId);

    //prepare to delete all the stp forms
    let promises = deleteUrls.map(async (t) => {
      await request(app)
        .delete(t)
        .then(response => {
          myLog.debug(`status code: ${response.statusCode} for: ${response.text}`);
          expect(response.statusCode).to.equal(200);
        })
    });

    //in parrallel delete all the STP forms
    await Promise.all(promises);
    debugger;

    myLog.info('STP 3 - STP forms deleted: ', deleteUrls.length);


    myLog.info('STP 3 ------------------  end  ------------------------');
  }); //end test

  it("STP 4 - List " + longURI + "Should return 404 OK", async function () {
    myLog.info('STP 4 ------------------ start ------------------------ List Should return 404 OK');

    let response = await request(app).get(longURI)


    expect(response.statusCode).to.equal(404);


    myLog.info('STP 4 ------------------  end  ------------------------');
  }); //end test

  it("STP 5 - Upsert a new FORM " + longPayrollURI + " should return 201", async function () {
    myLog.info('STP 5 ------------------ start ------------------------ Upsert a new FORM ');
    this.timeout(999999);
    debugger;

    const vm = jsreDummyform();

    expect(vm.formYear).to.equal("2019");
    const x = vm.oTH_WAGE_AND_TAX_ITEM_PaymentSummaryTotalGrossPaymentAmount();
    expect(x).to.equal(30000.3);

    let postData = {};
    stp.mapVMToLI(vm, postData);
    postData.updatedAt = new Date();
    postData.DT_Update = new Date().toLocaleDateString();
    postData.TM_Update = new Date().toLocaleTimeString();

    expect(postData[10936][26716]._value).to.equal("30000.3");

    //let yy = require('fs').writeFileSync('./FactProcessing/Tests/STPTestData.json', JSON.stringify(postData));

    let response = await request(app).put(longPayrollURI + "5")
      .set('Accept', 'application/json')
      .send(postData);

    if (response.body.createdAt == response.body.updatedAt)
      expect(response.statusCode).to.equal(201);
    else
      expect(response.statusCode).to.equal(200);

    expect(response.body.TransactionId).to.equal(1112223335);
    expect(response.body.subjectClient.MatchingStatus).to.equal("UnMatched");

    const lessThanOneMinuteAgo = (new Date() - new Date(response.body.updatedAt)) < 60000;
    expect(lessThanOneMinuteAgo).to.equal(true);

    //expect(response.body).toMatchObject(postData);  //this doesn't work because jsre changes the form

    const expected = fudgeExpected(postData);
    delete expected.ClientInternalId
    expected.TransactionId = 1112223335;
    const actual = fudgeResponse(response.body);

    expect(actual).sameForm(expected, ignoreList);
    myLog.info("Seems all good!!");
    // await new Promise(resolve => setTimeout(resolve, 1000)); //wait a second for any log messages to get written
    expect(true).to.equal(true);

    myLog.info('STP 5 ------------------  end  ------------------------');
  }); //end test

  it("STP 6 - Upsert another 3 new FORMs " + longPayrollURI + "7,8,9 should return 201", async function () {
    myLog.info('STP 6 ------------------ start ------------------------ Upsert another 3 new FORMs ');
    async function putForm(postData, suffix) {
      return request(app).put(longPayrollURI + suffix)
        .set('Accept', 'application/json')
        .send(postData);
    }
    try {

      const vm = jsreDummyform();
      let postData = {};
      stp.mapVMToLI(vm, postData);
      postData.updatedAt = new Date();
      postData.DT_Update = new Date().toLocaleDateString();
      postData.TM_Update = new Date().toLocaleTimeString();

      let r1, r2, r3;
      await Promise.all([
        (async () => r1 = await putForm(postData, "6"))(),
        (async () => r2 = await putForm(postData, "7"))(),
        (async () => r3 = await putForm(postData, "8"))(),
      ])

      myLog.info('R1 ' + r1.statusCode);
      myLog.info('R2 ' + r2.statusCode);
      myLog.info('R3 ' + r3.statusCode);
      expect(r1.statusCode).to.equal(201);
      expect(r2.statusCode).to.equal(201);
      expect(r3.statusCode).to.equal(201);

      myLog.debug("All checked out")

    } catch (error) {
      myLog.error(error)

    }
    myLog.info('STP 6 ------------------  end  ------------------------');
  }); //end test

  it("STP 7 - List " + shortPayrollURI + " should return 200", async function () {
    myLog.info('STP 7 ------------------ start ------------------------List should return 200');

    let response = await request(app).get(shortPayrollURI)
    expect(response.statusCode).to.equal(200);

    expect(response.body.length).to.be.greaterThan(0);
    expect(response.body[0].ClientInternalId).to.be.undefined;
    //verify all item returned have a ClientInternalId property with value 12345
    expect(response.body.reduce((total, item) => total += (item.subjectClient.ClientIdentifierValue == 1234567890) ? 1 : 0, 0)).to.equal(response.body.length);
    myLog.info("Number of forms: " + response.body.length);

    myLog.info('STP 7 ------------------  end  ------------------------');
  }); //end test

  it("STP 8 - List a single payroll " + longPayrollURI + " Should return 200 OK", async function () {
    myLog.info('STP 8 ------------------ start ------------------------ List a single payroll ');

    let response = await request(app).get(longPayrollURI + "5")
    expect(response.statusCode).to.equal(200);
    expect(response.body.length).to.be.greaterThan(0);
    expect(response.body[0].ClientInternalId).to.be.undefined;
    expect(response.body[0].subjectClient.ClientIdentifierValue).to.equal(1234567890);
    myLog.info("Number of forms: " + response.body.length);


    myLog.info('STP 8 ------------------  end  ------------------------');
  }); //end test

  it("STP 9 - Confirming identity of unmatched forms " + idMatchURI + " should return 201", async function () {
    myLog.info('STP 9 ------------------ start ------------------------ Confirming identity of unmatched forms ');

    let postData = {
      ClientInternalId: 12345,
      subjectClient: {
        ClientIdentifierType: "ABN",
        ClientIdentifierValue: 1234567890,
        MatchingStatus: "Matched"
      },
      "10932": {
        "25445": { _value: "1950-04-01" },
        "16561": { _value: "Blogs" },
        "16562": { _value: "Mary" },
        "16573": { _value: "1234" }
      }
    }

    myLog.debug("About to put:" + JSON.stringify(postData));

    let response = await request(app).put(idMatchURI)
      .set('Accept', 'application/json')
      .send(postData);

    expect(response.statusCode).to.equal(200);
    expect(response.body.results.n).to.equal(4);
    expect(response.body.results.nModified).to.equal(4);
    expect(response.body.message.substr(0, 8)).to.equal("Updated ");
    expect(response.body.message).to.equal("Updated 4 of 4 matches");
    myLog.info("Number of modified forms: " + response.body.results.nModified, response.body.results);

    myLog.info('STP 9 ------------------  end  ------------------------');
  }); //end test

  it("STP 10 - Upsert another new FORM now should be matched " + longPayrollURI + " should return 201 & matched", async function () {
    myLog.info('STP 10 ------------------ start ------------------------ Upsert another new FORM now should be matched ');

    const vm = jsreDummyform();
    let postData = {};
    stp.mapVMToLI(vm, postData);
    postData.updatedAt = new Date();
    postData.DT_Update = new Date().toLocaleDateString();
    postData.TM_Update = new Date().toLocaleTimeString();

    let response = await request(app).put(longPayrollURI + "10")
      .set('Accept', 'application/json')
      .send(postData);

    expect(response.statusCode).to.equal(201);
    expect(response.body.subjectClient.MatchingStatus).to.equal("Matched");

    myLog.debug("All checked out")

    myLog.info('STP 10 ------------------  end  ------------------------');
  }); //end test

  it("STP 11 - List " + longPayrollURI + " Should return 200 OK", async function () {
    myLog.info('STP 11 ------------------ start ------------------------ List Should return 200 OK');

    let response = await request(app).get(longPayrollURI + "5")

    expect(response.statusCode).to.equal(200);
    expect(response.body[0].ClientInternalId).to.equal(12345);
    expect(response.body.length).to.be.greaterThan(0);
    //verify all item returned have a ClientInternalId property with value 12345
    expect(response.body.reduce((total, item) => total += (item.ClientInternalId == 12345) ? 1 : 0, 0)).to.equal(response.body.length);
    expect(response.body[0][10936][26716]._value).to.equal(30000.3);
    myLog.info("Number of forms: " + response.body.length);

    myLog.info('STP 11 ------------------  end  ------------------------');
  }); //end test

  it("STP 12 - Serialised insert & remove form " + shortPayrollURI + " to check awaits are in correct place", async function () {
    myLog.info('STP 12 ------------------ start ------------------------ Serialised insert & remove form ')
    const vm = jsreDummyform();
    let postData = {};
    stp.mapVMToLI(vm, postData);
    postData.updatedAt = new Date();
    postData.DT_Update = new Date().toLocaleDateString();
    postData.TM_Update = new Date().toLocaleTimeString();
    debugger;
    let response;
    for (let suffix = 12; suffix < 15; suffix++) {
      response = await request(app).put(longPayrollURI + suffix).set('Accept', 'application/json').send(postData);
      myLog.info('Created payroll with  ' + suffix + " " + response.statusCode);
    };
    for (let suffix = 12; suffix < 15; suffix++) {
      response = await request(app).delete(deletePayrollURI + "/" + 111222333 + suffix);
      expect(response.statusCode).to.equal(200);
    };

    myLog.info('STP 12 ------------------  end  ------------------------');
  }); //end test

  it("STP 13 - Delete all the created forms 111222333 5-10", async function () {
    myLog.info('STP 13 ------------------ start ------------------------ Delete all the created forms 111222333 5-10 ')

    //Clean-up - delete existing form
    let suffixes = [5, 6, 7, 8, 9, 10];
    await Promise.all(
      suffixes.map((v, i, a) => (async () => a[i] = await request(app).delete(deletePayrollURI + "/" + 111222333 + v))()))

    suffixes.map((v, i, a) => expect(v.statusCode).to.be.oneOf([200, 404], `Entry ${i} is ${v.statusCode} and not one of [200,404]`));

    myLog.info('STP 13 ------------------  end  ------------------------');
  }); //end test

  it("STP 14 - Optimistic locking check ", async function () {
    myLog.info('STP 14 ------------------ start ------------------------ wait')

    let r1;
    r1 = await request(app).delete(longPayrollURI + "15");
    expect(r1.statusCode).to.be.oneOf([200, 404]);
    if (r1.statusCode == 200)
      expect(r1.text).to.equal("Form deleted - with keys {\"FormType\":\"10131\",\"TransactionId\":11122233315,\"subjectClient.ClientIdentifierType\":\"ABN\",\"subjectClient.ClientIdentifierValue\":1234567890}");
    else
      expect(r1.text).to.equal("Form not found - for delete operation with keys: {\"FormType\":\"10131\",\"TransactionId\":11122233315,\"subjectClient.ClientIdentifierType\":\"ABN\",\"subjectClient.ClientIdentifierValue\":1234567890}");

    await new Promise(resolve => setTimeout(resolve, 1000)); //give a sec for the delete to finish

    const vm = jsreDummyform();
    let postData = {};
    stp.mapVMToLI(vm, postData);
    //we will use these date/time to try to find an existing record; but we deleted it, so won't be found
    postData.updatedAt = new Date();
    postData.DT_Update = new Date().toLocaleDateString();
    postData.TM_Update = new Date().toLocaleTimeString();
    //need to delay 1 sec so the new record has a later date/time to just populated 
    await new Promise(resolve => setTimeout(resolve, 1000));
    myLog.debug(`Optimistic locking check: Create with DT_Update: ${postData.DT_Update}, TM_Update: ${postData.TM_Update} `);
    r1 = await request(app).put(longPayrollURI + "15").set('Accept', 'application/json').send(postData);
    expect(r1.statusCode).to.equal(201);
    let rememberedDate = r1.body.DT_Update, rememberedTime = r1.body.TM_Update;
    myLog.debug(`Optimistic locking check: Went in with body: DT_Update: ${postData.DT_Update}, TM_Update: ${postData.TM_Update} `);
    myLog.debug(`Optimistic locking check: After udate have: DT_UpdateReturned with Date: ${r1.body.DT_Update}, TM_Update: ${r1.body.TM_Update} `);
    postData.updatedAt = new Date();
    postData.DT_Update = r1.body.DT_Update;
    postData.TM_Update = r1.body.TM_Update;
    await new Promise(resolve => setTimeout(resolve, 1000));
    r1 = await request(app).put(longPayrollURI + "15").set('Accept', 'application/json').send(postData);
    expect(r1.statusCode).to.equal(201) //********ths is wrong!!!!!!!!!! */
    //now when we execute another update, the date/time in the body from the first PUT (the create) not the subsequent update.
    r1 = await request(app).put(longPayrollURI + "15").set('Accept', 'application/json').send(postData);
    myLog.debug(`Optimistic locking check: Returned with (should be undefiend) - DT_Update: ${r1.body.DT_Update}, TM_Update: ${r1.body.TM_Update} `);
    expect(r1.statusCode).to.equal(409, ` Read should have used DT_Update: ${postData.DT_Update}, TM_Update: ${postData.TM_Update} but doesn't match DT_Update: ${r1.body.DT_Update}, TM_Update: ${r1.body.TM_Update} so should have vailed leading to a failed attempt to add a conflicting record. `);
    expect(r1.text).to.equal("There was a problem updating the form due to Duplicate Key (my guess it is an optomistic locking problem).");

    myLog.info('STP 14 ------------------  end  ------------------------');
  });
  it("STP 15 - History check ", async function () {
    myLog.info('STP 14 ------------------ start ------------------------ wait')
    this.timeout(999999);
    debugger;

    let r1;
    r1 = await request(app).get(shortPrefillURI);
    expect([200, 404]).to.include(r1.statusCode);
    if (r1.statusCode == 200) {
      let oldTranId = r1.body[0].TransactionId;
      r1 = await request(app).delete(shortPrefillURI + "/" + oldTranId);
      expect(r1.statusCode).to.equal(200);
    }

    r1 = await request(app).delete(longPayrollURI2 + "16");
    expect(r1.statusCode).to.be.oneOf([200, 404]);
    if (r1.statusCode == 200)
      expect(r1.text).to.equal("Form deleted - with keys {\"FormType\":\"10131\",\"TransactionId\":11122233316,\"subjectClient.ClientIdentifierType\":\"TFN\",\"subjectClient.ClientIdentifierValue\":1234567890}");
    else
      expect(r1.text).to.equal("Form not found - for delete operation with keys: {\"FormType\":\"10131\",\"TransactionId\":11122233316,\"subjectClient.ClientIdentifierType\":\"TFN\",\"subjectClient.ClientIdentifierValue\":1234567890}");

    await new Promise(resolve => setTimeout(resolve, 1000)); //give a sec for the delete to finish

    const vm = jsreDummyform();
    let postData = {};
    stp.mapVMToLI(vm, postData);
    //we will use these date/time to try to find an existing record; but we deleted it, so won't be found
    postData.updatedAt = new Date();
    postData.DT_Update = new Date().toLocaleDateString();
    postData.TM_Update = new Date().toLocaleTimeString();
    r1 = await request(app).put(longPayrollURI2 + "16").set('Accept', 'application/json').send(postData);
    expect(r1.statusCode).to.equal(201);

    postData.createdAt = r1.body.createdAt;
    postData.updatedAt = r1.body.updatedAt;
    postData.DT_Update = r1.body.DT_Update;
    postData.TM_Update = r1.body.TM_Update;
    r1 = await request(app).put(longPayrollURI2 + "16").set('Accept', 'application/json').send(postData);
    expect(r1.statusCode).to.equal(200) 

    postData.updatedAt = r1.body.updatedAt;
    postData.DT_Update = r1.body.DT_Update;
    postData.TM_Update = r1.body.TM_Update;
    postData[10932][16558] = 222;
    r1 = await request(app).put(longPayrollURI2 + "16").set('Accept', 'application/json').send(postData);
    expect(r1.statusCode).to.equal(200);

    postData.updatedAt = r1.body.updatedAt;
    postData.DT_Update = r1.body.DT_Update;
    postData.TM_Update = r1.body.TM_Update;
    postData[10932][16558] = 111;
    r1 = await request(app).put(longPayrollURI2 + "16").set('Accept', 'application/json').send(postData);
    expect(r1.statusCode).to.equal(200);

    postData.updatedAt = r1.body.updatedAt;
    postData.DT_Update = r1.body.DT_Update;
    postData.TM_Update = r1.body.TM_Update;
    postData[10933][16582]._value = '2019-01-23'
    r1 = await request(app).put(longPayrollURI2 + "16").set('Accept', 'application/json').send(postData);
    expect(r1.statusCode).to.equal(200);

    let response = await request(app).get(shortPrefillURI);
    expect(response.statusCode).to.equal(200);
    expect(response.body.length).to.equal(1);
    expect(response.body[0].facts.length).to.equal(2);
    expect(response.body[0].facts[0]["Payee Details"]["oTH_PAYEE_DTLS_CurrentPayerPayeeRelationshipPayeePayrollIdentifier"]).to.equal('111');
    expect(response.body[0].facts[0]["Payroll Event"]["oTH_PAYROLL_EVNT_PayrollEventPeriodEndDate"]).to.eq("2019-01-23T00:00:00.000Z");
    expect(response.body[0].facts[1]["Payee Details"]["oTH_PAYEE_DTLS_CurrentPayerPayeeRelationshipPayeePayrollIdentifier"]).to.equal('222');
    expect(response.body[0].facts[1]["Payroll Event"]["oTH_PAYROLL_EVNT_PayrollEventPeriodEndDate"]).to.eq("2019-01-22T00:00:00.000Z");

    myLog.info('STP 15 ------------------  end  ------------------------');
  });
});

describe("AMQP Tests", function () {
  this.timeout(10000);
  const amqpListenerPartURI = "/api/v1/AMQPListener";
  it("AMQP 1 - Delete queues about to be used in tests", async function () {
    myLog.debug("AMQP 1 - Delete queues about to be used in tests");
    var msg = 'Hello World!_' + new Date().toLocaleTimeString();

    let channel = await amqpSend.amqpOpenChannel("BISBRSTP", "ICStep1-Request");
    await new Promise(resolve => setTimeout(resolve, 100));
    amqpSend.channel.deleteQueue("BISBRSTP.ICStep1-Request");
    await new Promise(resolve => setTimeout(resolve, 100));
    amqpSend.channel.deleteQueue("BISBRSTP.ICStep3-Response");
    await new Promise(resolve => setTimeout(resolve, 100));


    amqpSend.channel.deleteQueue("BITest.ICTest");
    await new Promise(resolve => setTimeout(resolve, 100));
    amqpSend.channel.deleteQueue("BITest.ICTest.T0");
    await new Promise(resolve => setTimeout(resolve, 100));
    amqpSend.channel.deleteQueue("BITest.ICTest.T1");
    await new Promise(resolve => setTimeout(resolve, 100));
    amqpSend.channel.deleteQueue("BITest.ICTest.T2");
    await new Promise(resolve => setTimeout(resolve, 100));
    amqpSend.channel.deleteQueue("BITest.ICTest.T3");
    await new Promise(resolve => setTimeout(resolve, 100));

    await amqpReceive.closeAMQPConnection(amqpSend.channel);
    amqpSend.channel = null;
    myLog.debug("Deleted 7 queues used in tests: 2 x BISBRSTP.* and 5 x BITEST.ICTEST.*")
    await new Promise(resolve => setTimeout(resolve, 500));

  });
  it("AMQP 2 - Send & Receive dummy message directly talking to AMQPLib", async function () {
    myLog.debug("AMQP 2 - Send & Receive dummy message via amqplib");
    let amqp = require('amqplib');
    debugger;
    let exchange = "BITest";
    let queue = exchange + '.ICTest';
    let routingKey = "*.*.*";
    let connection = await amqp.connect(process.env.CLOUDAMQP_URL);
    connection.on('error', function (err) { myLog.debug(`Bummer dude, got error ${err}`) });
    let channel = await connection.createChannel();
    connection.on('error', function (err) { myLog.debug(`Bummer dude, got error ${err}`) });
    await channel.assertQueue(queue, { durable: true });
    await channel.assertExchange(exchange, 'topic', { durable: true });
    await channel.bindQueue(queue, exchange, queue + ".#");  //routing key starts with queue: BIxxxx.ICxxxx but may include other stuff or a wildcard

    channel.prefetch(1);

    let consumeResult = await channel.consume(queue, async (m) => {
      myLog.debug(`Here is the message: ${JSON.stringify(m.content.toString())}, corrId: ${m.properties.correlationId}, replyTo: ${m.properties.replyTo}`);
      await new Promise(resolve => setTimeout(resolve, 300));  //give 1/3 sec to pretend to process msg
      channel.ack(m);
    }, { noAck: false });
    myLog.debug(`Message consumer running,  details are:`, consumeResult);

    for (let i = 0; i < 2; i++) {
      let data = Buffer.from("How now brown cow" + Date.now());
      let goodSendResult = await channel.publish(exchange, queue + ".fred", data, { persistent: true, mandatory: true, replyTo: 'nowwheresVill', correlationId: Date.now().toString() });
      myLog.debug(`Message ${i} published ${goodSendResult}`);
    }
    let data = Buffer.from("How now brown cow" + Date.now());
    let badSendResult = await channel.publish(exchange, "crapola", data, { persistent: true, mandatory: true }); //this just gets lost even though I have mandatory & an on error handler.
    myLog.debug(`Published message lost ${badSendResult}`);

    await new Promise(resolve => setTimeout(resolve, 1000));  //give a sec to process messages before closing connection 
    connection.close();

    await new Promise(resolve => setTimeout(resolve, 1000));


  });
  it("AMQP 3 - Send & Receive dummy message", async function () {
    this.timeout(20000);
    myLog.debug("AMQP 3 - Send & Receive dummy message via my code");
    var msg = 'Hello World!_' + new Date().toLocaleTimeString();

    await amqpSend.amqpSendMessage("BITest", "ICTest", Buffer.from(msg + "_0"), null, null, amqpSend.messageProperties);
    await new Promise(resolve => setTimeout(resolve, 100));  //give 1/2 sec for connection to close
    amqpSend.channel.deleteQueue("BITest.ICTest");
    await new Promise(resolve => setTimeout(resolve, 100));
    amqpSend.channel.deleteQueue("BITest.ICTest.T0");
    await new Promise(resolve => setTimeout(resolve, 100));
    amqpSend.channel.deleteQueue("BITest.ICTest.T1");
    await new Promise(resolve => setTimeout(resolve, 100));
    amqpSend.channel.deleteQueue("BITest.ICTest.T2");
    await new Promise(resolve => setTimeout(resolve, 100));
    amqpSend.channel.deleteQueue("BITest.ICTest.T3");
    await new Promise(resolve => setTimeout(resolve, 100));

    await amqpSend.amqpSendMessage("BITest", "ICTest", Buffer.from(msg + "_1"), null, "BITest.ICTest", amqpSend.messageProperties); //resend
    await new Promise(resolve => setTimeout(resolve, 100));

    await amqpSend.amqpSendMessage("BITest", "ICTest", Buffer.from(msg + "_topic t0, _2"), "BITest.ICTest.T0"); //there is no ...T0 queue, so message will be dropped
    await amqpSend.amqpSendMessage("BITest", "ICTest", Buffer.from(msg + "_3"));
    await amqpReceive.closeAMQPConnection(amqpSend.channel); //close the channel to show it doesn't break anything
    await new Promise(resolve => setTimeout(resolve, 500));

    amqpSend.channel = null;
    await amqpSend.amqpSendMessage("BITest", "ICTest", Buffer.from(msg + "_topic t0, _4"), "BITest.ICTest.T0"); //there is no ...T0 so it wil create it because channel is null
    await amqpSend.amqpSendMessage("BITest", "ICTest", Buffer.from(msg + "_topic t0, _5"), "BITest.ICTest.T0", "*.*.T0");  //this will create the another binding
    await amqpSend.amqpSendMessage("BITest", "ICTest", Buffer.from(msg + "_topic t0, _6"), "BITest.ICTest.T0");
    await amqpSend.amqpSendMessage("BITest", "ICTest", Buffer.from(msg + "_topic t1, _7"), "BITest.ICTest.T1", "*.*.T1"); //this will create the binding and as a sideeffect create the queue 
    amqpSend.channel = null;  //just demoing a null channel doesn't hurt, just does more work
    await amqpSend.amqpSendMessage("BITest", "ICTest", Buffer.from(msg + "_8"));
    await amqpSend.amqpSendMessage("BITest", "ICTest", Buffer.from(msg + "_topic t2, _9"), "BITest.ICTest.T2"); //there is no ...T2 queue, so this message will get lost
    amqpSend.channel = null;
    await amqpSend.amqpSendMessage("BITest", "ICTest.T3", Buffer.from(msg + "_topic t3, _10"), null, '#'); //another way of creating a queue and binding everything to it.
    await new Promise(resolve => setTimeout(resolve, 5000));  //give for 1/2 sec messages to get there

    let count = 0;
    let OK = true;
    myVerifier = async (msg) => {
      myLog.debug(`msg: ${msg.content.toString()} returned`)
      count++;
      OK = OK && msg.content.toString().substr(0, 7) == "Hello W"
      await new Promise(resolve => setTimeout(resolve, 100));  //give 1/10 sec to pretend to process msg
      amqpReceive.channel.ack(msg);
    };

    debugger;
    amqpReceive.channel = amqpSend.channel;
    amqpReceive.amqpGetMessages("BITest", "ICTest.T0", myVerifier);
    await new Promise(resolve => setTimeout(resolve, 500));  //give 1/2 sec for connection to close (has pretend processing time)
    expect(count).to.equal(3);
    expect(OK).to.be.true;

    await amqpReceive.closeAMQPConnection(amqpSend.channel); //close the channel to show it doesn't break anything
    await new Promise(resolve => setTimeout(resolve, 500));

    count = 0;
    amqpSend.channel = null
    amqpReceive.channel = null

    await amqpReceive.amqpGetMessages("BITest", "ICTest.T1", myVerifier);

    expect(count).to.equal(1);
    expect(OK).to.be.true;

    await new Promise(resolve => setTimeout(resolve, 500));  //give 1/2 sec to finish off processing messages before setting channel to null

    amqpReceive.channel = null;
    count = 0;
    await amqpReceive.amqpGetMessages("BITest", "ICTest", myVerifier);

    expect(count).to.equal(3);
    expect(OK).to.be.true;

    count = 0;
    amqpReceive.safe = true;
    await amqpReceive.amqpGetMessages("BITest", "ICTest.T2", myVerifier)

    expect(count).to.equal(0);
    expect(OK).to.be.true;

    count = 0;
    amqpReceive.safe = true;
    await amqpReceive.amqpGetMessages("BITest", "ICTest.T3", myVerifier)

    expect(count).to.equal(1);
    expect(OK).to.be.true;

    myLog.debug('Waiting 1 sec to make sure all 8 messages are handled.')
    await new Promise(resolve => setTimeout(resolve, 1000));

  });
  it("AMQP 4 - Turn XML into JSON", async function () {
    myLog.debug("AMQP 4 - Turn XML into JSON");
    var xml2js = require('xml2js');
    var xml = '<doc><foo att="3" >hi</foo><bar>there</bar><blah>33</blah><blah><harh/>34</blah></doc>';
    myLog.debug("Input is:", xml);

    // let xml = require('fs').readFileSync('./FactProcessing/Tests/PAYEVNTEMP_Submit_Cleanskin_child_001.xml').toString();
    debugger;
    var parser = new xml2js.Parser(/* options */);
    let result = await parser.parseStringPromise(xml)
      .catch(err => { console.error('bummer', err); expect(err).toBeUndefined() });
    myLog.debug("Output is:", JSON.stringify(result));
    expect(result).to.deep.equal({ "doc": { "foo": [{ "_": "hi", "$": { "att": "3" } }], "bar": ["there"], "blah": ["33", { "_": "34", "harh": [""] }] } });

  });
  it("AMQP 5 - Load bad xml example to check it is handled", async function () {
    myLog.debug("AMQP 5 - Load SBR xml example");
    debugger;
    var xml2js = require('xml2js');
    var xml = '<doc><foo att="3" >hi</foo><bar>there</bar><blah>33</blah><blah><harh/>34<boo></blah></doc>';

    var parser = new xml2js.Parser(/* options */);

    // Expect the unexpected, Test that the error message says "close tag" somewhere: these are equivalent
    let spanishInquistion = await parser.parseStringPromise(xml)
      .catch(err => {
        expect(err.toString()).to.include('Unexpected close tag');
        return "As expected, the unexpected was caught and expected";
      });

    expect(spanishInquistion).to.be.equal("As expected, the unexpected was caught and expected");

  });
  it("AMQP 6 - Demonstrate loading SBR Payroll Event XML with added Payer & Transmission details", async function () {
    myLog.debug("AMQP 6 - Demonstrate loading SBR Payroll Event XML with added Payer & Transmission details");

    var xml2js = require('xml2js');
    let xml = require('fs').readFileSync('./test/SBR_PAYEVNTEMP_with_File_and_Payer_Details.xml').toString();
    debugger;
    var parser = new xml2js.Parser(/* options */);
    let jsonObj = await parser.parseStringPromise(xml)
      .catch(err => {
        console.error('bummer', err);
        expect(err).toBeUndefined()
      });
    let result = jsonObj.toString().replace('tns:', '');
    myLog.debug("Result is:", result);

    expect(result).to.be.ok;

  });
  it("AMQP 7 - Transform SBR to JSRE", async function () {
    myLog.debug("AMQP 7 - Transform SBR to JSRE");

    debugger;
    var xml2js = require('xml2js');
    let xml = require('fs').readFileSync('./test/SBR_PAYEVNTEMP_with_File_and_Payer_Details.xml').toString().replace(/tns:/gi, '');

    var parser = new xml2js.Parser(/* options */);
    let sbrJson = await parser.parseStringPromise(xml)
      .catch(err => {
        console.error('bummer', err);
        expect(err).to.not.be.OK;
      });

    let formSpecific = require('../FactProcessing/form/factSpecific/UniqueFormRules_10131Form');
    let jsreJson = formSpecific.transformFromSBR(sbrJson);

    expect(jsreJson.DT_Update).to.equal(sbrJson.PAYEVNTEMP.Transmission[0].TransmissionD[0]);
    expect(jsreJson.Transmission.BetNumber).to.equal(sbrJson.PAYEVNTEMP.Transmission[0].BusinessEventTrackingN[0]);
    expect(jsreJson[10932][16560]).to.equal(sbrJson.PAYEVNTEMP.Payee[0].Identifiers[0].TaxFileNumberId[0]);
    expect(jsreJson[10936][15453][0]).to.equal(sbrJson.PAYEVNTEMP.Payee[0].PayrollPeriod[0].RemunerationCollection[0].Remuneration[0].EmploymentTerminationPaymentCollection[0].EmploymentTerminationPayment[0].IncomeTaxPayAsYouGoWithholdingTypeC[0]);
    expect(jsreJson[11303][28352]).to.equal("");
    myLog.debug("Result is:", jsreJson);

  });
  it("AMQP 8 - Send 3 SBR Payroll messages via AMQP", async function () {
    myLog.debug("AMQP 8 - Send 3 SBR Payroll messages via AMQP");
    await new Promise(resolve => setTimeout(resolve, 1000));

    this.timeout(88888);

    //Clean-up - delete existing form
    let r1, r2, r3;
    await Promise.all([
      (async () => r1 = await request(app).delete("/api/v1/Clients/TFN/151994349/Forms/10131Form/1234567890123"))(),
      (async () => r2 = await request(app).delete("/api/v1/Clients/TFN/151994349/Forms/10131Form/1234567890124"))(),
      (async () => r3 = await request(app).delete("/api/v1/Clients/TFN/151994349/Forms/10131Form/1234567890125"))()
    ])
    expect((r1.statusCode == 200 || r1.statusCode == 404) && (r2.statusCode == 200 || r2.statusCode == 404) && (r3.statusCode == 200 || r3.statusCode == 404), "delete are expected to be status code 200 or 404").to.be.true;

    myLog.debug(`Deleted old forms, now about to read payload from file`);

    let sbrForm = require('fs').readFileSync('./test/SBR_PAYEVNTEMP_with_File_and_Payer_Details.xml').toString();
    let data = Buffer.from(sbrForm);
    amqpSend.channel = null;
    myLog.debug('Sending 1st message');
    await amqpSend.amqpSendMessage("BISBRSTP", "ICStep1-Request", data, null, "BISBRSTP.ICStep1-Request");

    let oldBet = "<BusinessEventTrackingN>1234567890123</BusinessEventTrackingN>";
    let newBet = "<BusinessEventTrackingN>1234567890124</BusinessEventTrackingN>";
    sbrForm = sbrForm.replace(oldBet, newBet);
    data = Buffer.from(sbrForm);
    myLog.debug('Sending 2nd message');
    await amqpSend.amqpSendMessage("BISBRSTP", "ICStep1-Request", data);

    //after 2 secs send another message
    setTimeout(function () {
      myLog.debug('sending another message after 2 secs');
      let newnewBet = "<BusinessEventTrackingN>1234567890125</BusinessEventTrackingN>";
      sbrForm = sbrForm.replace(newBet, newnewBet);
      data = Buffer.from(sbrForm);
      myLog.debug('Sending 3rd message after waiting 2 sec');
      amqpSend.amqpSendMessage("BISBRSTP", "ICStep1-Request", data);
    });

    await new Promise(resolve => setTimeout(resolve, 100));  //give 1/2 sec for connection to close
    //start the AMQP listener
    let url = "/api/v1/AMQPListener/Payrolls/1"
    let response = await request(app).put(url)
      .set('Accept', 'application/json')
      .send({ listenerDuration: 3000, listenerKeys: "" });

    expect(response.statusCode).to.equal(201);
    myLog.debug(`Response text: ${response.text}`);
    expect(response.text).to.equal("Closed AMQPListener, number of messages processed: 3")

    // set up listener
    debugger;
    let count = 0, OK = true;
    msgHandler = (msg) => {
      myLog.debug(`Msg ${count}: ${msg.content.toString().substr(0, 100)}... returned!`)
      count++;
      debugger;
      OK = OK && msg.content.toString().substr(0, 18) == '{"statusCode":201,'
      amqpReceive.channel.ack(msg);
    };

    amqpReceive.channel = null;
    myLog.debug(`Starting listern`);
    amqpReceive.amqpGetMessages("BISBRSTP", "ICStep3-Response", msgHandler);

    await new Promise(resolve => setTimeout(resolve, 500));  //give 1/2 sec for messages to be handled
    expect(count).to.equal(3, "Didn't get back expected number of messages");
    expect(OK).to.be.true;
    await amqpReceive.closeAMQPConnection();
    await new Promise(resolve => setTimeout(resolve, 500));  //give 1/2 sec for connection to close

  });
  it("AMQP 9 - Create AMQP Listener that gets no messages", async function () {
    myLog.debug("AMQP 9 - Create AMQP Listener that gets no messages");

    this.timeout(77777);
    debugger
    amqpSend.channel = null;
    await amqpSend.amqpOpenChannel("BISBRSTP", "ICStep1-Request");
    await new Promise(resolve => setTimeout(resolve, 100));
    amqpSend.channel.deleteQueue("BISBRSTP.ICStep1-Request");
    await new Promise(resolve => setTimeout(resolve, 100));
    amqpSend.channel.deleteQueue("BISBRSTP.ICStep3-Response");
    await new Promise(resolve => setTimeout(resolve, 100));
    await amqpSend.closeAMQPConnection();
    myLog.debug(`Deleted 3 queues so everything starts out nice`);

    // amqpSend.channel=null;
    await new Promise(resolve => setTimeout(resolve, 1000));

    let state = 1;
    debugger;

    myLog.debug(`Creating listener`);
    request(app)
      .put(amqpListenerPartURI + '/Payrolls/1')
      .set('Accept', 'application/json')
      .send({ listenerDuration: 10000 }) //will listen for 10 seconds
      .then(async (response) => {
        myLog.debug(`Returned from creating listener: ${response.text}`);
        expect(response.text).to.equal("Closed AMQPListener, number of messages processed: 0")
        expect(state).to.equal(1); //after timeout period should come here
        state = 2;
      })
    debugger;
    let count = 0;
    let OK = true;
    payrollResponseListener = (msg) => {
      myLog.debug(`msg: ${msg.content.toString()} returned!`)
      count++;
      OK = OK && msg.content.toString().substr(0, 7) == "Hello W"
      amqpReceive.channel.ack(msg);
    };

    await amqpReceive.amqpGetMessages("BISBRSTP", "ICStep3-Response", payrollResponseListener) //receive responses in JSON - because it's new
    // await amqpReceive.closeAMQPConnection(amqpReceive.channel);  //this should fail
    await new Promise(resolve => setTimeout(resolve, 10000));
    expect(state).to.equal(2);

  });
});
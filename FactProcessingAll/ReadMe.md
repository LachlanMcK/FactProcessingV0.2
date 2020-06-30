Purpose
=======
A PoC to demonstrate how easy it would be to process informational forms in the cloud and thus save large amounts of mainframe MIPS.  Hopefully will be evolved over time to a real solution.

## To run this soluiton:

1. clone repository
    * add oTH_PAYROLL_EVENT_CHILDForm.js & 
    * add .env files (have a squiz at .env-sample 
      * this points to mongo, so either install Mongo (see below) or point to a MongoLab installation

2. npm install (to down load the latest dependencies)
	* make sure you do this from inside the "forms" subdirectory (this is where the package.json file lives)
3. change directory to directory that contains tsconfig.json (i.e. .../FactProcessingAll/FactProcessing )
4. npm run test

## Structure of solution

As you will see, the structure needs a bit of a tidy-up and rename (I call things forms & not facts - oops).

* ./lambda.js (hooks up to aws lambda)

* ./FactProcessing/* - the main directory for the solution to deliver Fact Processing, of note are:
  * ./FactProcessing/server.js - is the initial entry
  * ./FactProcessing/app.js - sets up app level express routes.  There is only one app level route: '/api/v1/Clients' which talks to the FormController
  * ./FactProcessing/db.js - connects to the database
  * ./FactProcessing/(addMissingBrowserStuff.js | dependenciesMap.js | loadRulesEngineWithPatches.js) - mostly point in time work around

 * ./FactProcessing/Payroll/* - contains componets of the solution specific to handling the Payroll Product.  This shouldn't live under "FactProcessing" - oh well.

 * ./FactProcessing/jsre/* - all the jsre code
   * ./FactProcessing/jsre/form/* - the generated form defintion
   * ./FactProcessing/jsre/externalFunctions/* - self explanatory

 * ./FactProcessing/Security/* - not yet implemented but imagined to be express middleware to hook into ISF/AM and other security related things.
 * ./FactProcessing/messaging - some code to do HTTP & AMQP messaging in an ATO ideomatic way
 * ./FactProcessing/handRolled - playing around with some manual test
 * ./FactProcessing/mocks - playing around at mocking out security stuff

* ./FactProcessing/form/* - the guts of the Fact Processing solution
  * ./FactProcessing/form/FormController.ts - handles the form specific routes, e.g applevel +  /:ClientIdentifierType/:ClientIdentifierValue/Forms/:FormTypeMung...etc
  * ./FactProcessing/form/Form.ts - the mongoose defintion for forms
  * ./FactProcessing/form/*.ts - a few other greebly helper stuff
  * ./FactProcessing/form/factSpecific/*.ts - fact specific config - one *.ts per fact

* ./test/*- rudimentary automated tests (mostly integration tests - )
  * ./test/app.test.js - this is the guts of the tests - all automated tests are in here 
  * ./test *.sh & *.json - initial test done using curl - probably should be removed.

* ./services - stuff referenced by JSRE part of the solution
* ./Scripts - stuff referenced by JSRE part of the solution


## Installing mongo in cloud 9
* these instructions worked for me: https://github.com/nax3t/aws-cloud9-instructions

* touch mongodb-org-3.6.repo
    
* Put this in the file:
<pre>
    [mongodb-org-3.6]
    name=MongoDB Repository
    baseurl=https://repo.mongodb.org/yum/amazon/2013.03/mongodb-org/3.6/x86_64/
    gpgcheck=1
    enabled=1
    gpgkey=https://www.mongodb.org/static/pgp/server-3.6.asc
</pre>
    
* sudo mv mongodb-org-3.6.repo /etc/yum.repos.d
* sudo yum install -y mongodb-org
* mkdir data
* echo 'mongod --dbpath=data --nojournal' > mongod
* chmod a+x mongod
* ./mongod

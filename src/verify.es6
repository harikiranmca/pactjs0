import logger from '../lib/log';
var log = logger('Pact verifier');

import debugLib from 'debug';
var debug = debugLib('pactjs-verify');

import async from 'async';

// adds colours to strings
var colors = require('colors');

// make direct requests on express services
import request from '../lib/testing-extensions';

// pact response verifier
import * as verifier from '../lib/verifier/response';
import * as stateManager from '../lib/provider-state-manager';

import PactBroker from './pact-broker-client.spike';

var fs = require('fs');
var path= require('path');

var providerStates, provider, contract, masterSetup, cleanItup;
var startTime;

var failedCount = 0;
var allErrors = [];

var localPactTest=null;

/**
 * Verify all interactions within a contract
 *
 * @param {object} pactTest must contain the contract, an instance of the
 *     provider, and a map of the initial provider states.
 * @param {function} done callback function will be passed an array of errors
 *     occurring during the verification.
 */
export default function verify(pactTest, done) {
  localPactTest = pactTest;
  localPactTest.pacts = [];
  provider = pactTest.provider;
  providerStates = pactTest.providerStates;
  masterSetup = pactTest.masterSetup;
  cleanItup = pactTest.cleanItup;

  async.series([validate,startSetup,execPacts,cleanUp],function(e,r){
      if(e)
      {
          console.log(e);
          allErrors.push(e)
          done(allErrors);
      }
      done(allErrors);
  });
}

function validate(callback){
    try {
        switch (localPactTest.typeOfPacts) {
            case "Folder":
                fs.accessSync(localPactTest.contract);
                var pactFiles = fs.readdirSync(localPactTest.contract);
                for (var i in pactFiles)
                    localPactTest.pacts.push(path.join(localPactTest.contract, pactFiles[i]));
                callback();
                break;
            case "File":
                fs.accessSync(localPactTest.contract);
                localPactTest.pacts.push(localPactTest.contract);
                callback();
                break;
            case "URL":
                new PactBroker(localPactTest.contract).getPactsAsArray(function(error,results){
                    if(!error) {
                        localPactTest.pacts = results;
                    }
                    else{
                        callback(error,null);
                    }
                    callback();
                });
                break;
        }

    }
    catch(error){
        callback(new Error(error),null);
    }
}

function startSetup(callback){
    if(!(masterSetup == null )){
        stateManager.masterSetup(masterSetup,provider).then(res => {
            callback();
        }).catch(err => {
            return new Error(err);
        });
    }
    else {
        callback();
    }
}

function execPacts(callback){
    if (!localPactTest.pacts.length > 0)
        callback(new Error('No pact files to process'),null);
        async.eachSeries(localPactTest.pacts,playInteractions,function(error,results){
            if(error)
            {
                console.log(error);
            }
        callback();
    });
}

function cleanUp(callback){
    if(!(cleanItup == null )){
        stateManager.cleanUp(cleanItup,provider).then(res => {
            callback();
        }).catch(err => {
            return new Error(err);
        });
    }
    else {
        callback();
    }
}

function playInteractions(p_pact, callback1){
    var p_contract = null;
    failedCount = 0;
    startTime = Date.now();
    try {
        switch (localPactTest.typeOfPacts) {
            case "Folder":
            case "File":
                p_contract = require(p_pact);
                break;
            case "URL":
                p_contract = p_pact;
                break;

        }
    }
    catch(error)
    {
        callback1('Please check the pact file - ' + p_pact + ' . Error: ' + error,null);
    }
    log.info('Verifying a pact between ' + p_contract.consumer.name + ' and ' + p_contract.provider.name);
    stateManager.verify(p_contract.interactions, providerStates);

    async.mapSeries(p_contract.interactions, (interation, callback) => {
        verifyInteraction(interation).then(res => callback(null, res)).catch(err => callback(err));
    }, (err, results) => {
        if (err) {
            debug(err);
        }
        var passedCount = p_contract.interactions.length - failedCount;
        var endTime = Date.now();
        var seconds = ((endTime - startTime) / 1000).toFixed(2);
        log.info('---------------------------------------------------------------');
        log.info('Test summary');
        log.info('   ' + colors.green(passedCount).bold + ' passed, ' + colors.red(failedCount).bold+ ' failed.');
        log.info('  Took ' + seconds  +'seconds');
        log.info('---------------------------------------------------------------');
        callback1();

    });
}

function doPost(path, body) {
  return new Promise((resolve, reject) => {
    try {
      debug('doPost, path: ' + path + ', body: ' + JSON.stringify(body, null, '\t'));

      request(provider)
          .post(path)
          .send(body)
          .end((err, res) => {

            debug('doPost, res.headers: ' + JSON.stringify(res.headers, null, '\t') + ', status: ' + res.status + ', error: ' + JSON.stringify(res.error, null, '\t') + ', body: ' + JSON.stringify(res.body, null, '\t'));

            err ? reject(err) : resolve(res);
        });
    }
    catch (err) {
      reject(err);
    }
  })
}

function doGet(path) {
  return new Promise((resolve, reject) => {
    try {
      debug('doGet, path: ', path);
      request(provider)
          .get(path)
          .end((err, res) => {
            
            debug('doGet, res.headers: ' + JSON.stringify(res.headers, null, '\t') + ', status: ' + res.status + ', error: ' + JSON.stringify(res.error, null, '\t') + ', body: ' + JSON.stringify(res.body, null, '\t'));

            err ? reject(err) : resolve(res);
          });
    }
    catch (err) {
      reject(err);
    }
  })
}

function verifyInteraction(interaction) {
  function f(interaction, result) {
    log.info('  Given  '+ interaction.provider_state);
    log.info('    '+ interaction.description);
    log.info('      with '+ interaction.request.method.toUpperCase() + ' ' +  interaction.request.path + '');
    log.info('        returns a response which');
    log.info('          ' + result.pass.join("\n\t\t\t\t").green.bold);
    log.info('          ' + result.fail.join("\n\t\t\t\t").red.bold);

    debug('verifyInteraction: ' + JSON.stringify(result.fail, null, '\t'));

    if (Array.isArray(result.fail) && result.fail.length > 0) {
      allErrors = allErrors.concat(result.fail);
      failedCount++;
    }
  }
  var request = interaction.request;
  var path = request.path + (request.query ? '?'+ request.query : '');
  var req;
  return new Promise((resolve, reject) => {
    stateManager.setup(provider, interaction, providerStates)
      .then(() => {
        if (request.method === 'post') {
          return doPost(path, request.body)
        } else if (request.method === 'get') {
          return doGet(path)
        }
      })
      .then(res => {
          var result = verifier.verify(interaction, res);
          f(interaction, result);
          stateManager.tearDown(provider, interaction, providerStates).then(()=>{resolve();}).catch(err=>{resolve({ fail: err })});
          resolve(result);
      })
      .catch(err => {
        resolve({fail: err});
      });
    });
}

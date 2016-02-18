import logger from '../lib/log';
var log = logger('Pact verifier');

import debugLib from 'debug';
var debug = debugLib('pactjs-verify');

import async from 'async';

// adds colours to strings
import 'colors';

// make direct requests on express services
import request from '../lib/testing-extensions';

// pact response verifier
import * as verifier from '../lib/verifier/response';
import * as stateManager from '../lib/provider-state-manager';

let providerStates, provider, contract;

let failedCount = 0;
let allErrors = [];

/**
 * Verify all interactions within a contract
 *
 * @param {object} pactTest must contain the contract, an instance of the
 *     provider, and a map of the initial provider states.
 * @param {function} done callback function will be passed an array of errors
 *     occurring during the verification.
 */
export default function verify(pactTest, done) {
  contract = pactTest.contract;
  provider = pactTest.provider;
  providerStates = pactTest.providerStates;

  var startTime = Date.now();

  log.info('Verifying a pact between ' + contract.consumer.name + ' and ' +
      contract.provider.name);

  // before all
  stateManager.verify(contract.interactions, providerStates);

  // TODO: make this less clever
  async.mapSeries(contract.interactions, (interation, callback) => {
    verifyInteraction(interation)
      .then((res) => callback(null, res))
      .catch((err) => callback(err))
  }, (err, results) => {
    if ( err ) {
      debug(err);
    }
    //log.info(`Result: ` + JSON.stringify(results, null, '\t'));
    let passedCount = contract.interactions.length - failedCount;
    let endTime = Date.now();
    let seconds = ((endTime - startTime) / 1000).toFixed(2);
    log.info('---------------------------------------------------------------');
    log.info('Test summary');
    log.info(`  ${('' + passedCount).green.bold} passed, ` +
        `${('' + failedCount).red.bold} failed.`);
    log.info(`  Took ${seconds} seconds`);
    log.info('---------------------------------------------------------------');
    done(allErrors);
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
    log.info(`  Given  ${interaction.provider_state}`);
    log.info(`    ${interaction.description}`);
    log.info(`      with ${interaction.request.method.toUpperCase()} ${interaction.request.path}`);
    log.info('        returns a response which');
    log.info(`          ${result.pass.join("\n").green.bold}`);
    log.info(`          ${result.fail.join("\n").red.bold}`);

    debug('verifyInteraction: ' + JSON.stringify(result.fail, null, '\t'));

    if (Array.isArray(result.fail) && result.fail.length > 0) {
      allErrors = allErrors.concat(result.fail);
      failedCount++;
    }
  }

  let request = interaction.request;

  let path = request.path + (request.query ? `?${request.query}` : '');

  let req;

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
          let result = verifier.verify(interaction, res);
          f(interaction, result);
          resolve(result);      
      })
      .catch(err => {
        resolve({fail: err});
      });
    });
}

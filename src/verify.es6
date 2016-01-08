import logger from '../lib/log';
var log = logger('Pact verifier');

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
  let interactions = contract.interactions
      .reduce((prev, cur) => prev.then(() => verifyInteraction(cur)),
          Promise.resolve());

  interactions.then((res) => {
    log.info(`Result: ${res.join("\n")}`);
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
  })
}

function doPost(path, body) {
  return new Promise((resolve, reject) => {
    try {
      request(provider)
          .post(path)
          .send(body)
          .end((err, res) => err ? reject(err) : resolve(res));
    }
    catch (err) {
      reject(err);
    }
  })
}

function doGet(path) {
  return new Promise((resolve, reject) => {
    try {
      request(provider)
          .get(path)
          .end((err, res) => err ? reject(err) : resolve(res));
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
    log.info(`          ${result.pass.join("\n")}`);
    log.info(`          ${result.fail.join("\n")}`);
    if (Array.isArray(result.fail) &&
        result.fail.some((el) => el instanceof Error)) {
      allErrors = allErrors.concat(el);
      failedCount++;
    }
  }

  let request = interaction.request;

  let path = request.path + (request.query ? `?${request.query}` : '');

  let req;

  stateManager.setup(provider, interaction, providerStates);
  if (request.method === 'post') {
    req = doPost(path, request.body)
  } else if (request.method === 'get') {
    req = doGet(path)
  }
  let result;
  req.then((res) => {
    result = verifier.verify(interaction, res);
    f(interaction, result);
  });

  return req;
}

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

  let failedCount = 0;
  let allErrors = [];

  // before all
  stateManager.verify(contract.interactions, providerStates);
  let promises = undefined;

  for (const interaction of contract.interactions) {
    let p = verifyInteraction(interaction);
    if (promises) {
      promises = promises.then((result) => {
        log.info(`  Given  ${interaction.provider_state}`);
        log.info(`    ${interaction.description}`);
        log.info(`      with ${interaction.request.method.toUpperCase()} ${interaction.request.path}`);
        log.info('        returns a response which');
        log.info(`          ${result.join("\n")}`);
        if (Array.isArray(result) && result.some((el) => el instanceof Error)) {
          allErrors = allErrors.concat(result);
          failedCount++;
        }
        return p;
      });
    } else {
      promises = p;
    }
  }

  promises.then((res) => {
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
          .end((err, res) => (err ? reject(err) : resolve(res)));
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
          .end((err, res) => err ? reject(err) : resolve(res))
    }
    catch (err) {
      reject(err);
    }
  })
}

function verifyInteraction(interaction) {
  let request = interaction.request;
  stateManager.setup(provider, interaction, providerStates);

  let path = request.path + (request.query ? `?${request.query}` : '');

  var errors = [];

  if (request.method === 'post') {
    return doPost(path, request.body)
        .then((res) => {
          let verify = verifier.verify(interaction, res);
          log.info(`verify: ${verify}`);
          return verify;
        })
        .catch((err) => {
          errors = errors.concat(err);
          return errors;
        });
  } else if (request.method === 'get') {
    return doGet(path)
        .then((res) => {
          let verify = verifier.verify(interaction, res);
          log.info(`verify: ${verify}`);
          return verify
        })
        .catch((err) => {
          errors = errors.concat(err);
          return errors;
        });
  }
}

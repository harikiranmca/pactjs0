import logger from './log-compiled';
var log = logger('Pact verifier');

// adds colours to strings
import 'colors';

// make direct requests on express services
import request from './testing-extensions-compiled';

// pact response verifier
import * as verifier from './verifier/response';
import * as stateManager from './provider-state-manager';

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

  let pendingInteractions = contract.interactions;
  let completedInteractions = [];

  let passedCount = 0;
  let failedCount = 0;
  let allErrors = [];

  // before all
  stateManager.verify(contract.interactions, providerStates);

  // synchronously iterate through all interactions
  var interactionDone = function(errors) {
    completedInteractions.push(nextInteraction);

    if (errors.length === 0) {
      passedCount++;
    } else {
      allErrors = allErrors.concat(errors);
      failedCount++;
    }

    if (pendingInteractions.length > 0) {
      nextInteraction = pendingInteractions.shift();
      verifyInteraction(nextInteraction, interactionDone);
    } else {
      var endTime = Date.now();
      var seconds = ((endTime - startTime) / 1000).toFixed(2);
      //noinspection GjsLint
      log.info('--------------------------------------------------------');
      log.info('Test summary');
      log.info('  ' + ('' + passedCount).green.bold + ' passed, ' + ('' +
          failedCount).red.bold + ' failed.');
      log.info('  Took ' + seconds + ' seconds');
      //noinspection GjsLint
      log.info('--------------------------------------------------------');
      done(allErrors);
    }
  };

  var nextInteraction = pendingInteractions.shift();
  verifyInteraction(nextInteraction, interactionDone);
}

function verifyInteraction(interaction, done) {
  var path = interaction.request.path;
  if (interaction.request.query) {
    path += '?' + interaction.request.query;
  }

  stateManager.setup(provider, interaction, providerStates);

  log.info('  Given ' + interaction.provider_state);
  log.info('    ' + interaction.description);
  log.info('      with ' + interaction.request.method.toUpperCase() +
      ' ' + path);
  log.info('        returns a response which');

  var errors = [];
  var resp;

  function doPost() {
    try {
      resp = request(provider)
          .post(interaction.request.path)
          .send(interaction.request.body)
          .end(function() {
            let verify = verifier.verify(interaction, resp.res);
            done(verify);
          });
    }
    catch (err) {
      log.error('          Error: ' + err);
      errors.push(err);
      done(errors);
    }
  }

  function doGet() {
    try {
      resp = request(provider)
          .get(path)
          .end(function() {
                let verify = verifier.verify(interaction, resp.res);
                done(verify);
          });
    }
    catch (err) {
      log.error('          Error: ' + err);
      errors.push(err);
      done(errors);
    }
  }

  if (interaction.request.method === 'post') {
    doPost();
  } else if (interaction.request.method === 'get') {
    doGet();
  }
}

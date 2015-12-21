'use strict';

module.exports = (function () {

  var verify = function verify(interaction, response) {
    var errors = [];

    verifiers.forEach(function (verifier) {
      verifier(interaction, response, errors);
    });

    return errors;
  };

  var verifiers = [require('./body'), require('./status-code'), require('./header')];

  return {
    verify: verify
  };
})();
"use strict";

module.exports = (function () {
  var setupProviderStateForInteraction = function setupProviderStateForInteraction(provider, interaction, providerStates) {
    providerStates[interaction.provider_state](provider);
  };

  var verifyProviderStatesForInteractions = function verifyProviderStatesForInteractions(interactions, providerStates) {
    interactions.forEach(function (interaction) {
      if (typeof providerStates[interaction.provider_state] !== 'function') {
        throw new Error("missing provider state '" + interaction.provider_state + "'");
      }
    });
  };

  return {
    setup: setupProviderStateForInteraction,
    verify: verifyProviderStatesForInteractions
  };
})();
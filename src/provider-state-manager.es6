export function setup(provider, interaction, providerStates) {
  return providerStates[interaction.provider_state](provider);
}

export function verify(interactions, providerStates) {
  for (const interaction of interactions) {
    if (typeof providerStates[interaction.provider_state] !== 'function') {
      throw new Error("missing provider state '" +
          interaction.provider_state + "'");
    }
  }
}

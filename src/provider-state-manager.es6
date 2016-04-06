export function masterSetup(masterFn,provider) {
    return new Promise((resolve,reject) => {
        masterFn(provider);
        resolve();
    });

}

export function cleanUp(cleanFn,provider) {
    return new Promise((resolve,reject) => {
        cleanFn(provider);
        resolve();
    });

}

export function setup(provider, interaction, providerStates) {
  return new Promise((resolve,reject) => {
    if(!(providerStates[interaction.provider_state].setup == null))
    {
      providerStates[interaction.provider_state].setup(provider);
    }
    resolve();
  });
}

export function tearDown(provider, interaction, providerStates) {
  return new Promise((resolve,reject) => {
    if(!(providerStates[interaction.provider_state].teardown == null))
    {
      providerStates[interaction.provider_state].teardown(provider);
    }
    resolve();
  });
}

export function verify(interactions, providerStates) {
  for (const interaction of interactions) {
    if (typeof providerStates[interaction.provider_state] === 'undefined') {
      throw new Error("Missing provider state '" +
          interaction.provider_state + "'");
    }
  }
}


export function setup(provider, interaction, providerStates) {
  return new Promise((resolve,reject) => {
    if(!(providerStates[interaction.provider_state].setup == null))
    {
      providerStates[interaction.provider_state].setup(interaction,provider);
    }
    resolve();
  });
}

export function tearDown(provider, interaction, providerStates) {
  return new Promise((resolve,reject) => {
    if(!(providerStates[interaction.provider_state].teardown == null))
    {
      providerStates[interaction.provider_state].teardown(interaction,provider);
    }
    resolve();
  });
}

export function verify(interactions, providerStates) {
    interactions.forEach(function(interaction){
        if (typeof providerStates[interaction.provider_state] === 'undefined') {
            throw new Error("Missing provider state '" + interaction.provider_state + "'");
        }
    });
}

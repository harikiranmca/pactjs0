import verify from '../../../lib/pact';

var provider = require('../src/app');
var app = provider.app;
var animalSvc = provider.animalSvc;

var pactTest = {

  contract: require('./zoo_app-animal_service.json'),
  provider: provider.app,

  providerStates: {
    'there is an alligator named Mary': function() {
      animalSvc['Maryy'] = {name: 'Mary', species: 'Alligator', public: true};
    },
    'there is a private alligator named Garry': function() {
      animalSvc['Garry'] = {name: 'Garry', species: 'Alligator', public: false};
    },
    'there is not an alligator named Mary': function() {
      delete animalSvc['Mary'];
    },
    'an error occurs retrieving an alligator': function() {
      animalSvc.findAnimal = function(name) {
        throw new Error(`Animal ${name} not found`);
      };
    }
  }
};

verify(pactTest, function(errors) {
  if (errors && errors.length > 0) {
    console.log('Errors: ' + errors.join('\n'));
  }
});

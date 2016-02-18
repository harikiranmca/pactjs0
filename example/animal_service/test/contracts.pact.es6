import verify from '../../../lib/pact';

import debugLib from 'debug';
var debug = debugLib('pact-animal-service');

var provider = require('../src/app');
var app = provider.app;
var animalSvc = provider.animalSvc;

var pactTest = {

  contract: require('./zoo_app-animal_service.json'),
  provider: provider.app,

  providerStates: {
    'there is an alligator named Mary': function() {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          debug('setting Mary');
          animalSvc['Mary'] = {name: 'Mary', species: 'Alligator', public: true};
          resolve();
        }, 100);
      });
    },
    'there is a private alligator named Garry': function() {
      return new Promise((resolve, reject) => {
        debug('setting Garry');
        animalSvc['Garry'] = {name: 'Garry', species: 'Alligator', public: false};
        resolve();
      });

    },
    'there is not an alligator named Mary': function() {
      return new Promise((resolve, reject) => {
        debug('deleting Mary');
        delete animalSvc['Mary'];
        resolve();
      });
    },
    'an error occurs retrieving an alligator': function() {
      return new Promise((resolve, reject) => {
        debug('changing findAnimal function');
        animalSvc.findAnimal = function(name) {
          throw new Error(`Animal ${name} not found`);
        };
        resolve();
      });
    }
  }
};

verify(pactTest, function(errors) {
  if (errors && errors.length > 0) {
    process.exit(1);
  }
});

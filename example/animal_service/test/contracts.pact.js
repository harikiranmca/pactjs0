'use strict';

require('babel-polyfill');

var _verify = require('../../../lib/verify');

var _verify2 = _interopRequireDefault(_verify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var provider = require('../src/app');
var app = provider.app;
var animalSvc = provider.animalSvc;

var pactTest = {

  contract: require('./zoo_app-animal_service.json'),
  provider: provider.app,

  providerStates: {
    'there is an alligator named Mary': function thereIsAnAlligatorNamedMary() {
      animalSvc['Mary'] = { name: 'Mary', species: 'Alligator', public: true };
    },
    'there is a private alligator named Garry': function thereIsAPrivateAlligatorNamedGarry() {
      animalSvc['Garry'] = { name: 'Garry', species: 'Alligator', public: false };
    },
    'there is not an alligator named Mary': function thereIsNotAnAlligatorNamedMary() {
      delete animalSvc['Mary'];
    },
    'an error occurs retrieving an alligator': function anErrorOccursRetrievingAnAlligator() {
      animalSvc.findAnimal = function (name) {
        throw new Error('Animal ' + name + ' not found');
      };
    }
  }
};

(0, _verify2.default)(pactTest, function (errors) {
  if (errors && errors.length > 0) {
    console.log('Errors: ' + errors.join('\n'));
  }
});

//# sourceMappingURL=contracts.pact.js.map
/**
 * Created by HariKiran_Challa on 6/04/2016.
 */
var service = require('../src/app');
var PactProviderTest = require('./../../../lib/pact');
var animalSvc = service.animalSvc;

var test = new PactProviderTest('http://localhost:3000');
test.setMasterSetup(function(){
    service.start()
});
test.setProviderState('there is an alligator named Mary',function(){
    animalSvc['Mary'] = {name: 'Mary', species: 'Alligator', public: true};
},null);
test.setProviderState('there is a private alligator named Garry',null,null);
test.setProviderState('there is not an alligator named Mary',function(){
    delete animalSvc['Mary'];
},null);
test.setProviderState('an error occurs retrieving an alligator',null,null);
test.setCleanItup(function(){
    console.log('Done');
});

setTimeout(function(){
    test.start();
    //process.exit(0);
    console.log('Timeout')},1000);
import verify from '../lib/verify'
var fs = require('fs');
var path = require('path');
var validUrl = require('valid-url');
import PactBroker from './pact-broker-client.spike';



var PactProviderTest =  function (p_url, p_contract_path) {
    this.arr_providerStates = {};
    this.masterSetup=null;
    this.cleanItup=null;
    this.typeOfPacts = null;
    this.contract = [];

    if (typeof p_contract_path === 'undefined') {
        this.typeOfPacts = 'Folder';
        this.contract= path.join(process.cwd(),'test','pact');
    } else {
        if (validUrl.is_uri(p_contract_path)) {
            this.typeOfPacts = 'URL';
            this.contract = p_contract_path;
        } else {
            this.typeOfPacts = 'File';
            this.contract = path.join(process.cwd(),'test','pact', p_contract_path);
        }
    }
    if(validUrl.is_uri(p_url)){
        this.url = p_url;
    }else{
        return new Error('Invalid Provider URL');
    }

}
PactProviderTest.prototype.setProviderState = function (stateName,setupFunction,teardownFunction){
    this.arr_providerStates[stateName] = { setup: setupFunction , teardown: teardownFunction };
}
PactProviderTest.prototype.setMasterSetup = function(masterFunction){
    this.masterSetup = masterFunction;
}
PactProviderTest.prototype.setCleanItup = function(cleanUpFunction){
    this.cleanItup = cleanUpFunction;
}
PactProviderTest.prototype.start = function(){
    var pactTest = {
        contract: this.contract,
        provider: this.url,
        providerStates: this.arr_providerStates,
        masterSetup: this.masterSetup,
        cleanItup: this.cleanItup,
        typeOfPacts: this.typeOfPacts

    };
    setTimeout(function () {
        verify(pactTest, function (errors) {

            if (errors && errors.length > 0) {
                process.exit(1);
            }
            process.exit(0);
        });
    }, 3000);
}

module.exports = PactProviderTest;





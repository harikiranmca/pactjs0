function _typeof(obj) {
    return obj && typeof Symbol !== 'undefined' && obj.constructor === Symbol ?
        'symbol' :
        typeof obj;
}

import {expect} from 'chai';

export function verify(interaction, response,addError) {

    var message = "          has a matching response structure";
    var isError = false;
    var stdResKeys = ['body','headers','matchingRules','status'];

    var actual = addKeys( response);
    var expected = addKeys(interaction.response);

    function addKeys(Obj){
        var localMap = new Map();
        Object.keys(Obj).map((key) => {
            if(stdResKeys.indexOf(key) == -1)
                localMap.set(key.toLowerCase(),Obj[key]);
        });
        return localMap;
    };
    expected.forEach(function(val,key){
        try {
            expect(actual.get(key)).to.eq(expected.get(key));
        } catch (err) {
            isError = true;
            addError(err);
        }
    });


    if(!isError)
        return message.green;
    else
        return '';

}

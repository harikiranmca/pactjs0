import * as request from 'request';
import * as url from 'url';
import * as async from 'async'

export default PactBroker;

function PactBroker(pactUrl){
this.pactBrokerUrl = pactUrl;
}

PactBroker.prototype.getPactsAsArray = function(){
    var pactBrokerUrl = this.pactBrokerUrl;
    return new Promise((resolve, reject) => {
        var pactFiles = [];
        request.get(pactBrokerUrl, function (error, res, body) {
            if (error) {
                reject(error);
            } else {
                var response = JSON.parse(body);
                if (Array.isArray(response._links.pacts)) {
                    async.eachSeries(response._links.pacts, function (pactObj, callback1) {
                        request.get(pactObj.href, function (err, res, body) {
                            if (err) {
                                reject(err);
                            } else {
                                pactFiles.push(JSON.parse(body));
                                callback1();
                            }
                        });
                    }, function () {
                        resolve(pactFiles);
                    });
                }else{
                 reject(new Error("Incorrect Response Format"));
                }
            }
        });
    });


};


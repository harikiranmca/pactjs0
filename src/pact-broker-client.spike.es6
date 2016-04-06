import * as request from 'request';
import * as url from 'url';
import * as async from 'async'

export default PactBroker;

function PactBroker(pactUrl){
this.pactBrokerUrl = pactUrl;
}

PactBroker.prototype.getPactsAsArray = function(callback){
        var pactFiles = [];
        request.get(this.pactBrokerUrl,function(error,res,body){
            if(error){
                callback(error,null);
            }
            else{
                var response = JSON.parse(body);
                if(Array.isArray(response._links.pacts)){
                    async.eachSeries(response._links.pacts,function(pactObj,callback1){
                        request.get(pactObj.href,function(err,res,body){
                            if(err){
                                callback(err,null);
                            }else
                            {
                                pactFiles.push(JSON.parse(body));
                                callback1();
                            }
                        });

                    },function(){
                        callback(null,(pactFiles.length > 0 ? pactFiles : null));
                    });
                }
            }
        });

};


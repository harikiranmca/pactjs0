function _typeof(obj) {
  return obj && typeof Symbol !== 'undefined' && obj.constructor === Symbol ?
      'symbol' :
      typeof obj;
}

import {expect} from 'chai';

export function verify(interaction, response,addError) {

  var message = "          has a matching headers";
  var isError = false;

  var actual = new Map();

  if (_typeof(response.headers) === 'object') {
    Object.keys(response.headers).map((key) => {
        actual.set(key.toLowerCase(),response.headers[key]);
    });
  }

  var expected = new Map();
  if (_typeof(interaction.response.headers) === 'object') {
    Object.keys(interaction.response.headers).map((key) => {
        expected.set(key.toLowerCase(), interaction.response.headers[key]);
    });
  }

  for (const key of expected.keys()) {
      try
      {
          expect(actual).to.not.be.null;
          expect(actual.get(key)).to.eq(expected.get(key));
      }
      catch(err)
      {
          isError = true;
          addError(err);
      }
  }
    if(!isError)
        return message.green;
}

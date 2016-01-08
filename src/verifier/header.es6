function _typeof(obj) {
  return obj && typeof Symbol !== 'undefined' && obj.constructor === Symbol ?
      'symbol' :
      typeof obj;
}

import {expect} from 'chai';

export function verify(interaction, response) {

  var actual = new Map();
  if (_typeof(response.headers) === 'object') {
    Object.keys(response.headers).map((key) => {
      actual[key.toLowerCase()] = response.headers[key]
    });
  }

  var expected = new Map();
  if (_typeof(interaction.response.headers) === 'object') {
    Object.keys(interaction.response.headers).map((key) => {
      expected[key.toLowerCase()] = interaction.response.headers[key];
    });
  }

  for (const key of expected.keys()) {
    var msg = [
      `          includes headers`,
      `            "${key}" with value "${expected[key]}"`];
    expect(actual).to.not.be.null;
    expect(actual[key]).to.eq(expected[key]);
    return msg.green;
  }
}

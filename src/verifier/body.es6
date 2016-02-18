import {observableDiff as deepDiff} from 'deep-diff';

import {expect} from 'chai';

/**
 * TODO Allow unexpected keys to be sent back in the body. See "Pact
 * Specificaton Philosophy" in main README
 */
export function verify(interaction, response) {
  if (!interaction.response.body) {
    return
  }
  var message = "          has a matching body";

  deepDiff(interaction.response.body, response.body, function(diff) {
    if (diff.kind !== 'N') {
      expect(diff.lhs).to.eq(diff.rhs);
    }
  });
  return message.green;
}
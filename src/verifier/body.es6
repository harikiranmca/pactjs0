import {observableDiff as deepDiff} from 'deep-diff';

import {expect} from 'chai';

/**
 * TODO Allow unexpected keys to be sent back in the body. See "Pact
 * Specificaton Philosophy" in main README
 */
export function verify(interaction, response,addError) {
  if (!interaction.response.body) {
    return
  }
  var message = "          has a matching body";
  var isError =  false;

  deepDiff(interaction.response.body, response.body, function(diff) {
      try {
          if (diff.kind !== 'N')
          {
              if(interaction.response.matchingRules != undefined && interaction.response.matchingRules[getPath((diff.path).toString())] != undefined)
              {
                  var reg= new RegExp(interaction.response.matchingRules[getPath((diff.path).toString())].regex);
                  expect(diff.lhs).to.match(reg);
              }
              else
              {
                  expect(diff.lhs).to.eq(diff.rhs);
              }
          }

    }
    catch(err) {
      isError = true;
      addError(err);
    }

  });
  if(!isError)
         return message.green
  else
        return '';
}

function getPath(diffpath)
{
  return '$.body.' + diffpath ;
}

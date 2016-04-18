import {verify as body} from './body';
import {verify as statusCode} from './status-code';
import {verify as header} from './header';
import {verify as structure} from './structure';

export function verify(interaction, response) {
  var errors = [];
  var resp = [];

  function addError(error)
  {
    errors.push(error);
  }

    try {
      var ret_structure = structure(interaction, response, addError);
      resp = resp.concat(ret_structure);

      var ret_header = header(interaction, response, addError);
      resp = resp.concat(ret_header);

      var ret_status = statusCode(interaction, response, addError);
      resp = resp.concat(ret_status);

      var ret_body = body(interaction, response, addError);
      resp = resp.concat(ret_body);
    }
  catch(err)
  {
    addError(err);
  }

  return {pass: resp, fail: errors};
}



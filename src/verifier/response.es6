import {verify as body} from './body';
import {verify as statusCode} from './status-code';
import {verify as header} from './header';

export function verify(interaction, response) {
  let errors = [];
  let resp = [];
  try {
    let r = header(interaction, response);
    resp = resp.concat(r);
  }
  catch (err) {
    errors = errors.concat(err);
  }
  try {
    let r = statusCode(interaction, response);
    resp = resp.concat(r);
  }
  catch (err) {
    errors = errors.concat(err);
  }
  try {
    let r = body(interaction, response);
    resp = resp.concat(r);
  }
  catch (err) {
    errors = errors.concat(err);
  }
  return {pass: resp, fail: errors};
}

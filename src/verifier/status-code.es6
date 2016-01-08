import {expect} from 'chai';

export function verify(interaction, response) {
  if (!interaction.response.status) {
    return
  }
  var message = `          has a status code ${interaction.response.status}`;
  expect(response.statusCode).to.eq(interaction.response.status);
  return message.green;
}
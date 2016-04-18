import {expect} from 'chai';

export function verify(interaction, response,addError) {
  if (!interaction.response.status) {
    return
  }
  var message = '          has a status code '+ interaction.response.status;
  var isError = false;
  try
  {
    expect(response.statusCode).to.eq(interaction.response.status);
    expect(response.status).to.eq(interaction.response.status);

  }
  catch(err)
  {
    isError = true;
    addError(err);
  }
  if(!isError)
    return message.green;
  else
    return '';
}
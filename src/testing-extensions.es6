// make a service request without starting the Express server
var Supertest = require('supertest');
var Test = Supertest.Test;

export default Supertest;


/**
 * Verify that a JSON document contains a particular attribute
 * @param {string} attr the attribute to check for
 * @param {object} val the expected value of that attribute
 * @return {boolean} if it has that attribute
 */
Test.prototype.expectAttr = function(attr, val) {
  this._asserts.push(function(res) {
    return hasAttr(res, attr, val);
  });

  return this;
};

var hasAttr = function hasAttr(res, attr, expected) {
  var json = asJson(res);
  var actual = json[attr];

  if (!actual) {
    return 'response does not have attribute "' + attr + '"';
  } else if (actual !== expected) {
    return 'attribute "' + attr + '" does not match expected value (' +
        expected + ' != ' + actual + ')';
  }
};

var asJson = function asJson(res) {
  return JSON.parse(res.text);
};


/**
 * Verify that a response is valid JSON
 * @return {Test} for fluency
 */
Test.prototype.expectResponseIsJson = function() {
  this._asserts.push(function(res) {
    return isJsonResponse(res);
  });
  return this;
};

var isJsonResponse = function isJsonResponse(res) {
  try {
    JSON.parse(res.text);
  }
  catch (err) {
    return 'response is not JSON';
  }
};


/**
 * Mark a unit test as pending
 * @param {function} done async callback
 */
global.pending = function(done) {
  console.log('********************************'.yellow.bold);
  console.log('*** Test not implemented yet ***'.yellow.bold);
  console.log('********************************'.yellow.bold);
  done();
  //    throw new Error('test is pending');
};

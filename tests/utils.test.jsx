// vim: set ft=javascript:

#includepath "../_includes";
#include "index.jsxinc";
#include "dokTools.jsxinc";

testRunner()

function test_jsonify() {
  var obj = { hello: 'world' }
  assert(jsonify(obj) == '{\n  "hello": "world"\n}', 'jsonify')
}

function test_logFail() {
  function failFunction(because) {
    throw new Error('this fails ' + because)
  }
  tryLogErrors(failFunction)('just because')
}

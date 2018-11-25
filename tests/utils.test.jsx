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
    if (because) throw new Error('this fails ' + because)
    else return 'OK'
  }
  tryLogErrors(failFunction)('just because')
  assert(tryLogErrors(failFunction)() == 'OK')
}
// vi: ft=javascript

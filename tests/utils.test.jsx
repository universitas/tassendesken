#includepath "../_includes";
#include "test_runner.jsxinc"
#include "utils.jsxinc"

testRunner(false)

function test_logFail() {
  function failFunction(because) {
    throw new Error('this fails ' + because || 'NO REASON')
  }
  assertRaises(failFunction, 'raises error')
  // tryLogErrors(failFunction)('just because')
}

function test_ifMain() {
  assert(ifMain($.fileName) == true, 'this is top of stack')
  assertRaises(ifMain, 'ifMain without arguments should raise error')
}

function test_zeroPad() {
  var zp = zeroPad(4)
  assertEqual(zp(6), '0006')
  assertEqual(zp(66666), '66666')
}

function test_currentIssue() {
  assertRaises(currentIssue, 'should not find in this folder')
}

function test_nextFriday() {
  var val = nextFriday()
  assert(/^\d{6}$/.test(val), val + ' datestamp should be 6 digits')
}

function test_jsonify() {
  var cases = {
    '{}': {},
    '[]': [],
    null: null,
    '[1,2,3]': [1, 2, 3]
  }
  for (var c in cases) {
    var val = cases[c]
    assertEqual(c, jsonify(val))
  }
}

function test_trim() {
  assertEqual(trim('  '), '')
  assertEqual(trim('\nhello \n  '), 'hello')
}
// vi: ft=javascript

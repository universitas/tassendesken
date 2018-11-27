#include "../_includes/test_runner.jsxinc";

testRunner(false)

function test_take() {
  assertEqual(take(2)('abc'), ['a', 'b'])
}
// vi: ft=javascript

#includepath "../_includes"
#include "test_runner.jsxinc";
#include "functional_programming.jsxinc";

testRunner(false)

function test_arithmetic_operators() {
  assertEqual(add(5)(2), 7)
  assertEqual(sub(5)(2), -3)
  assertEqual(mul(5)(2), 10)
  assertEqual(div(5)(2), 0.4)
  assertEqual(pow(5)(2), 32)
}

function test_equality_operators() {
  // eq()
  // numbers
  assertEqual(eq(1)(1), true)
  assertEqual(eq(1)(2), false)
  // arrays
  assertEqual(eq([1, 2])([1, 2]), true)
  assertEqual(eq([2, 1])([1, 2]), false)
  // objects
  assertEqual(eq({ a: [1, 2] })({ a: [1, 2] }), true)
  // neq()
  // numbers
  assertEqual(neq(1)(1), false)
  assertEqual(neq(1)(2), true)
  // arrays
  assertEqual(neq([1, 2])([1, 2]), false)
  assertEqual(neq([2, 1])([1, 2]), true)
  // objects
  assertEqual(neq({ a: [1, 2] })({ a: [1, 2] }), false)
}

// F
function test_F() {
  assertEqual(F(), false)
}

// T
function test_T() {
  assertEqual(T(), true)
}

// all
function test_all() {
  assertEqual(all([1, 1, 1]), true)
  assertEqual(all([1, 1, 0]), false)
  assertEqual(all([]), true)
  assertEqual(all('abc'), true)
}

// always
function test_always() {
  assertEqual(always(1)(), 1)
  // doesn't mutate
  var obj = { a: 1 }
  var fn = always(obj)
  assert(eq(obj)(fn()) == true, 'obj is not mutated')
  obj.b = 2
  assert(eq(obj)(fn()) == false, 'obj is not mutated')
}

// any
function test_any() {
  assertEqual(any([0, 0, 0]), false)
  assertEqual(any([0, 0, 1]), true)
  assertEqual(any([]), false)
  assertEqual(any('a'), true)
}

// arrayFrom
function test_arrayFrom() {}

// ascend
function test_ascend() {}

// assoc
function test_assoc() {
  assertEqual(assoc('foo', 'bar')({}), { foo: 'bar' })
}

// bind
function test_bind() {
  var fn = bind(add(1), [2])
  assertEqual(fn(), 3)
}

// call
function test_call() {}

// complement
function test_complement() {}

// compose
function test_compose() {}

// defaultTo
function test_defaultTo() {}

// descend
function test_descend() {}

// dotProp
function test_dotProp() {}

// drop
function test_drop() {
  assertEqual(drop(2)('abcdef'), ['c', 'd', 'e', 'f'])
  assertEqual(drop(-3)('abcdef'), ['a', 'b', 'c'])
}

// filter
function test_filter() {}

// find
function test_find() {}

// flip
function test_flip() {}

// has
function test_has() {}

// identity
function test_identity() {}

// is
function test_is() {}

// isNil
function test_isNil() {}

// join
function test_join() {}

// keys
function test_keys() {
  var obj = { a: 1, b: 2, c: 3 },
    arr = [1, 2, 3]
  assertEqual(keys(obj), ['a', 'b', 'c'])
  assertEqual(keys(arr), ['0', '1', '2'])
}

// map
function test_map() {}

// merge
function test_merge() {}

// mergeRight
function test_mergeRight() {}

// path
function test_path() {}

// pipe
function test_pipe() {}

// pluck
function test_pluck() {}

// prop
function test_prop() {}

// propOr
function test_propOr() {}

// reverse
function test_reverse() {}

// setAttr
function test_setAttr() {}

// sort
function test_sort() {}

// take
function test_take() {
  assertEqual(take(2)('abcdef'), ['a', 'b'])
  assertEqual(take(-2)('abcdef'), ['e', 'f'])
}

// tap
function test_tap() {}

// values
function test_values() {}

// when
function test_when() {}

// withDefault
function test_withDefault() {}

// zip
function test_zip() {}

// vi: ft=javascript

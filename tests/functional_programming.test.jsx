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

// apply
function test_apply() {
  var fn = function(a, b, c) {
    return a * b * c
  }
  assertEqual(apply(fn)([2, 3, 5]), 30)
}

// arrayFrom
function test_arrayFrom() {
  assertEqual(arrayFrom('abc'), ['a', 'b', 'c'])
  assertEqual(arrayFrom([1, 2, 3]), [1, 2, 3])
}

// ascend
function test_ascend() {
  var numerical = ascend(parseFloat)
  var bylength = ascend(prop('length'))
  assertEqual(numerical('09', '10'), 1)
  assertEqual(numerical('01', '1'), 0)
  assertEqual(numerical('10', '8'), -1)
  assertEqual(bylength('09', '10'), 0)
  assertEqual(bylength('01', '1'), -1)
  assertEqual(bylength('1', '10'), 1)
  assertEqual(sort(bylength)(['aa', 'bbb', 'c']), ['c', 'aa', 'bbb'])
}

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
function test_call() {
  assertEqual(call('toLowerCase')('HELLO'), 'hello')
  assertEqual(call('hello'.toUpperCase), 'HELLO')
}

// complement
function test_complement() {
  assertEqual(complement(T)(), false)
  assertEqual(complement(has)('length')([]), false)
}

// compose
function test_compose() {
  assertEqual(
    compose(
      mul(2),
      add(10)
    )(1),
    22
  )
}

// defaultTo
function test_defaultTo() {
  assertEqual(defaultTo('XXX')('hello'), 'hello')
  assertEqual(defaultTo('XXX')(undefined), 'XXX')
}

// descend
function test_descend() {
  var bylength = descend(prop('length'))
  assertEqual(sort(bylength)(['aa', 'bbb', 'c']), ['bbb', 'aa', 'c'])
}

// dotProp
function test_dotProp() {
  var o = { a: { b: 'xyz' } }
  assertEqual(dotProp('a.b')(o), 'xyz')
  assertEqual(dotProp('a.b.1')(o), 'y')
}

// drop
function test_drop() {
  assertEqual(drop(2)('abcdef'), ['c', 'd', 'e', 'f'])
  assertEqual(drop(-3)('abcdef'), ['a', 'b', 'c'])
}

// filter
function test_filter() {
  assertEqual(filter(gt(3))([1, 3, 4, 5, 2, 10]), [4, 5, 10])
}

// find
function test_find() {
  assertEqual(find(gt(3))([1, 3, 4, 5, 2, 10]), 4)
}

// flip
function test_flip() {
  function divide(a, b) {
    return a / b
  }
  assertEqual(divide(4, 8), 0.5)
  assertEqual(flip(divide)(4, 8), 2)
}

// has
function test_has() {
  assertEqual(has(1)([]), false)
  assertEqual(has(1)([1, 2]), true)
  assertEqual(has('a')({ b: 0 }), false)
  assertEqual(has('a')({ a: 0 }), true)
}

// identity
function test_identity() {
  assertEqual(identity('a'), 'a')
}

// is
function test_is() {
  assertEqual(is(String)('a'), true)
  assertEqual(is(String)(1), false)
  assertEqual(is(Number)('a'), false)
  assertEqual(is(Number)(1), true)
}

// isNil
function test_isNil() {
  assertEqual(isNil(), true)
  assertEqual(isNil(undefined), true)
  assertEqual(isNil(null), true)
  assertEqual(isNil(''), false)
  assertEqual(isNil({}), false)
  assertEqual(isNil(NaN), false)
  assertEqual(isNil(0), false)
}

// join
function test_join() {
  assertEqual(join('|')('abc'), 'a|b|c')
  assertEqual(join('')([1, 2, 3]), '123')
}

// keys
function test_keys() {
  var obj = { a: 1, b: 2, c: 3 },
    arr = [1, 2, 3]
  assertEqual(keys(obj), ['a', 'b', 'c'])
  assertEqual(keys(arr), ['0', '1', '2'])
}

// map
function test_map() {
  assertEqual(map(mul(2), [1, 2, 3]), [2, 4, 6])
}

// merge
function test_merge() {
  assertEqual(merge({ a: 1 })({ b: 2 }), { a: 1, b: 2 })
  assertEqual(merge({ a: 1 })({ a: 2 }), { a: 2 })
}

// mergeRight
function test_mergeRight() {
  assertEqual(mergeRight({ a: 1 })({ b: 2 }), { a: 1, b: 2 })
  assertEqual(mergeRight({ a: 1 })({ a: 2 }), { a: 1 })
}

// path
function test_path() {
  var o = { a: { b: 'xyz' } }
  assertEqual(path(['a', 'b'])(o), 'xyz')
  assertEqual(path(['a', 'b', 1])(o), 'y')
}

// pipe
function test_pipe() {
  assertEqual(
    pipe(
      take(3),
      join(' '),
      call('toUpperCase')
    )('abcdef'),
    'A B C'
  )
}

// pluck
function test_pluck() {
  assertEqual(pluck(1)(['abc', [1, 2, 3], 'ABC']), ['b', 2, 'B'])
}

// prop
function test_prop() {
  assertEqual(prop('length')([1, 2, 3, 4]), 4)
  assertEqual(prop(1)([1, 2, 3, 4]), 2)
}

// propOr
function test_propOr() {
  assertEqual(propOr('length', 999)(10), 999)
  assertEqual(propOr('length', 999)('10'), 2)
}

// reduce
function test_reduce() {
  var adder = function(a, b) {
    return a + b
  }
  assertEqual(reduce(adder, 0)([1, 2, 3, 4]), 10)
  assertEqual(reduce(adder)([1, 2, 3, 4]), 10)
}

// reverse
function test_reverse() {
  assertEqual(reverse('abc'), ['c', 'b', 'a'])
}

// setAttr
function test_setAttr() {
  var o = {}
  setAttr('a', 'b')(o)
  assertEqual(o, { a: 'b' })
}

// sort
function test_sort() {
  assertEqual(sort([2, 3, 1, 5, 4]), [1, 2, 3, 4, 5])
}

// take
function test_take() {
  assertEqual(take(2)('abcdef'), ['a', 'b'])
  assertEqual(take(-2)('abcdef'), ['e', 'f'])
}

// tap
function test_tap() {
  var a = []
  var b = map(
    pipe(
      mul(2),
      tap(l.push),
      sub(2)
    )
  )([1, 2, 3])
  assertEqual(a, [2, 4, 6])
  assertEqual(b, [0, 2, 4])
}

// unapply
function test_unapply() {
  assertEqual(unapply(reverse)(1, 2, 3), [3, 2, 1])
}

// values
function test_values() {
  var obj = { a: 1, b: 2, c: 3 },
    arr = [1, 2, 3]
  assertEqual(values(obj), [1, 2, 3])
  assertEqual(values(arr), [1, 2, 3])
}

// when
function test_when() {
  assertEqual(map(when(gt(4), mul(-1))([3, 4, 5, 6])), [3, 4, -5, -6])
}

// withDefault
function test_withDefault() {
  assertEqual(withDefault('aaa')(always(undefined))(), 'aaa')
}

// zip
function test_zip() {
  assertEqual(zip('abc', 'ABC', 123), [
    ['a', 'A', 1],
    ['b', 'B', 2],
    ['c', 'C', 3]
  ])
}

// vi: ft=javascript

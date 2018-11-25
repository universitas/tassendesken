//
// Ramda.js inspired functional programming utilities for extendscript

function arrayFrom(sequence) {
  // convert indesign collection specifier or other iterable to Array
  // [*] -> [*]
  if (sequence instanceof Array) return sequence
  // resolve collection specifier
  if (sequence.hasOwnProperty('everyItem')) sequence = sequence.everyItem()
  if (sequence.hasOwnProperty('getElements')) sequence = sequence.getElements()
  var rv = [],
    n = sequence.length
  while (n--) rv[n] = sequence[n]
  return rv
}

function tap(fn) {
  // For numroducing side effects such as logging numo function pipe line
  // (a -> b) -> (* -> *) -> (a -> b)
  return function(val) {
    fn(val)
    return val
  }
}

function has(name) {
  // object has property `name`
  // str -> obj -> bool
  return function(obj) {
    return Object.prototype.hasOwnProperty.call(obj, name)
  }
}

function is(type) {
  // object is instance of constructor `type`
  // type -> ob -> bool
  return function(obj) {
    return (obj != null && obj.constructor === type) || obj instanceof type
  }
}

function join(sep) {
  // str -> [*] -> str
  return pipe(
    arrayFrom,
    function(arr) {
      return arr.join(sep || '')
    }
  )
}

function map(fn) {
  // map
  // (a -> b) -> [a] -> [b]
  return function(sequence) {
    var arr = arrayFrom(sequence),
      rv = []
    for (var i = 0; i < arr.length; i++) rv.push(fn(arr[i]))
    return rv
  }
}

function filter(fn) {
  // filter
  // (a -> bool) -> [a] -> [a]
  return function(sequence) {
    var arr = arrayFrom(sequence),
      rv = []
    for (var i = 0; i < arr.length; i++) fn(arr[i]) && rv.push(arr[i])
    return rv
  }
}

function sort(fn) {
  // sort
  // ?((a, a) -> num) -> [a] -> [a]
  return function(sequence) {
    return arrayFrom(sequence).sort(fn)
  }
}

function when(cond, then) {
  // conditional in pipeline
  // (a -> bool, a -> b) -> a -> a|b
  return function(val) {
    return cond(val) ? then(val) : val
  }
}

function flip(fn) {
  // flip order of arguments of 2-ary function
  // ((a, b) -> c) -> ((b, a) -> c)
  return function(a, b) {
    return fn(b, a)
  }
}

function complement(fn) {
  // boolean invert function output
  // (* -> bool) -> (* -> bool)
  return function() {
    return !fn.apply(this, arguments)
  }
}

function reverse(sequence) {
  // reverse collection. returns Array
  // [*] -> [*]
  return arrayFrom(sequence).reverse()
}

function ascend(fn) {
  // sorting comparator ascending
  // (a -> c) -> (a, a) -> num
  return function(a, b) {
    var A = fn(a),
      B = fn(b)
    if (A > B) return 1
    if (A == B) return 0
    return -1
  }
}

function descend(fn) {
  // sorting comparator descending
  // (a -> c) -> (a, a) -> num
  return flip(asc(fn))
}

function prop(name) {
  // prop getter
  // k -> {k:v} -> v?
  return function(obj) {
    return has(name)(obj) ? obj[name] : undefined
  }
}

function dotProp(name) {
  // convenience wrapper for dotted paths
  // 'k.k' -> {k:{k:v}} -> v?
  return path(name.split('.'))
}

function path(parts) {
  // nested prop getter
  // [k] -> {k:v} -> v?
  return pipe.apply(null, map(prop)(parts))
}

function call(method) {
  // call function / method
  // k -> {k:(() -> a)} -> a
  // () -> (() -> a) -> a
  return function(obj) {
    return method ? obj[method]() : obj()
  }
}

function take(n) {
  // take that supports negative indexing
  // num -> [a] -> [a]
  var args = n < 0 ? [n] : [0, n]
  return function(sequence) {
    return Array.prototype.slice.apply(arrayFrom(sequence), args)
  }
}

function pipe() {
  // function composition
  var fnx = arguments
  return function(val) {
    for (var i = 0; i < fnx.length; i++) val = fnx[i](val)
    return val
  }
}

function compose() {
  // function composition
  var fnx = arguments
  return function(val) {
    for (var i = fnx.length - 1; i >= 0; i--) val = fnx[i](val)
    return val
  }
}

function keys(obj) {
  // object keys
  // {k:v} -> [k]
  var rv = []
  for (var key in obj) if (obj.hasOwnProperty(key)) rv.push(key)
  return rv
}

function values(obj) {
  // object items
  // {k:v} -> [v]
  var rv = []
  for (var key in obj) if (obj.hasOwnProperty(key)) rv.push(obj[key])
  return rv
}

function pluck(name) {
  // pluck single prop
  // k -> [{k:v}] -> [v]
  return map(prop(name))
}

function zip(collections) {
  // zip multiple input arrays / sequences
  // [[a], [b], ...] -> [[a, b, ...]]
  var arrs = map(arrayFrom)(collections)
  var length = pipe(
    pluck('length'),
    sort(),
    prop(0)
  )(arrs)
  rv = []
  for (i = 0; i < length; i++) rv.push(pluck(i)(arrs))
  return rv
}

// functional utility basics
function T() {
  // () -> bool
  return true
}
function F() {
  // () -> bool
  return false
}
function always(val) {
  // a -> (() -> a)
  return function() {
    return val
  }
}
function identity(val) {
  // a -> a
  return val
}

// comparison operators
function eq(a) {
  // a -> a -> bool
  return function(b) {
    return a === b
  }
}
function neq(a) {
  // a -> a -> bool
  return function(b) {
    return a !== b
  }
}
function gt(a) {
  // a -> a -> bool
  return function(b) {
    return b > a
  }
}
function lt(a) {
  // a -> a -> bool
  return function(b) {
    return b < a
  }
}
function gte(a) {
  // a -> a -> bool
  return function(b) {
    return b >= a
  }
}
function lte(a) {
  // a -> a -> bool
  return function(b) {
    return b <= a
  }
}

// logical operators
function not(val) {
  // b -> bool
  return !val
}

// arithmetic operators
function add(a) {
  // num -> num -> num
  // str|* -> *|str -> str
  return function(b) {
    return b + a
  }
}
function sub(a) {
  // num -> num -> num
  return function(b) {
    return b - a
  }
}
function mul(a) {
  // num -> num -> num
  return function(b) {
    return b * a
  }
}
function div(a) {
  // num -> num -> num
  return function(b) {
    return b / a
  }
}
function mod(a) {
  // num -> num -> num
  return function(b) {
    return b % a
  }
}
function pow(a) {
  // num -> num -> num
  return function(b) {
    return Math.pow(b, a)
  }
}
// vi: ft=javascript

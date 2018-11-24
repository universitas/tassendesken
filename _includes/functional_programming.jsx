function toArray(collection) {
  if (collection instanceof Array)
    return collection;
  if (collection.hasOwnProperty('everyItem'))
    collection = collection.everyItem()
  if (collection.hasOwnProperty('getElements'))
    collection = collection.getElements()
  var n = collection.length
  var retval = []
  while (n--)
    retval[n] = collection[n]
  return retval
}

function print() {
  args = toArray(arguments)
  var msg = join(' ')(args)
  $.writeln(msg)
}

function T() {return true}
function F() {return false}
function always(val) {return function() {return val}}
function identity(val) {return val}

function has(prop) {
  return function(obj) {
    return Object.prototype.hasOwnProperty.call(obj, prop)
  }
}

function not(val){return !val}

function eq(a){return function(b){return a === b}}
function neq(a){return function(b){return a !== b}}
function gt(a){return function(b){return b > a}}
function lt(a){return function(b){return b < a}}
function gte(a){return function(b){return b >= a}}
function lte(a){return function(b){return b <= a}}

function add(a){return function(b){return b + a}}
function sub(a){return function(b){return b - a}}
function mul(a){return function(b){return b * a}}
function div(a){return function(b){return b / a}}
function mod(a){return function(b){return b % a}}
function pow(a){return function(b){return Math.pow(b, a)}}

function is(type) {
  return function(val) {
    return val != null && val.constructor === type || val instanceof type
  }
}

function join(sep) {
  return pipe(
    toArray,
    function(list){return list.join(sep||'')}
  )
}

function map(fn) {
  return function(collection) {
    var list = toArray(collection), retval = []
    for (var i = 0; i < list.length; i++) retval.push(fn(list[i]))
    return retval
  }
}

function reduce(fn, into) {
  return function(collection) {
    var list = toArray(collection), retval = into
    for (var i = 0; i <

      function when(cond, then) {
        return function(val) {
          return cond(val) ? then(val) : val
        }
      }


      function filter(fn) {
        return function(collection) {
          var list = toArray(collection), retval = []
          for (var i = 0; i < list.length; i++) fn(list[i]) && retval.push(list[i])
          return retval
        }
      }

      function sort(fn) {
        fn = fn || asc(identity)
        return function(collection) {
          return toArray(collection).sort(fn)
        }
      }

      function flip(fn) {
        return function(a, b) { return fn(b, a) }
      }

      function reverse(collection) {
        return toArray(collection).reverse()
      }

      function asc(fn) {
        return function(a, b) {
          var A = fn(a), B = fn(b)
          if (A > B) return 1;
          if (A == B) return 0;
          return -1;
        }
      }

      function desc(fn) {
        return flip(asc(fn))
      }

      function prop(name) {
        return function(obj) {
          return has(name)(obj) ? obj[name] : undefined
        }
      }

      function dotProp(name) {
        return path(name.split('.'))
      }

      function path(parts) {
        return pipe.apply(null, map(prop)(parts))
      }

      function call(method) {
        return function(obj) {
          return method ? obj[method]() : obj()
        }
      }

      function take(n) {
        var args = n < 0 ? [n] : [0, n]
        return function(collection) {
          return Array.prototype.slice.apply(toArray(collection), args)
        }
      }

      function pipe() {
        var fnx = arguments
        return function(value) {
          for (var i = 0; i < fnx.length; i++)
            value = fnx[i](value)
          return value
        }
      }

      function keys(obj) {
        var retval = []
        for (var key in obj)
          if (obj.hasOwnProperty(key)) retval.push(key)
        return retval
      }

      function values(obj) {
        var retval = []
        for (var key in obj)
          if (obj.hasOwnProperty(key)) retval.push(obj[key])
        return retval
      }

      function pluck(name) {
        return map(prop(name))
      }

      function zip(collections) {
        var arrs = map(toArray)(collections)
        var length = pipe(pluck('length'), sort(), prop(0))(arrs)
        retval = []
        for (i=0; i < length; i++)
          retval.push(pluck(i)(arrs))
        return retval
      }

      function tap(fn) {
        // debugging utility
        fn = fn || print
        return function(value) {
          fn(value)
          return value 
        }
      }

      items = app.activeDocument.pageItems.everyItem().texts
      contents = pipe(
        map(pipe(
          path(['contents']),
          call('toLowerCase'),
        )),
        sort(),
        take(1),
      )(items)


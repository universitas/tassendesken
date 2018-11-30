#target "indesign"
#include ../_includes/index.jsxinc
config.DEBUG = true

// get stories from selected dom Element
function stories(obj) {
  return (
    prop('parentStory')(obj) ||
    pipe(
      prop('allPageItems'),
      pluck('parentStory'),
      filter(Boolean)
    )(obj)
  )
}

//
function info(o) {
  data = {
    name: prop('name')(o),
    id: prop('id')(o),
    type: typeof o,
    constructor: o.constructor.name,
    items: prop('allPageItems')(o),
    stories: stories(o),
    graphics: prop('allGraphics')(o),
    src: uneval(o)
  }
  for (var k in data) if (data[k] === undefined) data[k] = null
  return data
}

map(
  pipe(
    info,
    log
  )
)(app.selection)

function assoc(name, val) {
  // (k, v) -> obj -> obj
  var c = {}
  c[name] = val
  return mergeRight(c)
}

function setAttr(name, val) {
  // mutating / inpure assoc
  // (k, v) -> obj -> obj
  return function(obj) {
    obj[name] = val
    return obj
  }
}

function mutateProp(name, fn) {
  return function(obj) {
    obj[name] = fn(prop(name)(obj))
    return obj
  }
}

function toUpper(val) {
  val = val || ''
  return ('' + val).toUpperCase()
}

// foos =(app.activeDocument.pageItems)
//  map(function(o){ o.label = o.toSpecifier() })(foos)

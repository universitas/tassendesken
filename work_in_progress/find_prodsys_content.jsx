#target indesign
#targetengine session
#include index.jsxinc

function main() {
  config.DEBUG = true
  $.clear()
  app.scriptPreferences.properties = {
    enableRedraw: false,
    userInteractionLevel: UserInteractionLevels.NEVER_INTERACT
  }
  pipe(
    map(applySpec(pageItemSpecs)),
    tap(log),
    apply(overlaps),
    log
  )(app.selection)
}

var pageFilter = pipe(
  // filter for PageItems. Filters only elements valid for export to prodsys
  filter(propEq('parentPage.parent.constructor.name', 'Spread')),
  reject(propEq('label', 'ignore')),
  reject(propEq('itemLayer.name', 'background'))
)

var gbOverlaps = curry(function gbOverlaps(a, b) {
  // gb in the format [y1, x1, y2, x2],
  // which give the coordinates of the top-left and bottom-right corners of the
  // bounding box.
  // box -> box -> bool
  return all([
    a.spread == b.spread,
    a.gb[0] < b.gb[2],
    a.gb[1] < b.gb[3],
    b.gb[0] < a.gb[2],
    b.gb[1] < a.gb[3]
  ])
})

var gbMerge = curry(function gbMerge(a, b) {
  // box -> box -> box
  if (a.spread != b.spread) throw new Error('not on same spread')
  return merge(a, {
    gb: [
      min(a.gb[0], b.gb[0]),
      min(a.gb[1], b.gb[1]),
      max(a.gb[2], b.gb[2]),
      max(a.gb[3], b.gb[3])
    ]
  })
})

var gbAdjust = curry(function gbAdjust(d, obj) {
  // [t, l, r, b] -> {gb: [t, l, r, b]} -> {gb: [t, l, r, b]}
  return assoc('gb', map(apply(add))(zip(d, obj.gb))(obj))
})

var gbSetAttr = curry(function gbSetAttr(box, pageItem) {
  // sets geometric bounds for page item
  pageItem.geometricBounds = box.gb
  return undefined
})

var pageItemSpecs = pipe(
  // PageItem -> {k: v}
  // common properties to extract from PageItems
  applySpec({
    specifier: pipe(
      prop('toSpecifier'),
      flip(apply)([])
    ),
    label: prop('label'),
    gb: prop('geometricBounds'),
    spread: dotProp('parentPage.parent'),
    contents: dotProp('contents'),
    image: dotProp('allGraphics.0.itemLink.name'),
    prodsak_id: always(0),
    prodbilde_id: always(0)
  }),
  when(
    // extract metadata from script label if any
    pipe(
      prop('label'),
      test(/\^ *{.*\} *$/)
    ),
    converge(merge, [
      identity,
      pipe(
        prop('label'),
        JSON.parse
      )
    ])
  )
)

var groupBy = curry(function(keyFn, arr) {
  // (a -> b) -> [a] -> [[a]]
  var rv = {}
  for (var i = 0; i < arr.length; i++) {
    var val = arr[i]
    var key = uneval(keyFn(val))
    if (!rv[key]) rv[key] = []
    rv[key].push(val)
  }
  return values(rv)
})

var isCaption = pipe(
  path(['parentStory', 'paragraphs', 0, 'appliedParagraphStyle', 'name']),
  test(/\bbt\b/)
)

var isImage = pipe(
  path(['allGraphics', 0, 'itemLink', 'name']),
  defaultTo(''),
  test(/\.(jpe?g|png)$/i)
)

function findTextContent(doc) {
  if (!doc) doc = app.activeDocument

  var pageItems = pipe(
    prop('pageItems'),
    pageFilter
  )(doc)

  var captions = pipe(
    filter(isCaption),
    map(pageItemSpecs)
  )(pageItems)
  var graphics = pipe(
    filter(isImage),
    map(pageItemSpecs)
  )(pageItems)
  var textFrames = pipe(
    filter(prop('contents')),
    reject(isCaption),
    map(pageItemSpecs)
  )(pageItems)
}

if (ifMain($.fileName)) main()

// vi: ft=javascript

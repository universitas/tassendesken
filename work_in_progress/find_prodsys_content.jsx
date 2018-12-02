#target indesign
#targetengine session

#include 'index.jsxinc'

config.DEBUG = true
$.strict = true

$.clear()
app.scriptPreferences.properties = {
  enableRedraw: false,
  userInteractionLevel: UserInteractionLevels.NEVER_INTERACT
}

var pageItemSpecs = {
  label: prop('label'),
  spread: dotProp('parentPage.parent'),
  gb: prop('geometricBounds')
}

var pageFilter = pipe(
  filter(propEq('parentPage.parent.constructor.name', 'Spread')),
  omit(propEq('label', 'ignore')),
  omit(propEq('itemLayer.name', 'background'))
)

var overlaps = curry(function overlaps(a, b) {
  // gb in the format [y1, x1, y2, x2],
  // which give the coordinates of the top-left and bottom-right corners of the bounding box.
  return all([
    a.spread == b.spread,
    a.gb[0] < b.gb[2],
    a.gb[1] < b.gb[3],
    b.gb[0] < a.gb[2],
    b.gb[1] < a.gb[3]
  ])
})

pipe(
  map(applySpec(pageItemSpecs)),
  tap(log),
  apply(overlaps),
  log
)(app.selection)

// findTextContent ()

function findTextContent(doc) {
  if (!doc) doc = app.activeDocument

  var pageItems = pipe(
    prop('pageItems'),
    pageFilter
  )(doc)

  var captions = pipe(
    // map(dotProp('parentStory')),
    filter(
      pipe(
        dotProp('parentStory.paragraphs.0.appliedParagraphStyle.name'),
        test(/\bbt\b/)
      )
    ),
    map(
      applySpec({
        contents: dotProp('contents'),
        label: prop('label'),
        specifier: call('toSpecifier'),
        page: dotProp('parentPage.parent'),
        gb: prop('geometricBounds')
      })
    ),
    //filter(null),
    log
  )(pageItems)

  var graphics = pipe(
    filter(dotProp('allGraphics.0')),
    map(
      applySpec({
        image: dotProp('allGraphics.0.itemLink.name'),
        label: prop('label'),
        specifier: call('toSpecifier'),
        spread: dotProp('parentPage.parent'),
        gb: prop('geometricBounds')
      })
    )
    // log,
  )(pageItems)

  var textFrames = pipe(
    dotProp('textFrames'),
    pageFilter,
    pluck('label'),
    filter(null),
    map(JSON.parse),
    map(
      pipe(
        values,
        head
      )
    ),
    uniq
    // log,
  )(doc)
}

var finnEksportSaker = function(myDoc) {
  for (var n = 0; n < myDoc.stories.length; n++) {
    var myStory = myDoc.stories[n]
    if (myStory.paragraphs.length == 0) {
      continue;
    }
    if (dokTools.onPage(myStory) === false) {
      continue;
    }
    if (getLabel(myStory) == 'ignore') {
      continue;
    }
    if (isCaption(myStory)) {
      continue;
    }

    prodsak_id = getLabel(myStory, 'prodsak_id') // scripting label til første textFrame i storien
    if (prodsak_id) {
      if (eksportSaker[prodsak_id] === undefined) {
        // finnes denne saken i objektet eksportSaker ?
        eksportSaker[prodsak_id] = {
          json: prodsys.get(prodsak_id).json,
          stories: [],
          bounds: {},
          images: []
        } // oppretter et nytt objekt i eksportSaker
      }
      eksportSaker[prodsak_id].stories.push(myStory)
    } else if (
      myStory.length > minimumStoryLength ||
      myStory.tables.length > 0
    ) {
      var myText = myStory.contents
      if (myStory.tables.length > 0) {
        // legger til tabelltekst
        myText +=
          '\r' +
          myStory.tables
            .everyItem()
            .cells.everyItem()
            .contents.join('\t')
      }
      inkognitoStories.push({
        prodsak_id: null,
        story: myStory,
        text: myText,
        json: null
      }) // her er en story som trolig skal være med på eksporten. Det gjelder bare å finne ut hvilken sak i prodsys den hører til.
    }
  }
}

var finnEksportBilder = function(myDoc) {
  var myImage
  var myBT
  var prodsak_id
  var prodbilde_id
  for (var n = 0; n < myDoc.allGraphics.length; n++) {
    myImage = myDoc.allGraphics[n]
    if (false === dokTools.onPage(myImage)) continue;
    if (null === myImage.itemLink.name.match(/jpg/)) continue;
    if ('ignore' === getLabel(myImage)) continue;
    myBT = finnbildetekst(myImage.parent) || ''
    if (myBT) myBT = xtagsGrep(myBT.contents)

    prodsak_id = getLabel(myImage, 'prodsak_id')
    prodbilde_id = getLabel(myImage, 'prodbilde_id') || 0
    if (prodsak_id) {
      var sak = eksportSaker[prodsak_id]
      if (sak === undefined) {
        setLabel(myImage, '')
      } else {
        sak.images.push({
          image: myImage,
          prodbilde_id: prodbilde_id,
          bildetekst: myBT
        })
        continue;
      }
    }
    // her er et bilde som trolig skal være med på eksporten. Det gjelder
    // bare å finne ut hvilken sak i prodsys den hører til.
    inkognitoBilder.push({
      prodsak_id: null,
      image: myImage,
      bildetekst: myBT
    })
  }
}

var finnbildetekst = function(myRectangle) {
  // tar et rektangel og returnerer en story med paragraphstyle BT som ligger oppå eller rett under rektanglet.
  var myPage = myRectangle.parent
  var btSone = [0, 0, 10, 0] //  sonen man skal lete etter bildetekst i
  var myTextFrames = myPage.textFrames
  var myTextFrame
  var bildeGB, btGB, btStory
  bildeGB = myRectangle.geometricBounds
  for (var i = 0; i < myTextFrames.length; i++) {
    myTextFrame = myTextFrames[i]
    btGB = myTextFrame.geometricBounds
    if (
      btGB[2] > bildeGB[0] - btSone[0] &&
      btGB[3] > bildeGB[1] - btSone[1] &&
      btGB[0] < bildeGB[2] + btSone[2] &&
      btGB[1] < bildeGB[3] + btSone[3]
    ) {
      if (myTextFrame.paragraphs.length == 0) continue;
      if (isCaption(myTextFrame)) return myTextFrame.parentStory
    }
  }
  return null
}

// vi: ft=javascript

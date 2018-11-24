/* jshint ignore:start */
#target "indesign"
#targetengine "session"
#include ../_includes/index.jsxinc
#include ./loremipsum.jsx
/* jshint ignore:end */

main()

function main() {
  // var LoremIpsumizeMe = true // endrer tekst til loremipsum hvis true, tar litt tid.
  // var promptforLabel = false // Skriptet spør etter Label for hver saksmal
  // dokTools.clearSearch()
  mekkMalGeo(app.selection)
  // tryLogErrors(mekkMalGeo, false)(app.selection, promptforLabel);
  // app.menuActions.item('$ID/Selection Tool').invoke()
}

function mekkMalGeo(selection) {
  if (selection.length === 0) { return }
  var myPrompt = selection[0].label
  var sakstype = myPrompt

  if (promptMe) {
    if (myPrompt === '') {
      myPrompt = selection.length == 1 ? myPrompt : ''
      sakstype = prompt('Lag Geometri\rsakstype?', myPrompt) || ''
    } else {
      sakstype = selection[0].label
    }
  }

  sakstype = sakstype.toLowerCase().replace(/\s+$/, '') // fjerner luft i slutten av label og gjør om til små bokstaver

  if (selection.length == 1 && selection[0] instanceof Group) {
    myGroup = selection[0]
    while (myGroup.groups.length > 0) {
      myGroup.groups.everyItem().ungroup()
    }
    myReportTextFrame = myDok.textFrames.itemByName('' + myGroup.id)
    if (myReportTextFrame !== null) {
      myReportTextFrame.remove()
    }
    selection = myGroup.allPageItems
    myGroup.ungroup()
  }

  for (var n = 0; n < selection.length; n++) {
    try {
      selection[n].label = ''
    } catch (e) {}
    if (selection[n] instanceof TextFrame && LoremIpsumizeMe) {
      loremIpsumize(selection[n])
    }
    if (selection[n] instanceof Rectangle) {
      try {
        selection[n].graphics.firstItem().remove()
      } catch (e) {}
    }
  }

  var mySpread = selection[0].parent
  while (!(mySpread instanceof Spread || mySpread instanceof Application)) {
    mySpread = mySpread.parent
  }
  for (var m = selection.length - 1; m >= 0; m--) {
    if (
      false ===
      (selection[m].parent instanceof Page ||
        selection[m].parent instanceof Spread)
    ) {
      selection.splice(m, 1)
    }
  }
  if (selection.length === 0) {
    return
  } else if (selection.length > 1) {
    myGroup = mySpread.groups.add(selection)
  } else {
    myGroup = selection[0]
  }

  myReport = tagReport(selection, sakstype)


  var myName = myReport.split('\r')[0].replace(/\s/g, ' ')
  if (addToLibrary && myLibrary.itemByName(myName) === null) {
    var myAsset = myGroup.store(myLibrary)
    myAsset.assetType = AssetType.TEXT_TYPE
    myAsset.name = myName
    myAsset.description = myReport
      .split('\r')
      .slice(0, 2)
      .join(' ')
    myAsset.label = myReport
  }
  return myName
}

function summaryOnPage(report, templateGroup) {
  // create a page element with summary
  var myGB = [388, 0, 400, 70]
  var myObjectStyle = dokTools.velgStil(myDok, 'object', 'beskjed')
  var parStyle1 = dokTools.velgStil(myDok, 'paragraph', 'A 5påplassen navn')
  var parStyle2 = dokTools.velgStil(myDok, 'paragraph', 'A 5påplassen')
  var myReportTextFrame = templateGroup.textFrames.add()
  myReportTextFrame.contents = report
  myReportTextFrame.appliedObjectStyle = myObjectStyle
  myReportTextFrame.parentStory.paragraphs[0].appliedParagraphStyle = parStyle1
  myReportTextFrame.parentStory.paragraphs[1].appliedParagraphStyle = parStyle2
  app.findGrepPreferences = NothingEnum.nothing
  app.changeGrepPreferences = NothingEnum.nothing
  app.findGrepPreferences.findWhat = '\rParagraphstyles:'
  app.changeGrepPreferences.changeTo = '~MParagraphstyles:'
  myReportTextFrame.parentStory.changeGrep()
  app.findGrepPreferences.findWhat = 'Paragraphstyles:'
  app.changeGrepPreferences.changeTo = ''
  app.changeGrepPreferences.appliedParagraphStyle = parStyle1
  myReportTextFrame.parentStory.changeGrep()

  myGB = [
    myGB[0],
    (templateGroup.geometricBounds[1] + templateGroup.geometricBounds[3]) / 2 - myGB[3] / 2,
    myGB[2],
    (templateGroup.geometricBounds[1] + templateGroup.geometricBounds[3]) / 2 + myGB[3] / 2
  ]
  app.select(myGroup)

  // Dette må av en eller annen grunn gjøres to ganger. Gjør man det bare en gang, så funker det ikke. Go figure
  myReportTextFrame.geometricBounds = myGB
  myReportTextFrame.geometricBounds = myGB
  myReportTextFrame.label = '' + myGroup.id

  while (myReportTextFrame.overflows) {
    myGB[2] += 5
    if (myGB[2] - myGB[0] > 100) {
      break
    }
    myReportTextFrame.geometricBounds = myGB
  }

  if (myGroup.geometricBounds[2] < 350) {
    myReportTextFrame.geometricBounds = [
      -13 - (myGB[2] - myGB[0]),
      myGB[1],
      -13,
      myGB[3]
    ]
  }
}

function tagReport(myTextFrames, sakstype) {
  var spaltebredde = 57
  var loft = 70
  var loftstr = 250
  var myReport
  var paragraphStyles = []
  var spalter = Math.ceil(
    (myGroup.geometricBounds[3] - myGroup.geometricBounds[1]) / spaltebredde
  )
  var myXtagStyles = []
  var makeReport = function() {
    myReport = (sakstype || 'sakstype') + '\n' + spalter + ' spalter'
    myReport =
      myReport +
      (myGroup.geometricBounds[0] > loft &&
      myGroup.geometricBounds[2] - myGroup.geometricBounds[0] > loftstr
        ? ' loft\r'
        : '\r')
    myReport =
      myReport.substr(0, 1).toUpperCase() + myReport.substr(1).toLowerCase()
    var myStories = []
    var myXtags = ''
    for (n = 0; n < myTextFrames.length; n++) {
      if (
        myTextFrames[n] instanceof TextFrame &&
        myTextFrames[n].textFrameIndex === 0
      ) {
        myStories.push(myTextFrames[n].parentStory)
      }
    }
    myXtags = getXtags(myStories)
    myXtags = xtagsGrep(myXtags)
    myXtags = myXtags.replace(/@/, '')
    //var myXtagStyles = myXtags.match(/@[^:]+:/g)||[];
    paragraphStyles = dokTools.removeDuplicates(paragraphStyles)
    //myXtagStyles = dokTools.removeDuplicates(myXtagStyles);
    var myTaggedText
    var myRegExp
    myReport += 'Xtags:\u0008' + myXtags.length + ' tegn\r'
    if (myXtags) {
      var myXtagsArray = myXtags.split('\n@')
      //myXtagsArray.splice(0,1);
      for (var n = 0; n < myXtagsArray.length; n++) {
        myTaggedText = myXtagsArray[n].match(/([^:]+):(.*)/)
        myReport =
          myReport +
          '@' +
          myTaggedText[1] +
          '\u0008' +
          myTaggedText[2].length +
          ' tegn\r'
      }
    }
    myReport +=
      '\rtegn/spalte:\u0008' + Math.ceil(myXtags.length / spalter) + '\r'

    myReport = myReport + 'Paragraphstyles:' + '\r'
    for (var m = 0; m < paragraphStyles.length; m++) {
      myReport = myReport + paragraphStyles[m] + '\r'
    }
    return myReport
  }

  var getXtags = function(eksportStories) {
    var myXtagsString = ''
    var paragraphStyles = []
    var myStories = []
    var myPictures = []
    var eksportStiler = {}
    var eksportStilerListe = dokTools.parseCSV(config.eksportCSV)
    for (n = 0; n < eksportStilerListe.length; n++) {
      eksportStiler[eksportStilerListe[n][0]] = eksportStilerListe[n][1]
    }
    eksportStiler['A mt'] = eksportStiler['A spørsmål'] = 'txt' // hack!
    for (n = 0; n < eksportStories.length; n++) {
      findElements(eksportStories[n]) // sørger for at nested textFrames også blir med.
    }
    for (n = 0; n < myStories.length; n++) {
      var myStory = {}
      myStory.story = myStories[n]
      var firstchar =
        myStory.story.contents === ''
          ? myStory.story.insertionPoints[0]
          : myStory.story.characters[0]
      try {
        myStory.position = firstchar.horizontalOffset + firstchar.baseline * 2 // hokus pokus lager et vekttall som gjetter leserekkefølgen
      } catch (e) {
        myStory.position = 0
      }

      myStories[n] = myStory
    }

    myStories.sort(function(a, b) {
      return a.position - b.position
    })

    for (var n = myStories.length - 1; n > 0; n--) {
      if (myStories[n].story == myStories[n - 1].story) {
        myStories.splice(n, 1) // fjerner duplikater
      }
    }

    for (var m = 0; m < myStories.length; m++) {
      myXtagsString = myXtagsString + getXtagStory(myStories[m].story)
    }
    return myXtagsString

    function findElements(myStory) {
      var myItem
      var m
      var o
      myStories.push(myStory)
      for (m = 0; m < myStory.tables.length; m++) {
        for (o = 0; o < myStory.tables[m].cells.length; o++) {
          findElements(myStory.tables[m].cells[o].texts[0])
        }
      }
      for (m = 0; m < myStory.pageItems.length; m++) {
        myItem = myStory.pageItems[m].getElements()[0]
        if (myItem.constructor.name == 'TextFrame') {
          findElements(myItem.parentStory)
        } else if (myItem.constructor.name == 'Rectangle') {
          myPictures.push(myItem)
        } else {
          $.bp()
        }
      }
    }

    function getXtagStory(minStory) {
      // denne er ganske treig :(
      var xtagsStory = ''
      var b
      var minTextStyleRange
      var charStyle = ''
      var currentParagraphStyle = ''
      var myParagraphStyle = ''
      for (b = 0; b < minStory.textStyleRanges.length; b += 1) {
        minTextStyleRange = minStory.textStyleRanges[b]
        myParagraphStyle = minTextStyleRange.appliedParagraphStyle.name
        paragraphStyles.push(myParagraphStyle)
        myParagraphStyle = eksportStiler[myParagraphStyle] || '???'
        if (myParagraphStyle != currentParagraphStyle) {
          xtagsStory = xtagsStory + '@' + myParagraphStyle + ':'
          currentParagraphStyle = myParagraphStyle
        }
        if (minTextStyleRange.appliedCharacterStyle.name.match(/I/)) {
          xtagsStory = xtagsStory + '<I>' + minTextStyleRange.contents + '</I>'
        } else {
          xtagsStory = xtagsStory + minTextStyleRange.contents
        }
      }
      return xtagsStory + '\r'
    }
  }

  var xtagsGrep = function(xtagsTekst) {
    // gjør diverse utskiftinger før saken sendes til prodsys
    xtagsTekst = xtagsTekst.replace(
      /(\u2002|\u2003|\u2007|\u2009|\u202F|\u00A0)/g,
      ' '
    ) // diverse space
    xtagsTekst = xtagsTekst.replace(/(\u2013|\u2014)/gi, '--') // gjør om tankestreker til to bindestreker
    xtagsTekst = xtagsTekst.replace(/\u00AD/gi, '') // conditional hyphen (myk bindestrek) fjernes
    xtagsTekst = xtagsTekst.replace(/\uFFFC|\u0016/gi, '') // anchored object tegn fjernes
    xtagsTekst = xtagsTekst.replace(/@SLETT:[^\r]*/gi, '') //fjerner avsnitt med koden SLETT
    xtagsTekst = xtagsTekst.replace(/\n/g, ' ') // linjeskift blir erstattet med mellomrom
    xtagsTekst = xtagsTekst.replace(/^(@[^:]+:)\s+/g, '$1') // fjerne luft
    xtagsTekst = xtagsTekst.replace(/^(@[^:]+:)@+/g, '@') // fjerne tomme avsnitt med xtag
    xtagsTekst = xtagsTekst.replace(/  +/g, ' ') // gjør multispace om til enkelspace.
    xtagsTekst = xtagsTekst.replace(/^\s+/g, '').replace(/\s+$/g, '') // fjerner luft i slutten og starten av teksten.
    xtagsTekst = xtagsTekst.replace(/\s*\r\s*/g, '\r\n\r\n') // sørger for at alle avsnittskift blir markert på samme måte, slik webavisa vil ha det.
    return xtagsTekst
  }
  return makeReport()
}


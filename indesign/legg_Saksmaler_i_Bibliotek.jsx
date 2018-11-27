// Lager saksmaler fra dokumentet saksmaler.indd
// Legger malgrupper til i et bibliotek og oppretter MAL_AVIS.indt
// Skrevet av Håken Lid 2011

#target "indesign"
#targetengine "session"
#include ../_includes/index.jsxinc
dokTools.clearSearch()

var lagreOverAvismal = true // lagrer også ny MAL_AVIS

var myLibrary = File(config.saksmalLibrary) // Biblioteket som saksmalene skal legges til
var lagreSom = File(config.mal_avis) // Avismalen

var doc = app.activeDocument
var win = doc.layoutWindows[0]
var annotation = dokTools.velgStil(doc, 'object', 'beskjed')
var parStyle1 = dokTools.velgStil(doc, 'paragraph', 'A 5påplassen navn')
var parStyle2 = dokTools.velgStil(doc, 'paragraph', 'A 5påplassen')
var myReportTextFrame

if (!alleGrupper) {
  mekkMalGeo(app.selection, promptforLabel)
} else if (
  confirm(
    'Saksmaler\nVil du legge alle saksmaler inn i bibiliteket Saksmaler.indl?',
    false
  )
) {
  if (addToLibrary && myLibrary.exists) {
    win.zoom(ZoomOptions.fitSpread)
    myProgressBar = dokTools.progressBar(
      'Legger maler til ' + myLibrary.name,
      'Gjør klar',
      120,
      false
    )
    app.libraries.everyItem().close()
    backupFile(myLibrary)
    myLibrary = app.open(myLibrary)
    app.panels.itemByName('Saksmaler').visible = false
    myLibrary.assets.everyItem().remove()
  }
  clearReports(doc, annotation)
  var myItem
  var mySpread
  var itemName
  myProgressBar.update('teller grupper', 10)
  var myPageItems = doc.pageItems.everyItem().getElements()
  var myItems = []
  var myPage
  for (i = myPageItems.length - 1; i > -1; i--) {
    myProgressBar.update('teller grupper')
    myItem = myPageItems[i]
    if (!dokTools.onPage(myItem)) continue;
    mySpread = myItem
    if (myItem instanceof Group || myItem instanceof TextFrame) {
      while (
        false ===
        (mySpread instanceof Spread ||
          mySpread instanceof MasterSpread ||
          mySpread instanceof Application)
      ) {
        mySpread = mySpread.parent
      }
      if (mySpread instanceof Spread) {
        myPage = myItem.parent
        if (myPage instanceof Spread) {
          myPage = myPage.pages[0]
        }
        myItems.push([myPage, myItem])
      }
    }
  }
  myProgressBar.update('Finner saker', Math.max(0, 120 - myItems.length))
  myItems.sort(function(a, b) {
    return b[0].name - a[0].name
  })
  for (var i = myItems.length - 1; i >= 0; i--) {
    myItem = myItems[i][1]
    myPage = myItems[i][0]
    app.select(myItem)
    dokTools.zoomTo(myItem)

    if (myItem.label !== '') {
      var svar = mekkMalGeo([myItem], false)
      if (svar === undefined) {
        continue;
      }
      myItem = svar[0]
      itemName = svar[1].split('\r')[0].replace(/\s/g, ' ')
      myProgressBar.update('side ' + myPage.name + '  ' + itemName)
      if (addToLibrary && myLibrary.assets.itemByName(itemName) === null) {
        var myAsset = myItem.store(myLibrary)
        myAsset.assetType = AssetType.TEXT_TYPE
        myAsset.name = itemName
        myAsset.description = svar[1]
          .split('\r')
          .slice(0, 2)
          .join(' ')
        myAsset.label = myReport
      }
    } else {
      dokTools.zoomTo(myItem)
      itemName = prompt('Malnavn? ')
      // itemName = '[' + myItem.constructor.name + '] id# ' + myItem.id
      myProgressBar.update('side ' + myPage.name + '  ' + itemName)
    }
    app.select(null)
    // app.scriptPreferences.enableRedraw = false
  }
  myLibrary.close()
  myProgressBar.close()
  win.activePage = app.activeDocument.pages[0]
}

if (lagreOverAvismal) {
  dokTools.zoomOut()
  if (
    confirm(
      'Lagre over?\rEr du sikker på at du vil lagre ny MAL_AVIS.indt ?',
      false
    )
  ) {
    lagNyAvisMal()
  }
}

function lagNyAvisMal(doc) {
  var avismal = config.avismal
  var myMasterPage
  if (!doc.name.match(/saksmaler/i)) {
    alert('feil fil', 'Kan bare lage avismal fra saksmaler.indd')
    return
  }
  var myProgressBar = dokTools.progressBar(
    'Legger maler til ' + lagreSom.name,
    'Lagrer Saksmaler.indd',
    2 + avismal.length,
    false
  )
  doc.save(undefined, false, undefined, true)
  clearReports(doc, annotation)

  for (var n = 0; n < avismal.length; n++) {
    myProgressBar.update('Lager oppslag: ' + (n + 1) + ' ' + avismal[n].master)
    if (doc.spreads[n] !== null) {
      win.activePage = doc.spreads[n].pages[-1]
    } else {
      win.activePage = doc.spreads[-1].pages[-1]
    }
    $.sleep(100)
    myMasterPage = doc.masterSpreads.itemByName(avismal[n].master)
    if (myMasterPage === null) {
      myMasterPage = doc.masterSpreads[0]
    }
    if (avismal[n].tomside === false) {
      try {
        while (
          doc.spreads[n].appliedMaster !== myMasterPage &&
          doc.spreads[n] !== null
        ) {
          doc.spreads[n].remove()
        }
      } catch (e) {
        doc.spreads.add()
        doc.spreads[-1].appliedMaster = myMasterPage
      }
    } else {
      doc.spreads.add(LocationOptions.BEFORE, doc.spreads[n])
      doc.spreads[n].appliedMaster = myMasterPage
    }
  }
  myProgressBar.update('Tar backup av AVIS_MAL.indt')
  win.activePage = doc.pages[0]
  backupFile(lagreSom)
  myProgressBar.update('Lagrer ny AVIS_MAL.indt')
  doc.save(lagreSom, true, '', true)
  doc.close()
  myProgressBar.update('Ferdig!')
  $.sleep(1000)
  myProgressBar.close()
}
// vi: ft=javascript

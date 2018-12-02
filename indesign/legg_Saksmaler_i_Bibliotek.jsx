// Lager saksmaler fra dokumentet saksmaler.indd
// Legger malgrupper til i et bibliotek og oppretter MAL_AVIS.indt

#target "indesign"
#targetengine "session"
#include ../includes/index.jsxinc

//~ var myLibrary = File(config.saksmalLibrary) // Biblioteket som saksmalene skal legges til
//~ var lagreSom = File(config.mal_avis) // Avismalen

var libraryFile = File('saksmaler.indl')
var lagreSom = File('MAL.indt')
var annotation = 'beskjed'

if (ifMain($.fileName)) main()

function clearReports(doc, objStyle) {
  app.findObjectPreferences = NothingEnum.nothing
  app.findObjectPreferences.appliedObjectStyles = doc.objectStyles.itemByName(
    objStyle
  )
  map(call('remove'))(doc.findObject())
}

function findTemplateGroups(doc) {
  return pipe(
    prop('pageItems'),
    filter(prop('label')),
    filter(either(is(TextFrame), is(Group))),
    filter(propEq('parentPage.parent.constructor.name', 'Spread')),
    sort(
      ascend(
        pipe(
          dotProp('parentPage.name'),
          parseFloat
        )
      )
    )
  )(doc)
}

function itemName(item) {
  var gb = item.geometricBounds
  var width = gb[3] - gb[1]
  var height = gb[2] - gb[0]
  var cols = Math.ceil(width / 57)
  var withLoft = gb[0] > 70 && height > 250 ? ' loft' : ''
  return titleCase(item.label) + ' ' + cols + ' spalter' + withLoft
}

function main() {
  var step0 = confirm(
    'Vil du legge alle saksmaler inn i biblioteket Saksmaler.indl?',
    false,
    'Saksmaler'
  )
  var step1 = confirm(
    'Er du sikker på at du vil lagre ny MAL_AVIS.indt?',
    false,
    'Lagre over'
  )

  if (step0)
    app.doScript(
      buildLibrary,
      undefined,
      undefined,
      UndoModes.ENTIRE_SCRIPT,
      'legg saksmaler'
    )
  if (step1)
    app.doScript(
      lagNyAvisMal,
      undefined,
      undefined,
      UndoModes.FAST_ENTIRE_SCRIPT,
      'lag mal'
    )
}

function prepareLibrary(libraryFile) {
  backupFile(libraryFile)
  map(call('close'))(app.libraries)
  app.libraries.add(libraryFile)
  myLibrary = app.open(libraryFile)
  app.panels.itemByName(myLibrary.name.split('.')[0]).visible = false
  myLibrary.assets.everyItem().remove()
  return myLibrary
}

function buildLibrary() {
  dokTools.zoomOut()
  var myProgressBar = dokTools.progressBar(
    'Legger maler til ' + libraryFile.name,
    'Gjør klar',
    120,
    false
  )
  var doc = app.activeDocument
  clearReports(doc, annotation)
  var myLibrary = prepareLibrary(libraryFile)
  var myItems = findTemplateGroups(app.activeDocument)
  myProgressBar.update('Finner saker', Math.max(0, 120 - myItems.length))
  for (var i = 0; i < myItems.length; i++) {
    var myItem = myItems[i]
    var page = myItems[i].parentPage.name
    var name = itemName(myItem)
    myProgressBar.update('side ' + page + '  ' + name)
    if (myLibrary.assets.itemByName(name) == null) {
      dokTools.zoomTo(myItem)
      var properties = {
        description: name,
        name: name,
        assetType: AssetType.TEXT_TYPE
      }
      myItem.store(myLibrary, properties)
    }
  }
  myLibrary.close()
  dokTools.zoomOut()
  myProgressBar.close()
}

function lagNyAvisMal() {
  var avismal = config.avismal
  var doc = app.activeDocument
  var win = app.activeWindow
  var myMasterPage
  if (!doc.name.match(/saksmaler/i)) {
    alert('feil fil', 'Kan bare lage avismal fra saksmaler.indd')
    return
  }
  dokTools.zoomOut()
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
    myMasterPage = doc.masterSpreads.itemByName(avismal[n].master)
    win.activePage = doc.spreads[n].pages[0]
    if (!myMasterPage.isValid) myMasterPage = doc.masterSpreads[0]
    if (avismal[n].tomside === false) {
      var remove = 0
      while (doc.spreads[n + remove].appliedMaster !== myMasterPage) remove++
      if (remove) doc.spreads.itemByRange(n, n - 1 + remove).remove()
    } else
      doc.spreads.add(LocationOptions.BEFORE, doc.spreads[n], {
        appliedMaster: myMasterPage
      })
  }
  myProgressBar.update('Tar backup av AVIS_MAL.indt')
  backupFile(lagreSom)
  myProgressBar.update('Lagrer ny AVIS_MAL.indt')
  var original = doc.fullName
  doc.save(lagreSom, true, '', true)
  doc.close()
  myProgressBar.update('Ferdig!')
  app.open(original)
  dokTools.zoomOut()
  myProgressBar.close()
}
// vi: ft=javascript

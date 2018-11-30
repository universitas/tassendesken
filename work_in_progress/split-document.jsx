#script "split template document"
#target "indesign"
#targetengine "session"
#include "../_includes/index.jsxinc"

// testing
addSections(app.activeDocument, [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24])
splitDoc(app.activeDocument, 'page-{}-000.indd')

function addSection(doc, pg) {
  if (pg.appliedSection.pageStart == pg) return
  doc.sections.add(pg, {
    pageStart: pg,
    continueNumbering: false,
    pageNumberStart: parseInt(pg.name),
    sectionPrefix: ''
  })
}

function splitDoc(doc, namePattern, pages) {
  // split one document into multiple parts and save

  // setup
  dokTools.zoomOut()
  var progressBar = dokTools.progressBar(
    'Splitter sider',
    'gjør klar',
    pages.length,
    false
  )
  app.scriptPreferences.properties = {
    enableRedraw: false,
    userInteractionLevel: UserInteractionLevels.NEVER_INTERACT
  }
  doc.documentPreferences.allowPageShuffle = true
  var tmpFile = new File('tmp.indd')
  doc.saveACopy(tmpFile)
  var tmpDoc = app.open(tmpFile, false)
  tmpDoc.spreads[0].remove() // remove front page

  pages = pages.sort(function(a, b) {
    return a - b
  })
  for (var i = 0; i < pages.length; i++) {
    var pgNumber = pages[i]
    var fileName = namePattern.replace(/\{\}/, ('0' + pgNumber).substr(-2))
    progressBar.update(fileName, n + 1)
    if (pgNumber == 1) doc.saveACopy(new File(fileName))
    else {
      var pages = doc.pages.itemByRange(pgNumber - 1, -1)
      addSection(doc, pages[0])
      pages.move(LocationOptions.BEFORE, tmpDoc.pages[0])
      tmpDoc.pages.itemByRange(length, tmpDoc.pages.length - 1).remove()
      tmpDoc.saveACopy(new File(fileName))
    }
  }

  // cleanup
  doc.close()
  tmpDoc.close()
  tmpFile.remove()
  progressBar.close()
}

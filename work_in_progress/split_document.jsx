#script "split template document"
#target "indesign"
#targetengine "session"
#include "../includes/index.jsxinc"

main()

// testing
function main() {
  //app.documents.everyItem().close()
  var doc = app.documents.length ? app.activeDocument : app.open('MAL.indt')
  splitDocument(doc, 'page-{}-000.indd', [
    1,
    2,
    4,
    6,
    8,
    10,
    12,
    14,
    16,
    18,
    20,
    22,
    24
  ])
}

function addSection(doc, pg) {
  if (pg.appliedSection.pageStart == pg) return
  doc.sections.add(pg, {
    pageStart: pg,
    continueNumbering: false,
    pageNumberStart: parseInt(pg.name),
    sectionPrefix: ''
  })
}

function splitDocument(doc, namePattern, pageNumbers) {
  // split one document into multiple parts and save

  // setup
  dokTools.zoomOut()
  var progressBar = dokTools.progressBar(
    'Splitter sider',
    'gjør klar',
    pageNumbers.length,
    false
  )
  app.scriptPreferences.properties = {
    enableRedraw: false,
    userInteractionLevel: UserInteractionLevels.NEVER_INTERACT
  }
  // doc.documentPreferences.allowPageShuffle = true
  var tmpFile = new File('tmp.indd')
  doc.saveACopy(tmpFile)
  doc.close()
  var doc0 = app.open(tmpFile, false, OpenOptions.OPEN_COPY)
  var doc1 = app.open(tmpFile, false, OpenOptions.OPEN_COPY)
  tmpFile.remove()
  doc1.documentPreferences.allowPageShuffle = true
  addSection(doc1, doc1.pages[1])
  doc1.pages[0].move(LocationOptions.AT_END)
  doc1.pages.itemByRange(2, -1).remove()

  pageNumbers = sort(descend(parseInt))(pageNumbers)
  for (var i = 0; i < pageNumbers.length; i++) {
    var pgNumber = pageNumbers[i]
    var fileName = namePattern.replace(/\{\}/, ('0' + pgNumber).substr(-2))
    progressBar.update(fileName, i + 1)
    if (pgNumber == 1) doc0.saveACopy(new File(fileName))
    else {
      addSection(doc0, doc0.pages[pgNumber - 1])
      var pages = doc0.pages.itemByRange(pgNumber - 1, -1)
      var length = pages.getElements().length

      pages.move(LocationOptions.BEFORE, doc1.pages[0])
      doc1.pages.itemByRange(length, doc1.pages.length - 1).remove()
      doc1.saveACopy(new File(fileName))
    }
  }
  progressBar.update('rydder opp')
  // cleanup
  doc0.close()
  doc1.close()
  progressBar.close()
  app.scriptPreferences.properties = {
    enableRedraw: true,
    userInteractionLevel: UserInteractionLevels.INTERACT_WITH_ALL
  }
}

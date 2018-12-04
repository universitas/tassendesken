#script "build newspaper pages from template file"
#target "indesign"
#targetengine "session"
#include "../includes/index.jsxinc"
#include "fetch_issue_data.jsxinc"
#include "render_template_with_context.jsxinc"
#include "split_document.jsxinc"

var ANNONSEANSVARLIG = {
  navn: 'Geir Dorp',
  tlf: '22 85 32 69',
  tittel: 'annonseansvarlig',
  epost: 'geir.dorp@universitas.no'
}
var UNIVERSITAS = {
  adresse: 'Moltke Moes vei 33',
  post: 'Boks 89 Blindern, 0314 Oslo',
  epost: 'universitas@universitas.no',
  web: 'https://universitas.no'
}

config.mal_avis = 'MAL_AVIS.indt'

function main() {
  switch (app.documents.length) {
    case 0:
      openNewspaperTemplate()
    case 1:
      return prepareNewspaperTemplate()
    default:
      alert(
        'Opprett sider\r' + 'Lukk andre dokumenter før du oppretter ny avis.'
      )
  }
}

function prepareNewspaperTemplate() {
  // inserts context variables into template and splits it into pages
  var doc = app.documents[0]
  var context = buildRenderContext()
  context.anan = ANNONSEANSVARLIG
  var changes = renderTemplate(doc, context)
  $.clear()
  log(map(join('\t\t'), changes).join('\r'), $)
  var rootDir = Folder(issueFolder(context.issue.nr) + '/INDESIGN/')
  mkdir(rootDir)
  var pages = map(
    applySpec({
      page: identity,
      pageNumber: pipe(
        prop('documentOffset'),
        add(1)
      ),
      fileName: pipe(
        prop('documentOffset'),
        add(1),
        pageFileName(context.issue.pubDate, '1')
      ),
      masterName: path(['appliedMaster', 'name']),
      firstPage: pipe(
        prop('documentOffset'),
        either(eq(0), mod(2)),
        Boolean
      )
    })
  )(doc.pages)
  var callback = function(data) {
    // log(data, '$')
    var pages = pipe(
      prop('pages'),
      filter(prop('firstPage')),
      map(
        applySpec({
          number: prop('pageNumber'),
          file: function(pg) {
            return new File(data.rootDir + '/' + pg.fileName)
          },
          page: prop('page')
        })
      )
    )(data)
    $.clear()
    log(pages, $)
    splitDocument(doc, pages)
  }
  var initialState = { pages: pages, rootDir: rootDir, issue: context.issue }
  splitPagesDialog(doc, initialState, callback)
}

function openNewspaperTemplate() {
  // opens the newspaper template file
  app.open(File(config.mal_avis))
  dokTools.zoomOut()
}

function splitPagesDialog(doc, initialState, callback) {
  // dialog window to select where to split newspaper into spreads
  // (Document, {k: v}, ([{page: Page, file: File}] -> *)) -> 1|2

  callback(initialState)
  return
  var PANEL_SIZE = 24 // max antall sider som vises i menyen
  var w = new Window('palette')
  w.state = initialState
  w.ok = function() {
    alert('ok')
    callback(w.state)
  }
  w.cancel = function() {
    alert('cancel')
    win.close()
  }
  w.changeFolder = function() {
    w.state.rootDir =
      Folder.selectDialog('Velg mappa filene skal lagres i', rootDir.parent) ||
      rootDir
    folderName.text = 'mappe: ' + rootDir
  }
  w.show()
}

if (ifMain($.fileName)) main()

// vi: ft=javascript

#script "build newspaper pages from template file"
#target "indesign"
#targetengine "session"
#include "../includes/index.jsxinc"
#include "fetch_issue_data.jsxinc'
#include "render_template_with_context.jsxinc'
#include "split_document.jsxinc'

function main() {
  if (app.documents.length === 1) prepareNewspaperTemplate()
  if (app.documents.length === 0) openNewspaperTemplate()
  if (app.documents.length > 1)
    alert('Opprett sider\r' + 'Lukk andre dokumenter før du oppretter ny avis.')
}

function prepareNewspaperTemplate() {
  // inserts context variables into template and splits it into pages
  var doc = app.documents[0]
  var context = buildRenderContext()
  renderTemplate(doc, context)
  var rootDir = issueFolder(context.issue.nr)
  var fileNameBuilder = pageFileName(context.issue.pubDate, '1')
  var pages = map(
    applySpec({
      page: identity,
      pageNumber: pipe(
        prop('index'),
        add(1)
      ),
      fileName: pipe(
        prop('index'),
        add(1),
        fileNameBuilder
      ),
      masterName: path(['appliedMaster', 'name']),
      firstPage: pipe(
        prop('index'),
        either(eq(0), mod(2)),
        Boolean
      )
    })
  )(doc.pages)
  var callback = function(data) {
    log(data, '$')
  }
  var initialState = { pages: pages, rootDir: rootdir, issue: context.issue }
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

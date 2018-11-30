#target "indesign"
#targetengine "session"
#include ../_includes/index.jsxinc

if (ifMain($.fileName)) main()
var FILEPATTERN = /^UNI.*.indd$/
FILEPATTERN = /.indd$/

function exportToFile(doc, page, format) {
  var directory = new Folder(doc.filePath.path + '/PREVIEW/')
  directory.exists || directory.create()
  return new File(directory.fsName + '/' + 'page_' + page + '.' + format)
}

function export_all_pages_as_pdf(doc, syncronous) {
  var preset = app.pdfExportPresets.itemByName('UNIVERSITAS')
  if (!preset.isValid) preset = app.pdfExportPresets[-1]
  app.pdfExportPreferences.includeSlugWithPDF = true
  var files = []
  for (var i = 0; i < doc.pages.length; i++) {
    var page = doc.pages[i]
    var file = exportToFile(doc, page.name, 'pdf')
    app.pdfExportPreferences.pageRange = page.name
    if (syncronous) doc.exportFile(ExportFormat.PDF_TYPE, file, false, preset)
    else doc.asynchronousExportFile(ExportFormat.PDF_TYPE, file, false, preset)
    files.push(file)
  }
  return files
}

function export_all_pages_as_jpeg(doc) {
  var expPrefs = app.jpegExportPreferences
  expPrefs.jpegQuality = JPEGOptionsQuality.MEDIUM
  expPrefs.jpegExportRange = ExportRangeOrAllPages.EXPORT_RANGE
  expPrefs.useDocumentBleeds = true
  expPrefs.exportingSpread = false
  expPrefs.exportResolution = 150
  var files = []
  for (var i = 0; i < doc.pages.length; i++) {
    var page = doc.pages[i]
    var file = exportToFile(doc, page.name, 'jpg')
    expPrefs.pageString = page.name
    doc.exportFile(ExportFormat.JPG, file, false)
    files.push(file)
  }
  log('foo')
  return files
}

function postSaveExport(event) {
  var doc = event.target
  $.writeln(doc)
  if (!(doc.constructor.name == 'Document' && doc.name.match(FILEPATTERN))) {
    $.writeln('didnt match')
    return
  }
  tryLogErrors(export_all_pages_as_pdf)(doc)
}

function removeEventListeners(eventType) {
  // detach all event listener of type
  return pipe(
    prop('eventListeners'),
    filter(propEq('eventType', eventType)),
    map(call('remove')),
    prop('length')
  )(app)
}

function main() {
  removeEventListeners(DocumentEvent.BEFORE_SAVE)
  app.addEventListener(DocumentEvent.BEFORE_SAVE, postSaveExport)
  $.writeln('added event listener')
  postSaveExport({ target: app.activeDocument })
}

// vi: ft=javascript

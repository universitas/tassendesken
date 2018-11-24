/* jshint ignore:start */
#target "indesign"
#targetengine "session"
#include ../_includes/index.jsxinc
/* jshint ignore:end */


function exportToFile(doc, page, format) {
  var directory = new Folder(doc.filePath.path + '/PREVIEW/')
  directory.exists || directory.create()
  return new File(directory.fsName + '/' + 'page_' + page + '.' + format)
}

function export_all_pages_as_pdf(doc, syncronous) {
  var preset = app.pdfExportPresets[6].duplicate()
  // app.pdfExportPreferences.includeSlugWithPDF = true
  preset.includeSlugWithPDF = true
  for (var i = 0; i < doc.pages.length; i++) {
    var page = doc.pages[i]
    var file = exportToFile(doc, page.name, 'pdf')
    app.pdfExportPreferences.pageRange = page.name
    if (syncronous) doc.exportFile(ExportFormat.PDF_TYPE, file, false, preset);
    else doc.asynchronousExportFile(ExportFormat.PDF_TYPE, file, false, preset);
  }
  preset.remove()
}  

function export_all_pages_as_jpeg(doc) {
  var expPrefs = app.jpegExportPreferences
  expPrefs.jpegQuality = JPEGOptionsQuality.MEDIUM  
  expPrefs.jpegExportRange = ExportRangeOrAllPages.EXPORT_RANGE
  expPrefs.useDocumentBleeds = true
  expPrefs.exportingSpread = false
  expPrefs.exportResolution = 150
  for (var i = 0; i < doc.pages.length; i++) {
    var page = doc.pages[i]
    var file = exportToFile(doc, page.name, 'jpg')
    expPrefs.pageString = page.name
    doc.exportFile(ExportFormat.JPG, file , false)
  }
}

function postSaveExport(event) {
  var doc = event.target
  $.writeln(doc)
  if (!(doc.constructor.name == 'Document' && doc.name.match(/UNI.*.indd/))) {
    return
  }
  export_all_pages_as_pdf(doc)
}

// app.addEventListener('beforeSave', postSaveExport)
// timeIt(export_all_pages_as_jpeg)(app.activeDocument)
timeIt(export_all_pages_as_pdf)(app.activeDocument, true)
// export_all_pages_as_jpeg(app.activeDocument)
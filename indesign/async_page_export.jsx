#target indesign
#targetengine session
#includepath ../_includes
#include index.jsxinc

var pageExport = {
  filePattern: /^UNI.*\.indd$/,       // only run on indesign files matching this pattern
  event: DocumentEvent.BEFORE_SAVE,   // attach event handler to this indesign even
  main: function() {
    removeEventListeners(pageExport.event, preSaveExport)
    app.addEventListener(pageExport.event, preSaveExport)
 }
}

// ifMain should be defined
if (typeof ifMain == 'undefined') var ifMain = function() { return true }
if (ifMain($.fileName)) pageExport.main()

function preSaveExport(event) {
  // event listener handler to export pages
  var doc = event.target
  if (!doc.name.match(pageExport.filePattern)) return
  return tryLogErrors(export_all_pages_as_pdf)(doc, false)
}

function export_all_pages_as_pdf(doc, syncronous) {
  // (Document, bool) -> [File]
  var preset = app.pdfExportPresets.itemByName('UNIVERSITAS')
  if (!preset.isValid) preset = app.pdfExportPresets[-1]  // fallback preset for testing
  var files = []
  var fileName = exportFileName(doc, 'pdf')
  for (var i = 0; i < doc.pages.length; i++) {
    var page = doc.pages[i]
    var file = fileName(page.name)
    app.pdfExportPreferences.pageRange = page.name
    if (syncronous) doc.exportFile(ExportFormat.PDF_TYPE, file, false, preset)
    else doc.asynchronousExportFile(ExportFormat.PDF_TYPE, file, false, preset)
    files.push(file)
  }
  return files
}

function export_all_pages_as_jpeg(doc) {
  // Document -> [File]
  var files = []
  var fileName = exportFileName(doc, 'jpg')
  for (var i = 0; i < doc.pages.length; i++) {
    var page = doc.pages[i]
    var file = fileName(page.name)
    app.jpegExportPreferences.properties = jpeg_preferences(page)
    doc.exportFile(ExportFormat.JPG, file, false)
    files.push(file)
  }
  return files
}

function jpeg_preferences(page) {
  // build JpegExportPreferences
  // (Page) -> {k: v}
  return {
    pageString: page.name, 
    exportingSpread: false, 
    jpegQuality: JPEGOptionsQuality.MEDIUM, 
    jpegRenderingStyle: JPEGOptionsFormat.PROGRESSIVE_ENCODING, 
    jpegExportRange: ExportRangeOrAllPages.EXPORT_RANGE, 
    embedColorProfile: false, 
    jpegColorSpace: JpegColorSpaceEnum.RGB, 
    useDocumentBleeds: true, 
    antiAlias: true, 
    simulateOverprint:false, 
    exportResolution: 150, 
  }
}

function exportFileName(doc, format) {
  // Generate filenames for the export pages
  // (Document, str) -> Page -> File
  var path = doc.filePath.path + '/' + format.toUpperCase() + '/'
  var directory = new Folder(path)
  directory.exists || directory.create()
  var fileHead = doc.name.substr(0,14)
  return function(page) {
    // get output filename for each page
    var pageNumber = ('00' + page).substr(-2)
    return new File(directory + '/' + fileHead + pageNumber + '000.' + format)
  }
}  

function removeEventListeners(eventType, handler) {
  // detach all event listener of type
  var pattern = handler ? new RegExp( '^' + handler.name +'$' ) : /.*/
  var filterEvents = function (ev) {
    return ev.handler.name.match(pattern) && ev.eventType == eventType
  }
  return pipe(
    prop('eventListeners'),
    filter(filterEvents),
    map(call('remove')),
    prop('length'),
  )(app)
}

// vi: ft=javascript
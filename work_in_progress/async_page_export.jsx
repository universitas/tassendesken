#target "indesign"
#targetengine "session" // maybe use a dedicated session?
#include ../includes/index.jsxinc

// async export pdf when saving outputFile with name matching this pattern
var FILEPATTERN = config.DEBUG ? /.indd$/ : /^UNI.*000.indd$/

function asyncPdfExportListener() {
  var postSaveHandler = pipe(
    prop('target'),
    when(
      pipe(
        prop('name'),
        test(FILEPATTERN)
      ),
      tryLogErrors(exportEveryPageAsPDF)
    )
  )
  removeEventListeners(DocumentEvent.BEFORE_SAVE)
  app.addEventListener(DocumentEvent.BEFORE_SAVE, postSaveHandler)
  $.writeln('added event listener')
  // postSaveHandler({ target: app.activeDocument })
}

function _exportFileName(doc, format, page) {
  var outputDir = new Folder(doc.filePath.path + '/PREVIEW/')
  var stem = doc.name.slice(0, 14) // UNI1XTASYYMMDD + PP000.indd
  mkdir(outputDir)
  return function(page) {
    var fileName = stem + zeroPad(2)(page.name) + '000.' + format
    return new File(outputDir + '/' + fileName)
  }
}

function exportEveryPageAsPDF(doc, syncronous) {
  var preset = app.pdfExportPresets.itemByName('UNIVERSITAS')
  if (!preset.isValid) preset = app.pdfExportPresets[-1]
  app.pdfExportPreferences.includeSlugWithPDF = true
  var fileNames = _exportFileName(doc, 'pdf')
  var outputFiles = []
  for (var i = 0; i < doc.pages.length; i++) {
    var page = doc.pages[i]
    app.pdfExportPreferences.pageRange = page.name
    var outputFile = fileNames(page)
    var method = syncronous ? doc.exportFile : doc.asynchronousExportFile
    method.apply(doc, [ExportFormat.PDF_TYPE, outputFile, false, preset])
    outputFiles.push(outputFile)
  }
  return outputFiles
}

function exportEveryPageAsJPEG(doc) {
  var expPrefs = app.jpegExportPreferences
  expPrefs.jpegQuality = JPEGOptionsQuality.MEDIUM
  expPrefs.jpegExportRange = ExportRangeOrAllPages.EXPORT_RANGE
  expPrefs.useDocumentBleeds = false
  expPrefs.exportingSpread = false
  expPrefs.exportResolution = 150
  var fileNames = _exportFileName(doc, 'jpg')
  var outputFiles = []
  for (var i = 0; i < doc.pages.length; i++) {
    var page = doc.pages[i]
    expPrefs.pageString = page.name
    var outputFile = fileNames(page)
    doc.exportFile(ExportFormat.JPG, outputFile, false)
    outputFiles.push(outputFile)
  }
  return outputFiles
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

if (ifMain($.fileName)) asyncPdfExportListener()

// vi: ft=javascript

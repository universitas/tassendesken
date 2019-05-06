#target "indesign";
#targetengine "session";
#includepath "../includes/";
#include "index.jsxinc";
#include "eksport.jsxinc"; // brukergrensesnittet

var pdfSideDefault = false
var eksporterDefault = true

function getDocument() {
  var doc, errorMsg
  try {
    doc = app.activeDocument
    if (doc.saved) return doc
    errorMsg =
      'Kan ikke opprette PDF\r' +
      'Lagre dokumentet før du lager kan eksportere en pdf'
  } catch (e) {
    errorMsg = 'Åpne et dokument'
  }
  alert(errorMsg)
  exit()
}

function exportPage(doc, page, path) {
  var preset = app.pdfExportPresets.itemByName('UNIVERSITAS')
  app.pdfExportPreferences.viewPDF = false
  app.pdfExportPreferences.pageRange = page
  doc.exportFile(ExportFormat.pdfType, path, false, preset, '', true)
}

function main() {
  var doc = getDocument()
  var outputDirectory = doc.filePath.path + '/PDF/'
  var PDFmappe = new Folder(outputDirectory)
  if (!PDFmappe.exists) PDFmappe.create()

  var fileNameRoot = doc.name.match(/UNI11VER/)
    ? doc.name.slice(0, -10)
    : 'UNI11VER' + nextFriday()

  var eksportliste = []
  var myDialog = app.dialogs.add({
    name: 'Eksporter til PDF',
    canCancel: true
  })
  var myColumn = myDialog.dialogColumns.add()
  myColumn.staticTexts.add({
    staticLabel: 'Eksporter til mappe: ' + outputDirectory
  })
  var dialogbokser = []
  for (var i = 0; i < doc.pages.length; i += 1) {
    var myPage = doc.pages[i]
    eksportliste.push({
      page: myPage,
      pageNumber: myPage.name,
      filnavn: fileNameRoot + zeroPad(2)(myPage.name) + '000.pdf',
      path: outputDirectory
    })
  }
  for (i = 0; i < eksportliste.length; i += 1) {
    var myRow = myColumn.dialogRows.add()
    dialogbokser[i] = []
    dialogbokser[i][0] = myRow.checkboxControls.add({
      staticLabel: 'side ' + eksportliste[i].pageNumber,
      checkedState: pdfSideDefault
    })
    dialogbokser[i][1] = myRow.textEditboxes.add({
      minWidth: 200,
      editContents: eksportliste[i].filnavn
    })
  }
  var tilProdsys = myColumn.dialogRows.add().checkboxControls.add({
    staticLabel: 'Eksporter alle saker tilbake til prodsys?',
    checkedState: eksporterDefault
  })
  var myResult = myDialog.show()
  if (myResult) {
    if (doc.modified) {
      // lagrer dokumentet hvis det er gjort endringer
      doc.save()
    }
    doc.sections.everyItem().sectionPrefix = ''
    var myProgressBar = dokTools.progressBar(
      'Lager PDF',
      '',
      doc.pages.length + 1,
      false
    )
    for (i = 0; i < dialogbokser.length; i += 1) {
      if (dialogbokser[i][0].checkedState) {
        var pg = eksportliste[i]
        var message =
          'Eksporterer side ' + pg.pageNumber + ' til pdf\n' + pg.filnavn
        myProgressBar.update(message, i + 1)
        pg.filnavn = dialogbokser[i][1].editContents
        pg.path = new File(outputDirectory + pg.filnavn)
        exportPage(doc, pg.pageNumber, pg.path)
      }
    }
    myProgressBar.close()
    if (tilProdsys.checkedState) eksportTilProdsys(doc)
  }
}

if (ifMain($.fileName))
  app.doScript(
    main,
    ScriptLanguage.JAVASCRIPT,
    [],
    UndoModes.ENTIRE_SCRIPT,
    'eksporter'
  ) 
// vi: ft=javascript

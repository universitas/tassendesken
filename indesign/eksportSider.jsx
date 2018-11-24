#target "indesign";
#targetengine "session";
#includepath "../_includes/";
#include "index.jsxinc";
#include "eksport.jsxinc"; // brukergrensesnittet

var pdfSideDefault = false
var eksporterDefault = true
// doc.pages[0].appliedSection.sectionPrefix = ''

function getDocument() {
  var doc, errorMsg
  try { 
    doc = app.activeDocument 
    if (doc.saved) 
      return doc
    errorMsg =  
      'Kan ikke opprette PDF\r' +
      'Lagre dokumentet før du lager kan eksportere en pdf'
  } catch (e) { 
    errorMsg = 'Åpne et dokument' 
  }
  alert(errorMsg)
  exit()
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
        var message = 'Eksporterer side ' + pg.pageNumber + ' til pdf\n' + pg.filnavn
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

function exportPage(doc, page, path) {
  var preset = app.pdfExportPresets.itemByName('UNIVERSITAS')
  app.pdfExportPreferences.viewPDF = false
  app.pdfExportPreferences.pageRange = page  
  doc.exportFile(ExportFormat.pdfType, path, false, preset, '', true)
}

function zeroPad(width, fillchar) {
  // zeroPad(5)(42) -> '00042'
  var padding = Array(width + 1).join(fillchar || '0')
  return function(n) {
    var digits = '' + n
    return digits.length < width
      ? (padding + digits).slice(-width)
      : digits
  }
}

function currentIssue(root) {
  // Finner kommende currentIssue av avisa ved å lete etter mappe med høyest tall.
  for (var i = 50; i > 0; i--) 
    if (Folder(path + zeroPad(2)(i)).exists) return i;
  throw new Error('could not find folder')
}

function nextFriday() {
  var now = new Date()
  now.setDate(now.getDate() + (5 - now.getDay()))
  var year = then.getFullYear().toString().slice(-2)
  var month = zeroPad(2)(then.getMonth())
  var day = zeroPad(2)(then.getDate())
  return year + month + day
}

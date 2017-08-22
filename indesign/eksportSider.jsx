/* jshint ignore:start */
#include ../_includes/dokTools.jsxinc
#include ../_includes/eksport.jsxinc
#include ../_includes/prodsys.jsxinc
#targetengine "session"
/* jshint ignore:end */

try {
  var dok = app.activeDocument;
} catch (e) {
  exit();
}

var pdfSideDefault = false;
var eksporterDefault = true;
var endreSidetallDefault = false;
var utgave = utgave();
var nestefredag = nestefredag();
dok.pages[0].appliedSection.sectionPrefix = "";

if (!dok.saved) { // hvis dokumentet er "untitled"
  alert(
    "Kan ikke opprette PDF\rLagre dokumentet før du lager kan eksportere en pdf"
  ); // setter inn sidetall og lager filnavn
} else { // hvis siden er lagret og har filnavn
  lagPDF(dok); // eksporterer PDF
}

function lagPDF(dok) {
  var myName = "UNI11VER" + nestefredag;
  var myPath = dok.filePath.path + "/PDF/";
  var PDFmappe = new Folder(myPath);
  if (!PDFmappe.exists) { // finnes PDF-folderen?
    PDFmappe.create();
  }
  if (dok.name.match(/UNI11VER/)) { //hvis dokumentet har et filnavn som inneholder "UNI11VER" så tar man utgangspunkt i det.
    myName = dok.name.slice(0, -10);
  }
  var eksportliste = [];
  var myDialog = app.dialogs.add({
    name: "Eksporter til PDF",
    canCancel: true
  });
  var myColumn = myDialog.dialogColumns.add();
  myColumn.staticTexts.add({
    staticLabel: "Eksporter til mappe: " + myPath
  });
  var dialogbokser = [];
  for (var i = 0; i < dok.pages.length; i += 1) {
    var myPage = dok.pages[i];
    var pageNumber = myPage.name;
    if (pageNumber < 10) {
      pageNumber = "0" + pageNumber;
    }
    eksportliste.push({
      page: myPage,
      pageNumber: myPage.name,
      filnavn: myName + pageNumber + "000.pdf",
      path: myPath
    });
  }
  for (i = 0; i < eksportliste.length; i += 1) {
    var myRow = myColumn.dialogRows.add();
    dialogbokser[i] = [];
    dialogbokser[i][0] = myRow.checkboxControls.add({
      staticLabel: "side " + eksportliste[i].pageNumber,
      checkedState: pdfSideDefault
    });
    dialogbokser[i][1] = myRow.textEditboxes.add({
      minWidth: 200,
      editContents: eksportliste[i].filnavn
    });
  }
  var tilProdsys = myColumn.dialogRows.add()
    .checkboxControls.add({
      staticLabel: "Eksporter alle saker tilbake til prodsys?",
      checkedState: eksporterDefault
    });
  var myResult = myDialog.show();
  if (myResult) {
    if (dok.modified) { // lagrer dokumentet hvis det er gjort endringer
      dok.save();
    }
    dok.sections.everyItem()
      .sectionPrefix = "";
    var myProgressBar = dokTools.progressBar("Lager PDF", "", dok.pages.length +
      1, false);
    for (i = 0; i < dialogbokser.length; i += 1) {
      if (dialogbokser[i][0].checkedState) {
        fjern = true;
        minEksportSide = eksportliste[i];
        myProgressBar.update("Eksporterer side " + minEksportSide.pageNumber +
          " til pdf\n" + minEksportSide.filnavn, i + 1);
        minEksportSide.filnavn = dialogbokser[i][1].editContents;
        minEksportSide.path = new File(myPath + minEksportSide.filnavn);
        try {
          eksportPDF(minEksportSide.pageNumber, minEksportSide.path);
        } catch (myError) { // pdf-fila er åpen i acrobat
          var slettmeg = new File(myPath + "slettmeg.pdf");
          if (slettmeg.exists) {
            slettmeg.remove();
          }
          minEksportSide.path.rename("slettmeg.pdf");
          minEksportSide.path = new File(myPath + minEksportSide.filnavn);
          eksportPDF(minEksportSide.pageNumber, minEksportSide.path);
        }
      }
    }
    myProgressBar.close();
    if (tilProdsys.checkedState) {
        eksportTilProdsys(dok);     
    }
  }
}

function eksportPDF(page, path) {
  var myOverflows, svar;
  myOverflows = dokTools.findOverflows(dok.pages.itemByName(page));
  if (myOverflows.length > 0) {
    myOverflows = myOverflows.join("\r\r");
    myOverflows = myOverflows.length > 1000 ? myOverflows.substr(0, 1000) +
      "[...]" : myOverflows;
    svar = confirm(
      "Tekst flyter over, eksporter likevel?\rDet finnes tekst på side " + page +
      " som ikke kommer med:\r\r" + myOverflows);
    if (svar === false) {
      return;
    }
  }
  var myPDFpref = app.pdfExportPresets.itemByName("UNIVERSITAS");
  app.pdfExportPreferences.viewPDF = false;
  app.pdfExportPreferences.pageRange = page;
  try {
    dok.exportFile(ExportFormat.pdfType, path, false, myPDFpref, "", true);
  } catch (e) {
    throw (e);
  }
}

function utgave() {
  // Finner kommende utgave av avisa ved å lete etter mappe med høyest tall.
  var path = config.rotMappe; // TODO fjern hardkoding
  var nummer;
  var myFile;
  for (i = 50; i > 0; i--) {
    if (i < 10) {
      nummer = "0" + i;
    } else {
      nummer = i;
    }
    myFile = Folder(path + nummer);
    if (myFile.exists) {
      break; // har funnet riktig utgave
    }
  }
  return i;
}

function nestefredag() {
  var idag = new Date();
  var ukedag = idag.getDay();
  var fredag = new Date();
  var resultat = "";
  fredag.setDate(idag.getDate() + (5 - ukedag));
  resultat = fredag.getFullYear()
    .toString()
    .slice(2);
  if (fredag.getMonth() + 1 < 10) {
    resultat += "0" + (fredag.getMonth() + 1);
  } else {
    resultat += fredag.getMonth() + 1;
  }
  if (fredag.getDate() < 10) {
    resultat += "0" + fredag.getDate();
  } else {
    resultat += fredag.getDate();
  }
  return resultat;
}

/* jshint ignore:start */
#target "indesign"
#targetengine "session"
#include ../_includes/index.jsxinc
/* jshint ignore:end */

var dok = app.activeDocument
var gammeltDok = new File(dok.fullName)
var nyttDok = endreSideTall(dok, gammeltDok.path)
if (nyttDok && gammeltDok != nyttDok) {
  gammeltDok.remove()
}

function endreSideTall(dok, mappe) {
  // fikser sidetall, filnavn med mer på nye sider fra malen
  var sidetallboks, saved, myFile
  var firstPage = parseInt(dok.pages[0].name)
  var myDialog = app.dialogs.add({
    name: 'Første side av oppslaget?',
    canCancel: true
  })
  with (myDialog) {
    //Add a dialog column.
    with (dialogColumns.add()) {
      with (borderPanels.add()) {
        with (dialogColumns.add()) {
          staticTexts.add({
            staticLabel: 'Sidetall for første side av oppslaget:'
          })
        }
        with (dialogColumns.add()) {
          sidetallboks = integerEditboxes.add({
            editValue: firstPage
          })
        }
      }
    }
  }
  //Display the dialog box.
  var myResult = myDialog.show()
  if (myResult === true) {
    //Get the values from the dialog box controls.
    saved = false
    firstPage = sidetallboks.editValue

    sidetall(firstPage)
    if (firstPage < 10) {
      firstPage = '0' + firstPage
    }

    var filnavn = 'UNI11VER' + nestefredag() + firstPage + '000.indd'
    myFile = new File(mappe + '/' + filnavn) // new file object

    if (myFile.exists) {
      myDialog = app.dialogs.add({
        name: 'Lagre over?',
        canCancel: true
      })
      myDialog.dialogColumns.add().staticTexts.add({
        staticLabel:
          'Fila: ' + myFile.name + ' finnes fra før. Vil du lagre over?'
      })
      myResult = myDialog.show()
      if (myResult) {
        try {
          dok.save(myFile) // lagrer over
          saved = true
        } catch (myError) {
          // hvis det av en ellera annen grunn ikke funker
          alert(
            'Kan ikke lagre fila\rfilnavn: ' +
              myFile.path +
              '/' +
              myFile.name +
              '/r' +
              myError
          )
        }
      }
    } else {
      try {
        dok.save(myFile) // save to ...
        saved = true
      } catch (myError) {
        alert(
          'Kan ikke lagre fila\rSjekk at mappe for denne utgaven eksisterer\rfilnavn: ' +
            myFile.path +
            '/' +
            myFile.name
        )
      }
    }
  }
  myDialog.destroy()
  return saved ? myFile : null
}

function sidetall(tall) {
  // Endrer hvor sidetallene starter i dokument.
  var seksjon
  if (dok.pages[0].name % 2 === 0 && tall % 2 == 1 && dok.pages.length > 1) {
    //tall = oddetall, men activedocument starter med en venstreside
    var myPage = dok.pages[1]
    try {
      myPage.appliedSection.remove()
    } catch (myError) {}
    seksjon = dok.sections.add(myPage)
    seksjon.continueNumbering = false
    seksjon.pageNumberStart = tall
    seksjon.sectionPrefix = ''
    dok.pages[0].remove()
  } else {
    seksjon = dok.pages[0].appliedSection
    seksjon.continueNumbering = false
    seksjon.pageNumberStart = tall
    seksjon.sectionPrefix = ''
  }
}

function nestefredag(idag) {
  //TODO denne er strødd rundt. fiks det.
  // Returnerer dag for neste utgave i formatet YYMMDD for filnavn.
  idag = idag || new Date() //
  var fredag = new Date(idag.getTime()) // kloner idag
  var UKE = 7 //antall dager i en uke, ja.
  var FREDAG = 5 //Fredag
  var UKESTART = 3 //Onsdag
  fredag.setDate(
    idag.getDate() + FREDAG + UKESTART - (idag.getDay() + UKESTART) % UKE
  )
  var YY = fredag
    .getFullYear()
    .toString()
    .slice(-2)
  var MM = ('0' + (fredag.getMonth() + 1)).slice(-2)
  var DD = ('0' + fredag.getDate()).slice(-2)
  return YY + MM + DD
}

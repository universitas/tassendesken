/* jshint ignore:start */
#include ../_includes/index.jsxinc
#target "indesign"
#targetengine "session"
/* jshint ignore:end */

var avismal = File(config.mal_avis); // malfil for avisa
var smallFont = config.smallFont;

var mekkfilerPanel = {
  visDialog: function() {
    var panelSize = 24; // max antall sider som vises i menyen
    var myPages = myDoc.pages.everyItem().getElements();
    var utgaveNr = utgave();
    var myFolder = Folder(config.rotMappe + ("0" + utgaveNr).slice(-2) + "/INDESIGN/");
    if (false === myFolder.exists) {
      myFolder.create();
    }

    var filnavn = "UNI11VER" + nestefredag() + "XX000.indd"; // "XX" skal byttes ut med sidetall
    var pageArray = [];
    for (var n = 0; n < myPages.length; n++) {
      var myPageNumber = ("0" + parseInt(myDoc.pages[n].name)).slice(-2);
      var masterPage = myPages[n].appliedMaster.name;
      var page = {};
      page.pageNumber = myPageNumber;
      page.filename = filnavn.replace(/XX/, myPageNumber);
      page.master = masterPage;
      page.start = (n === 0 || n % 2 == 1);
      pageArray[n] = page;
    }
    var win = new Window("palette", "Opprett sider", undefined); // Selve vinduet som GUI vises i
    win.location = [60, 60]; // hvor på skjermen paletten skal dukke opp
    win.mainpanel = win.add("group");
    win.mainpanel.orientation = "column";
    win.mainpanel.spacing = 2;
    win.mainpanel.margins = [0, 0, 0, 0];

    win.header = win.mainpanel.add("group");
    win.header.sidetall = win.header.add("statictext", undefined, "startside:");
    win.header.sidetall.preferredSize = [68, 20];
    win.header.filename = win.header.add("statictext", undefined, "filnavn:");
    win.header.filename.preferredSize = [202, 20];
    win.header.master = win.header.add("statictext", undefined, "master:");
    win.header.master.preferredSize = [75, 20];

    win.panel1 = win.mainpanel.add("group");
    win.panel1.orientation = "row";
    win.panel1.spacing = 2;
    win.panel1.margins = [2, 2, 2, 2];
    var listePanel = win.panel1.add("panel", undefined, undefined, {
      borderStyle: "sunken"
    });
    listePanel.alignChildren = "fill";
    listePanel.margins = [0, 0, 0, 0];
    listePanel.firstIndex = 0;
    
 
    win.infoboks = win.mainpanel.add("statictext", undefined, "Del opp avisa i flere filer. Velg hvilke sider som skal være førsteside i de ulike indesign-filene og endre filnavnene hvis nødvendig.", {
      multiline: true
    });
    win.infoboks.preferredSize = [355, 50];
    win.infoboks.graphics.font = smallFont;
    
    win.folderName = win.mainpanel.add("statictext", undefined, "utgave:  " + utgaveNr);
    win.folderName.preferredSize = [355, 15];
    win.folderName.graphics.font = smallFont;
    
    win.folderName = win.mainpanel.add("statictext", undefined, "dato:    onsdag " + dateToString (nesteonsdag ()));
    win.folderName.preferredSize = [355, 15];
    win.folderName.graphics.font = smallFont;

    win.folderName = win.mainpanel.add("statictext", undefined, "mappe:  " + myFolder);
    win.folderName.preferredSize = [355, 15];
    win.folderName.graphics.font = smallFont;


    listePanel.refresh = function() { // fjerner innholdet i panelet og lager et nytt - i tilfelle antall saker i prodsys er endra eller noe sånt.
      for (var linje = listePanel.children.length - 1; linje >= 0; linje--) {
        listePanel.remove(listePanel.children[linje]);
      }
      listePanel.create();
      win.layout.layout(true);
      listePanel.update(listePanel.firstIndex);
    };

    listePanel.create = function() {
      if (listePanel.scrollbar) {
        win.panel1.remove(listePanel.scrollbar);
      }
      var listSize;
      if (pageArray.length > panelSize) { // scrollbar hvis sakslista er for lang
        var myScrollbar = listePanel.scrollbar = win.panel1.add("scrollbar", undefined, listePanel.firstIndex, 0, pageArray.length - panelSize);
        myScrollbar.alignment = ["right", "fill"];
        myScrollbar.preferredSize.width = 16;
        myScrollbar.onChanging = function() {
          forsteSak = Math.floor(myScrollbar.value);
          listePanel.update(forsteSak);
        };
        myScrollbar.stepdelta = Math.floor(panelSize / 2);
        myScrollbar.jumpdelta = myScrollbar.stepdelta;
        listSize = panelSize;
      } else {
        listSize = pageArray.length;
      }
      for (var linje = 0; linje < listSize; linje++) {
        var minRad = listePanel.add("group");

        minRad.pageArrayIndex = 0; // korresponderer med indexen i pageArray
        minRad.spacing = 5; // regulerer hvor trangt det skal være mellom elementene i panelet
        minRad.margins = [5, -5, 5, -5]; // regulerer hvor trangt det skal være mellom elementene i panelet [venstre,topp,høyre,bunn]

        minRad.sidetall = minRad.add("statictext", undefined, "side 00");
        minRad.sidetall.preferredSize = [45, 20];
        //minRad.sidetall.graphics.font = smallFont;
        


        minRad.startFil = minRad.add("checkbox");
        minRad.startFil.onClick = function(aktivRad) {
          return function() {
            pageArray[aktivRad.pageArrayIndex].start = aktivRad.startFil.value;
            if (aktivRad.startFil.value) {
              aktivRad.filename.show();
            } else {
              aktivRad.filename.hide();
            }
          };
        }(minRad);
        minRad.startFil.helpTip = "Første side i InDesign-fil?";

        minRad.filename = minRad.add("edittext");
        minRad.filename.preferredSize = [200, 20];
        minRad.filename.helpTip = "Filnavn";
        minRad.filename.onChange = function(aktivRad) {
          return function() {
            aktivRad.filename.text = (aktivRad.filename.text.replace(/[^a-z0-9.]+/gi, "_") + ".").replace(/\..*/, ".indd");
            pageArray[aktivRad.pageArrayIndex].filename = aktivRad.filename.text;
          };
        }(minRad);
        minRad.master = minRad.add("statictext", undefined, "master");
        minRad.master.preferredSize = [75, 20];
        minRad.master.graphics.font = smallFont;
      }
      listePanel.update();
    };

    listePanel.update = function(firstIndex) { // firstIndex er indexen på første sak som skal vises i panelet
      var minSide;
      listePanel.firstIndex = (firstIndex === undefined) ? listePanel.firstIndex : firstIndex; // hvis firstIndex er undefined blir ikke indexen endret
      for (var linje = 0; linje < listePanel.children.length; linje++) {
        minRad = listePanel.children[linje];
        minRad.pageArrayIndex = linje + listePanel.firstIndex;
        minSide = pageArray[minRad.pageArrayIndex];

        minRad.sidetall.text = "side " + (minSide.pageNumber);
        minRad.master.text = (minSide.master);

        minRad.startFil.value = minSide.start;
        minRad.filename.text = minSide.filename;

        minRad.startFil.onClick();
      }
    };

    listePanel.create();


    win.panel2 = win.mainpanel.add("group", undefined, undefined); // gruppe med kontroller nederst i vinduet

    // Knappen "Velg mappe"
    win.changeFolderBtn = win.panel2.add("button", undefined, "Velg mappe", undefined); // en knapp
    win.changeFolderBtn.helpTip = "Velg en annen mappe";
    win.changeFolderBtn.onClick = function() {
      myFolder = Folder.selectDialog("Velg mappa filene skal lagres i", myFolder.parent) || myFolder;
      win.folderName.text = "mappe: " + myFolder;
    };

    // Knappen "Avbryt"
    win.lukkMegBtn = win.panel2.add("button", undefined, "Avbryt", undefined); // knapp som lukker vinduet.
    win.lukkMegBtn.helpTip = "Avbryt";
    win.lukkMegBtn.onClick = function() {
      win.close(); // lukker vinduet
    };

    // Knappen "OK"
    win.hentSakerBtn = win.panel2.add("button", undefined, "OK", undefined); // en knapp
    win.hentSakerBtn.helpTip = "Oppdater sakslista fra prodsys";
    win.hentSakerBtn.onClick = function() {
      win.close();
      endredato();
      mekkfilerPanel.mekkSider(pageArray, myFolder);
    };

    win.show(); // viser vinduet i InDesign

    function dateToString(date) {
      var mnd = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"];
      return dateline = date.getDate() + ". " + mnd[date.getMonth()] + " " + (date.getYear() + 1900);
    }

    function endredato() {
      //riktig dato
      var onsdag = nesteonsdag();
      var dateline = dateToString(onsdag);
      var datelineFront = "årgang " + (onsdag.getYear() - 46) + ", utgave " + utgave();
      app.findGrepPreferences = NothingEnum.nothing;
      app.changeGrepPreferences = NothingEnum.nothing;
      app.findChangeGrepOptions.includeLockedLayersForFind = true;
      app.findChangeGrepOptions.includeLockedStoriesForFind = true;
      app.findChangeGrepOptions.includeMasterPages = true;
      app.findGrepPreferences.findWhat = "(?i)xx. xxxx 20xx";
      app.changeGrepPreferences.changeTo = dateline;
      app.activeDocument.changeGrep();
      app.findGrepPreferences.findWhat = "(?i)utgave XX, .rgang XX";
      app.changeGrepPreferences.changeTo = datelineFront;
      app.activeDocument.changeGrep();
      app.findGrepPreferences = NothingEnum.nothing;
      app.changeGrepPreferences = NothingEnum.nothing;
    }


    function utgave(nummer) {
      var path = config.rotMappe;
      var myFile;
      if (nummer) {
        myFile = Folder(path + ("0" + nummer).slice(-2));
        if (myFile.exists) {
          return nummer;
        }
      }
      for (i = 50; i > 0; i--) {
        nummer = ("0" + i).slice(-2);
        myFile = Folder(path + nummer);
        if (myFile.exists) {
          return i;
        }
      }
      return 0;
    }

    function nestefredag() {
      var idag = new Date();
      var ukedag = idag.getDay();
      var fredag = new Date();
      var resultat = "";
      if (ukedag > 2) {
        ukedag = ukedag - 7;
      }
      fredag.setDate(idag.getDate() + (5 - ukedag));
      resultat = fredag.getFullYear().toString().slice(2);
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

    function nesteonsdag() {
      var idag = new Date();
      var ukedag = idag.getDay();
      var onsdag = new Date();
      ukedag = ukedag > 2 ? ukedag - 7 : ukedag;
      onsdag.setDate(idag.getDate() + (3 - ukedag));
      return onsdag;
    }
  }
};

mekkfilerPanel.mekkSider = function(sideArray, myFolder) {
  myFolder = myFolder.fullName + "/";
  var myDoc = app.documents[0]; // knep for at progress bar ikke skal lukkes.
  app.layoutWindows[0].zoom(ZoomOptions.FIT_SPREAD);
  //app.layoutWindows[0].zoomPercentage = 60;
  var seksjon;
  var filenames = "";
  var myFile;
  var pages = myDoc.pages.length;
  var length = 0;
  var startPage;
  var lastPage = sideArray.length;
  var myPage;
  for (n = sideArray.length - 1; n >= 0; n--) {
    myPages = sideArray[n];
    if (myPages.start) {
      myPages.first = n;
      myPages.last = lastPage + 0;
      lastPage = n - 1;
    } else {
      sideArray.splice(n, 1);
    }
  }

  if (sideArray.length > 0) {
    myFile = File(myFolder + sideArray[0].filename);
    $.writeln(myFile);
    myDoc.save(myFile);
    myDoc.close();
    app.documents.add();
    var myProgress = dokTools.progressBar("Splitter sider", "gjør klar", sideArray.length, false);
    sideArray[0].file = myFile;
    var saveIt = function(myDoc) { // Det ser ut som om filsystemet henger i blandt
      try {
        myDoc.save();
      } catch (e) { // prøver på nytt etter 100 millisekunder
        $.sleep(100);
        saveIt(myDoc);
      }
    };
    for (n = 1; n < sideArray.length; n++) {
      myFile = File(myFolder + sideArray[n].filename);
      sideArray[0].file.copy(myFile);
      sideArray[n].file = myFile;
      myFile = null; // kan dette hjelpe?
    }
    for (n = 0; n < sideArray.length; n++) {
      myPages = sideArray[n];
      filenames = filenames + "\n" + myPages.file.name;
      myProgress.update(myPages.file.name, n + 1);
      myDoc = app.open(myPages.file, false);
      startPage = myDoc.pages[myPages.first];
      seksjon = startPage.appliedSection;
      seksjon.pageStart = startPage;
      seksjon.continueNumbering = false;
      seksjon.pageNumberStart = parseInt(myPages.pageNumber);
      seksjon.sectionPrefix = "";
      if (myPages.last < myDoc.pages.length - 1) {
        myDoc.pages.itemByRange(myPages.last + 1, -1).remove();
      }
      if (myPages.first > 0) {
        myDoc.pages.itemByRange(0, myPages.first - 1).remove();
      }
      saveIt(myDoc);
      myDoc.close();
    }
    myProgress.close();
    app.documents.everyItem().close(SaveOptions.NO);
    alert("Opprettet " + sideArray.length + " dokumenter" + filenames);
  } else {
    alert("Ugyldig valg\rKan ikke splitte dokumenter");
  }
};


// for testing av mekkfilerPanel.jsxinc TODO: Finn ut hva jeg tenkte her!
/* jshint ignore:start */
// #targetengine "session"
// #include "config.jsxinc"
// #include "dokTools.jsxinc"
/* jshint ignore:end */

if (app.documents.length == 1) {
  var myDoc = app.activeDocument;
  mekkfilerPanel.visDialog();
} else if (app.documents.length === 0) {
  app.open(avismal);
} else {
  alert("Opprett sider\rKan ikke opprette sider når du har mer enn ett dokument åpent");
}

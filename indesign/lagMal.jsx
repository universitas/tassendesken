/* jshint ignore:start */
#include ../_includes/dokTools.jsxinc
#include ../_includes/config.jsxinc
#targetengine "session"
/* jshint ignore:end */

dokTools.clearSearch();

var alleGrupper = false; // hvis true finner alle grupper i dokumentet og lager malgeometri, hvis false, kun den gruppen som er valgt
var LoremIpsumizeMe = true; // endrer tekst til loremipsum hvis true, tar litt tid.
var addToLibrary = false; // Legger til saksmaler i Library
var promptforLabel = false; // Skriptet spør etter Label for hver saksmal
var lagreOverAvismal = false; // lagrer også ny MAL_AVIS

var myLibrary = app.libraries.item("Saksmaler.indl"); // Biblioteket som saksmalene skal legges til

var myDok = app.activeDocument;
var myGroup;
var myReport = "";
var myObjectStyle = dokTools.velgStil(myDok, "object", "beskjed");
var parStyle1 = dokTools.velgStil(myDok, "paragraph", "A 5påplassen navn");
var parStyle2 = dokTools.velgStil(myDok, "paragraph", "A 5påplassen");
var myReportTextFrame;
if (addToLibrary) {
  if (myLibrary === null) {
    addToLibrary = false;
  } else {
    myLibrary.assets.everyItem().remove();
  }
}

if (!alleGrupper) {
  mekkMalGeo(app.selection, promptforLabel);
} else {
  clearReports(myDok, myObjectStyle);
  var myItem;
  var itemName;
  var myPageItems = myDok.pageItems.everyItem().getElements();
  var myItems = [];
  var myPage;
  for (i = myPageItems.length - 1; i > -1; i--) {
    myItem = myPageItems[i];
    if ((myItem instanceof Group || myItem instanceof TextFrame) && myItem.parent) {
      myItems.push(myItem);
    }
  }
  $.writeln("\n\nNye elementer i library:\n");

  for (var i = 0; i < myItems.length - 1; i++) {
    myGroup = myItems[i];
    myPage = myGroup.parent;
    if (!(myPage instanceof Page)) {
      myPage = myPage.pages[0];
    }
    var mySpread = myGroup;
    if (myGroup.label !== "") {
      while (false === (mySpread instanceof Spread || mySpread instanceof MasterSpread)) {
        mySpread = mySpread.parent;
      }
      if (mySpread instanceof Spread) {
        itemName = mekkMalGeo([myGroup], false);
      }
    } else {
      itemName = "[" + myGroup.constructor.name + "]" + myGroup.id;
      if (myGroup instanceof TextFrame) {
        itemName += myGroup.contents.slice(0, 10);
      }
    }
    $.writeln(i + " p" + myPage.name + "   " + itemName);
  }
  if (lagreOverAvismal) {
    if (confirm("Lagre over?\rEr du sikker på at du vil lagre ny MAL_AVIS.indt ?", false)) {
      lagNyAvisMal();
      alert("Ny MAL_AVIS er laget");
    }
  }
}

app.menuActions.item("$ID/Selection Tool").invoke();

function mekkMalGeo(mySelection, promptMe) {
  var myGB = [388, 0, 400, 70];
  if (mySelection.length === 0) {
    return;
  }
  var myPrompt = mySelection[0].label;
  var sakstype = myPrompt;

  if (promptMe) {
    if (myPrompt === "") {
      myPrompt = (mySelection.length == 1) ? myPrompt : "";
      sakstype = prompt("Lag Geometri\rsakstype?", myPrompt) || "";
    } else {
      sakstype = mySelection[0].label;
    }
  }

  sakstype = sakstype.toLowerCase().replace(/\s+$/, ""); // fjerner luft i slutten av label og gjør om til små bokstaver

  if (mySelection.length == 1 && mySelection[0] instanceof Group) {
    myGroup = mySelection[0];
    while (myGroup.groups.length > 0) {
      myGroup.groups.everyItem().ungroup();
    }
    myReportTextFrame = myDok.textFrames.itemByName("" + myGroup.id);
    if (myReportTextFrame !== null) {
      myReportTextFrame.remove();
    }
    mySelection = myGroup.allPageItems;
    myGroup.ungroup();
  }

  for (var n = 0; n < mySelection.length; n++) {
    try {
      mySelection[n].label = "";
    } catch (e) {}
    if (mySelection[n] instanceof TextFrame && LoremIpsumizeMe) {
      loremIpsumize(mySelection[n]);
    }
    if (mySelection[n] instanceof Rectangle) {
      try {
        mySelection[n].graphics.firstItem().remove();
      } catch (e) {}
    }
  }

  var mySpread = mySelection[0].parent;
  while (!(mySpread instanceof Spread || mySpread instanceof Application)) {
    mySpread = mySpread.parent;
  }
  for (var m = mySelection.length - 1; m >= 0; m--) {
    if (false === (mySelection[m].parent instanceof Page || mySelection[m].parent instanceof Spread)) {
      mySelection.splice(m, 1);
    }
  }
  if (mySelection.length === 0) {
    return;
  } else if (mySelection.length > 1) {
    myGroup = mySpread.groups.add(mySelection);
  } else {
    myGroup = mySelection[0];
  }

  myReport = tagReport(mySelection, sakstype);

  var myReportTextFrame = myGroup.parent.textFrames.add();
  myReportTextFrame.contents = myReport;
  myReportTextFrame.appliedObjectStyle = myObjectStyle;
  myReportTextFrame.parentStory.paragraphs[0].appliedParagraphStyle = parStyle1;
  myReportTextFrame.parentStory.paragraphs[1].appliedParagraphStyle = parStyle2;
  app.findGrepPreferences = NothingEnum.nothing;
  app.changeGrepPreferences = NothingEnum.nothing;
  app.findGrepPreferences.findWhat = "\rParagraphstyles:";
  app.changeGrepPreferences.changeTo = "~MParagraphstyles:";
  myReportTextFrame.parentStory.changeGrep();
  app.findGrepPreferences.findWhat = "Paragraphstyles:";
  app.changeGrepPreferences.changeTo = "";
  app.changeGrepPreferences.appliedParagraphStyle = parStyle1;
  myReportTextFrame.parentStory.changeGrep();


  myGB = [myGB[0], ((myGroup.geometricBounds[1] + myGroup.geometricBounds[3]) / 2) - (myGB[3] / 2),
    myGB[2], ((myGroup.geometricBounds[1] + myGroup.geometricBounds[3]) / 2) + (myGB[3] / 2)
  ];
  app.select(myGroup);

  // Dette må av en eller annen grunn gjøres to ganger. Gjør man det bare en gang, så funker det ikke. Go figure
  myReportTextFrame.geometricBounds = myGB;
  myReportTextFrame.geometricBounds = myGB;
  myReportTextFrame.label = "" + myGroup.id;

  while (myReportTextFrame.overflows) {
    myGB[2] += 5;
    if ((myGB[2] - myGB[0]) > 100) {
      break;
    }
    myReportTextFrame.geometricBounds = myGB;
  }

  if (myGroup.geometricBounds[2] < 350) {
    myReportTextFrame.geometricBounds = [-13 - (myGB[2] - myGB[0]), myGB[1], -13, myGB[3]];
  }
  var myName = myReport.split("\r")[0].replace(/\s/g, " ");
  if (addToLibrary && myLibrary.itemByName(myName) === null) {
    var myAsset = myGroup.store(myLibrary);
    myAsset.assetType = AssetType.TEXT_TYPE;
    myAsset.name = myName;
    myAsset.description = myReport.split("\r").slice(0, 2).join(" ");
    myAsset.label = myReport;
  }
  return myName;
}


function tagReport(myTextFrames, sakstype) {
  var spaltebredde = 57;
  var loft = 70;
  var loftstr = 250;
  var myReport;
  var paragraphStyles = [];
  var spalter = Math.ceil((myGroup.geometricBounds[3] - myGroup.geometricBounds[1]) / spaltebredde);
  var myXtagStyles = [];
  var makeReport = function() {
    myReport = (sakstype || "sakstype") + "\n" + spalter + " spalter";
    myReport = myReport + ((myGroup.geometricBounds[0] > loft && myGroup.geometricBounds[2] - myGroup.geometricBounds[0] > loftstr) ? " loft\r" : "\r");
    myReport = myReport.substr(0, 1).toUpperCase() + myReport.substr(1).toLowerCase();
    var myStories = [];
    var myXtags = "";
    for (n = 0; n < myTextFrames.length; n++) {
      if (myTextFrames[n] instanceof TextFrame && myTextFrames[n].textFrameIndex === 0) {
        myStories.push(myTextFrames[n].parentStory);
      }
    }
    myXtags = getXtags(myStories);
    myXtags = xtagsGrep(myXtags);
    myXtags = myXtags.replace(/@/, "");
    //var myXtagStyles = myXtags.match(/@[^:]+:/g)||[];
    paragraphStyles = dokTools.removeDuplicates(paragraphStyles);
    //myXtagStyles = dokTools.removeDuplicates(myXtagStyles);
    var myTaggedText;
    var myRegExp;
    myReport += "Xtags:\u0008" + myXtags.length + " tegn\r";
    var myXtagsArray = myXtags.split("\n@");
    //myXtagsArray.splice(0,1);
    for (var n = 0; n < myXtagsArray.length; n++) {
      myTaggedText = myXtagsArray[n].match(/([^:]+):(.*)/);
      myReport = myReport + "@" + myTaggedText[1] + "\u0008" + myTaggedText[2].length + " tegn\r";
    }
    myReport += "\rtegn/spalte:\u0008" + Math.ceil(myXtags.length / spalter) + "\r";

    myReport = myReport + "Paragraphstyles:" + "\r";
    for (var m = 0; m < paragraphStyles.length; m++) {
      myReport = myReport + paragraphStyles[m] + "\r";
    }
    return myReport;
  };

  var getXtags = function(eksportStories) {
    var myXtagsString = "";
    var paragraphStyles = [];
    var myStories = [];
    var myPictures = [];
    var eksportStiler = {};
    var eksportStilerListe = dokTools.parseCSV(config.eksportCSV);
    for (n = 0; n < eksportStilerListe.length; n++) {
      eksportStiler[eksportStilerListe[n][0]] = eksportStilerListe[n][1];
    }
    eksportStiler["A mt"] = eksportStiler["A spørsmål"] = "txt"; // hack!
    for (n = 0; n < eksportStories.length; n++) {
      findElements(eksportStories[n]); // sørger for at nested textFrames også blir med.
    }
    for (n = 0; n < myStories.length; n++) {
      var myStory = {};
      myStory.story = myStories[n];
      var firstchar = (myStory.story.contents === "") ? myStory.story.insertionPoints[0] : myStory.story.characters[0];
      try {
        myStory.position = firstchar.horizontalOffset + firstchar.baseline * 2; // hokus pokus lager et vekttall som gjetter leserekkefølgen
      } catch (e) {
        myStory.position = 0;
      }

      myStories[n] = myStory;
    }

    myStories.sort(function(a, b) {
      return (a.position - b.position);
    });

    for (var n = myStories.length - 1; n > 0; n--) {
      if (myStories[n].story == myStories[n - 1].story) {
        myStories.splice(n, 1); // fjerner duplikater
      }
    }

    for (var m = 0; m < myStories.length; m++) {
      myXtagsString = myXtagsString + getXtagStory(myStories[m].story);
    }
    return myXtagsString;

    function findElements(myStory) {
      var myItem;
      var m;
      var o;
      myStories.push(myStory);
      for (m = 0; m < myStory.tables.length; m++) {
        for (o = 0; o < myStory.tables[m].cells.length; o++) {
          findElements(myStory.tables[m].cells[o].texts[0]);
        }
      }
      for (m = 0; m < myStory.pageItems.length; m++) {
        myItem = myStory.pageItems[m].getElements()[0];
        if (myItem.constructor.name == "TextFrame") {
          findElements(myItem.parentStory);
        } else if (myItem.constructor.name == "Rectangle") {
          myPictures.push(myItem);
        } else {
          $.bp();
        }
      }
    }

    function getXtagStory(minStory) { // denne er ganske treig :(
      var xtagsStory = "";
      var b;
      var minTextStyleRange;
      var charStyle = "";
      var currentParagraphStyle = "";
      var myParagraphStyle = "";
      for (b = 0; b < minStory.textStyleRanges.length; b += 1) {
        minTextStyleRange = minStory.textStyleRanges[b];
        myParagraphStyle = minTextStyleRange.appliedParagraphStyle.name;
        paragraphStyles.push(myParagraphStyle);
        myParagraphStyle = eksportStiler[myParagraphStyle] || "???";
        if (myParagraphStyle != currentParagraphStyle) {
          xtagsStory = xtagsStory + "@" + myParagraphStyle + ":";
          currentParagraphStyle = myParagraphStyle;
        }
        if (minTextStyleRange.appliedCharacterStyle.name.match(/I/)) {
          xtagsStory = xtagsStory + "<I>" + minTextStyleRange.contents + "</I>";
        } else {
          xtagsStory = xtagsStory + minTextStyleRange.contents;
        }
      }
      return xtagsStory + "\r";
    }

  };

  var xtagsGrep = function(xtagsTekst) { // gjør diverse utskiftinger før saken sendes til prodsys
    xtagsTekst = xtagsTekst.replace(/(\u2002|\u2003|\u2007|\u2009|\u202F|\u00A0)/g, " "); // diverse space
    xtagsTekst = xtagsTekst.replace(/(\u2013|\u2014)/gi, "--"); // gjør om tankestreker til to bindestreker
    xtagsTekst = xtagsTekst.replace(/\u00AD/gi, ""); // conditional hyphen (myk bindestrek) fjernes
    xtagsTekst = xtagsTekst.replace(/\uFFFC|\u0016/gi, ""); // anchored object tegn fjernes
    xtagsTekst = xtagsTekst.replace(/@SLETT:[^\r]*/gi, ""); //fjerner avsnitt med koden SLETT
    xtagsTekst = xtagsTekst.replace(/\n/g, " "); // linjeskift blir erstattet med mellomrom
    xtagsTekst = xtagsTekst.replace(/^(@[^:]+:)\s+/g, "$1"); // fjerne luft
    xtagsTekst = xtagsTekst.replace(/^(@[^:]+:)@+/g, "@"); // fjerne tomme avsnitt med xtag
    xtagsTekst = xtagsTekst.replace(/  +/g, " "); // gjør multispace om til enkelspace.
    xtagsTekst = xtagsTekst.replace(/^\s+/g, "").replace(/\s+$/g, ""); // fjerner luft i slutten og starten av teksten.
    xtagsTekst = xtagsTekst.replace(/\s*\r\s*/g, "\r\n\r\n"); // sørger for at alle avsnittskift blir markert på samme måte, slik webavisa vil ha det.
    return xtagsTekst;
  };
  return makeReport();
}

function errorAlert(errorString) {
  var myAlert = new Window("dialogue", "Error", [50, 50, 200, 200], properties);

}

function clearReports(myDok, objStyle) {
  var myTextFrame;
  for (var i = myDok.textFrames.length - 1; i >= 0; i--) {
    myTextFrame = myDok.textFrames[i];
    if (myTextFrame.appliedObjectStyle == objStyle) {
      myTextFrame.remove();
    }
  }
}


function loremIpsumize(myText) { // myText could be a TextFrame, Story, InsertionPoint, Word, Text etc...
  var loremIpsumDictionary = [
    [""], // this is the dictionary of words sorted by number of letters. The words are taken from InDesigns "fill with placeholder text"-feature
    ["a", "e", "y"],
    ["el", "si", "em", "se", "an", "er", "do", "re", "te", "at", "os", "od", "to", "et", "eu", "ud", "na", "ex", "ed", "ut", "ad", "il", "in", "la", "it", "is", "ip", "am", "ea"],
    ["ing", "lam", "vel", "lan", "lis", "lor", "ute", "ver", "con", "lum", "lut", "ibh", "del", "unt", "min", "mod", "feu", "nim", "nis", "nit", "non", "nos", "bla", "eum", "eui", "num", "aut", "dio", "odo", "wis", "tis", "tio", "pis", "pit", "qui", "ate", "tin", "tie", "ese", "tet", "tem", "dip", "rat", "ero", "ril", "rit", "ros", "dit"],
    ["duis", "alit", "dunt", "ecte", "sisi", "elis", "elit", "enim", "enis", "enit", "sent", "wisl", "erat", "amet", "tate", "alis", "erci", "erit", "wisi", "eros", "esed", "esse", "essi", "dion", "atem", "atet", "acil", "esto", "atio", "quis", "atue", "etue", "quip", "ting", "etum", "atum", "quat", "quam", "diat", "euip", "prat"],
    ["lorem", "ispum", "magna", "ulput", "lutem", "minci", "minis", "lummy", "commy", "adiat", "minit", "conse", "lorer", "lorem", "ullum", "adiam", "lobor", "modip", "modit", "lenit", "lenim", "laore", "cipit", "molor", "utpat", "velis", "iusto", "iusci", "iurem", "molum", "velit", "ullan", "ullam", "nisci"],
    ["mconse", "magnit", "mincip", "magnis", "magnim", "minisi", "minisl", "lutpat", "wissis", "wissim", "acidui", "modiat", "commod", "luptat", "wiscip", "wiscin", "lumsan", "wiscil", "molent", "cinibh", "lortio", "vulput", "molore", "lortin", "lortie", "vullut", "vullan", "vullam", "ncidui", "volute", "lorper"],
    ["feuisci", "sustrud", "ationse", "feuisis", "feuisit", "feuguer", "feuismo", "feugiat", "feummod", "feugiam", "hendiam", "feugait", "dolorem", "andreet", "suscipi", "hendrem", "hendrer", "facipit", "heniamc", "amconul", "atuerat", "facipis", "dolorer", "facinim", "tetummy", "facinim", "delesto"],
    ["dolortis", "vendreet", "vullutat", "consequi", "niatuero", "eugiamet", "nismodit", "adignibh", "eugiatet", "zzriusto", "doluptat", "veliquat", "nonsecte", "veliquam", "velestis", "dolortio", "nonsenim", "velessim", "dolortin", "dolortie", "velenibh", "nonsequi", "veleniat", "conullam", "eraessit"],
    ["iriliquis", "blandipis", "quismolor", "irillamet", "consequis", "iriuscing", "blaorerit", "iriustrud", "etuerosto", "nissectet", "vendiamet", "volestisl", "dionsenim", "digniamet", "eniatisit", "quamcommy", "iurerosto", "ionsequat", "ptatueros", "consequat", "duiscipit", "scillummy", "veliquisl"],
    ["loremipsum", "exeriurero", "nummodolor", "ullamcommy", "veriliquat", "conulputat", "uismodolor", "exeraessit", "exerostrud", "nullaortis", "tisiscipis", "nullaoreet", "nullandrem", "odigniamet", "nullandiat", "verciduisi", "erciduisit", "faciduisim", "lummolessi", "facincipit", "voloreetum"],
    ["dolortionum", "veliquiscil", "euguerostie", "veliquamcon", "aciliquisim", "eummolestin", "adionsequat", "adipsustrud", "vercincinis", "dolorpercin", "exeraestrud", "ullaorperit", "wismolobore", "amconsequis", "essequating", "facipsustio", "doloreetuer", "elesequisim", "augiametuer"],
    ["dolutatueros", "adigniamcore", "velesequipit", "adigniscipis", "eummolortion", "dolorperiure", "dolorpercing", "ulputpatetue", "uipsuscidunt", "aliquipsusci", "tumsandionse", "tionsequisim", "facilismolut", "facillametum", "atueraestrud", "sustionsenim", "iliquatiniat", "dolenismodit"]
  ];

  loremIpsumDictionary = [
    [""], // Gangsta!
    ["i", "a"],
    ["yo", "eu", "ut", "up", "sa", "fo", "go", "we", "ac", "at", "to", "im", "oo", "in", "of", "it", "ma", "my", "mi", "et", "da"],
    ["the", "bow", "leo", "its", "nec", "non", "wow", "out", "own", "ass", "hac", "son", "get", "for", "and", "pot", "yih", "cum", "sit", "saw", "mah", "est", "vel", "sed", "you"],
    ["shit", "shut", "amet", "quis", "quam", "ante", "phat", "dope", "down", "yall", "eget", "sure", "pede", "elit", "away", "enim", "orci", "nunc", "dang", "nisl", "nisi", "nibh", "neck", "mofo", "bomb", "urna", "boom", "this", "went", "home", "uhuh", "shiz", "dawg"],
    ["vitae", "morbi", "fresh", "neque", "funky", "fusce", "velit", "metus", "doggy", "crazy", "thats", "black", "massa", "gonna", "risus", "nulla", "mamma", "dolor", "felis", "purus", "break", "crunk", "lacus", "class", "owned", "justo", "stuff", "izzle", "ipsum", "chung", "check", "bling", "shizz"],
    ["pimpin", "ornare", "pizzle", "lectus", "bizzle", "libero", "ligula", "daahng", "luctus", "platea", "tellus", "nullam", "vizzle", "things", "hizzle", "tortor", "nostra", "sizzle", "mattis", "rizzle", "mauris", "gizzle", "nizzle", "ghetto", "sapien", "mizzle", "varius", "dizzle", "tempor", "montes", "turpis", "sheezy", "taciti", "fizzle"],
    ["blandit", "shiznit", "gangsta", "etizzle", "yippiyo", "gdizzle", "nonummy", "boofron", "vivamus", "mammasa", "amizzle", "gravida", "viverra", "quizzle", "erizzle", "brizzle", "quisque", "enizzle", "feugiat", "lacinia", "elizzle", "commodo", "pretium", "posuere", "integer", "egestas", "tizzles", "crizzle", "shizzle"],
    ["eleifend", "donizzle", "praesent", "pharetra", "socizzle", "pulvinar", "sociosqu", "ipsizzle", "varizzle", "dolizzle", "lacizzle", "beyonces", "torquent", "bibendum", "lorizzle", "maecenas", "felizzle", "mammasay", "aenizzle", "gangster", "metizzle", "shizznit", "shizzlin", "faucibus", "dictumst", "vehicula", "velizzle", "molestie", "interdum", "facilisi", "accumsan"],
    ["sempizzle", "turpizzle", "auctizzle", "hendrerit", "consequat", "vulputate", "pretizzle", "phasellus", "tristique", "curabitur", "facilisis", "dictizzle", "elementum", "tellizzle", "tortizzle", "tempizzle", "nullizzle", "mollizzle", "maurizzle", "mattizzle", "malesuada", "fringilla", "feugizzle"],
    ["iaculizzle", "euismizzle", "parturient", "dapibizzle", "vestibulum", "rhoncizzle", "aliquizzle", "integizzle", "adipiscing", "shackalack"],
    ["pulvinizzle", "ultricizzle", "sagittizzle", "maecenizzle", "tellivizzle", "scelerisque", "suspendisse", "suscipizzle", "volutpizzle", "crocodizzle", "bibendizzle", "accumsizzle"],
    ["crackalackin", "penatibizzle", "curabitizzle", "pellentesque", "hendrerizzle", "facilisizzle", "convallizzle", "fermentizzle"]
  ];


  var myStory; // the parent Story of myText

  if (myText instanceof Story) {
    myStory = myText;
  } else if (myText instanceof InsertionPoint) {
    myText = myStory = myText.parentStory;
  } else if (myText.hasOwnProperty("parentStory")) { // myText instanceof Word, TextFrame, Character, TextColumn or Paragraph
    myStory = myText.parentStory;
  } else { // myText is not text, but some other object
    return;
  }
  myStory.label = "";
  if (myText instanceof Story || myText instanceof TextFrame) {
    for (var n = myStory.textFrames.length - 1; n >= 0; n--) {
      loremIpsumize(myStory.textFrames[n]); // clever recurson
    }
  }
  if (myText.hasOwnProperty("paragraphs") && myText.paragraphs.length > 1) { // The script returns better looking results when one Paragraph is processed at a time
    var myParagraphs = myText.paragraphs.everyItem().getElements();
    for (var m = myParagraphs.length - 1; m >= 0; m--) {
      loremIpsumize(myParagraphs[m]); // clever recurson
    }
  } else if (myText.contents !== "") {
    app.findGrepPreferences = NothingEnum.nothing;
    app.changeGrepPreferences = NothingEnum.nothing;
    app.findGrepPreferences.findWhat = "[\\u\\l'@\u00E6\u00C6]{1," + loremIpsumDictionary.length + "}"; // only looks for word-characters and leave punctuation, spaces as they are

    var storyLineNumber = myStory.lines.length; // remembers how many lines the story has, and tries to make the new text the same number of lines
    var myWordMatches = myText.findGrep(); // an array of Word references that fit the grep
    for (var i = myWordMatches.length - 1; i >= 0; i--) {
      myWordMatches[i].contents = loremipsumWord(myWordMatches[i].contents); // changes the word into a random latin-sounding one
    }
    fineTuneText(storyLineNumber);
  }

  function fineTuneText(targetNumberOfLines) { // tries to make the text the correct number of lines by adding or subtracting one letter at a time
    var myNumberOfCharacters;
    var newWord;
    var myWord;
    while (targetNumberOfLines !== myStory.lines.length) {
      myNumberOfCharacters = myText.characters.length;
      for (var changeWord = myWordMatches.length - 1; changeWord >= 0; changeWord--) {
        myWord = myWordMatches[changeWord];
        if (targetNumberOfLines > myStory.lines.length) {
          newWord = loremipsumWord(myWord.contents + "a"); // adds a letter 
        } else if (targetNumberOfLines < myStory.lines.length) {
          newWord = myWord.contents.length > 1 ? loremipsumWord(myWord.contents.slice(0, -1)) : myWord.contents; // removes a letter				
        } else {
          return true; // targetNumberOfLines === myStory.lines.length
        }
        myWord.contents = newWord;
      }
      if (myNumberOfCharacters === myText.characters.length) {
        return false; // Every word in the text has been reduced to a single character, and the text is still too long.... Give up.
      } else {
        myWordMatches = myText.findGrep(); // Need to do a new search, since the text has been changed
      }
    }
  }

  function loremipsumWord(myWord) { // takes a string and returns a random word with same number of letters, and the same capitalization
    var replacementWord = "";
    var correctCaseWord = "";
    var wordLength = myWord.length;
    if (wordLength >= loremIpsumDictionary.length) { // in case myWord is longer than the longest words in the dictionary 
      replacementWord = loremipsumWord(myWord.substr(0, loremIpsumDictionary.length - 1)) + loremipsumWord(myWord.substr(loremIpsumDictionary.length - 1)); // The word is longer than the longest words in the dictionary. So it's split in two.
    } else {
      replacementWord = loremIpsumDictionary[wordLength][Math.floor(Math.random() * loremIpsumDictionary[wordLength].length)]; // finds a random word of the same length
      if (myWord.toLowerCase() != myWord) { // the word contains uppercase characters
        correctCaseWord = "";
        for (var n = 0; n < wordLength; n++) { // loops through each character in the original word, checking if it's upper or lower case.
          correctCaseWord += myWord.charAt(n).toUpperCase() == myWord.charAt(n) ? replacementWord.charAt(n).toUpperCase() : replacementWord.charAt(n); // makes the character the correct case
        }
        replacementWord = correctCaseWord;
      }
    }
    return replacementWord;
  }
}

function lagNyAvisMal() {
  var avismal = [ // sider som skal være i MAL_AVIS.indt
    {
      master: "F-Front",
      tomside: false
    }, {
      master: "2-Side 2-3",
      tomside: false
    }, {
      master: "N-Nyhet Intro",
      tomside: false
    }, {
      master: "N-Nyhet",
      tomside: true
    }, {
      master: "N-Nyhet",
      tomside: true
    }, {
      master: "N-Nyhet",
      tomside: true
    }, {
      master: "D-Debatt Intro",
      tomside: false
    }, {
      master: "K-Kultur Intro",
      tomside: true
    }, {
      master: "K-Kultur",
      tomside: true
    }, {
      master: "K-Kultur",
      tomside: true
    }, {
      master: "K-Reportasje",
      tomside: true
    }, {
      master: "P-Plakat",
      tomside: false
    }, {
      master: "B-Baksida",
      tomside: false
    }
  ];

  var myDok = app.activeDocument;
  var beskjed = myDok.objectStyles.itemByName("beskjed");
  var lagreSom = File("/univ-desken/UTTEGNER/MALER_CS55/MAL_AVIS.indt");
  var backupMal = File("/univ-desken/UTTEGNER/MALER_CS55/BACKUP_AVISMAL/MAL_AVIS.indt");
  var myMasterPage;

  myDok.save(undefined, false, undefined, true);

  for (var i = myDok.textFrames.length - 1; i >= 0; i--) {
    if (myDok.textFrames[i].appliedObjectStyle === beskjed) {
      myDok.textFrames[i].remove();
    }
  }

  if (!myDok.name.match(/saksmaler/i)) {
    alert("feil fil", "Kan bare lage avismal fra saksmaler.indd");
  } else {
    for (var n = 0; n < avismal.length; n++) {
      myMasterPage = myDok.masterSpreads.itemByName(avismal[n].master);
      if (myMasterPage === null) {
        myMasterPage = myDok.masterSpreads[0];
        $.bp();
      }
      if (avismal[n].tomside === false) {
        try {
          while (myDok.spreads[n].appliedMaster !== myMasterPage && myDok.spreads[n] !== null) {
            myDok.spreads[n].remove();
          }
        } catch (e) {
          alert(e);
          myDok.spreads.add();
          myDok.spreads[-1].appliedMaster = myMasterPage;
        }
      } else {
        myDok.spreads.add(LocationOptions.BEFORE, myDok.spreads[n]);
        myDok.spreads[n].appliedMaster = myMasterPage;
      }
    }
  }
  lagreSom.copy(backupMal);
  myDok.save(lagreSom, true, undefined, true);
  app.activeDocument.close();
}

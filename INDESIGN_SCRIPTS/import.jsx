/* 
import.jsx
Dette skriptet er ryggraden i import fra prodsys til InDesign. 
Skrevet av Håken Lid 2011
*/

/* jshint ignore:start */
#targetengine "session";
#include "../INCLUDES/config.jsxinc"; // diverse konfigurasjonsverdier
#include "../INCLUDES/dokTools.jsxinc"; // diverse nyttige verktøyfunksjoner
#include "../INCLUDES/prodsys.jsxinc"; // kommunikasjon med prodsys
#include "../INCLUDES/artikkeltyper.jsxinc"; // tilpasset konfigurasjon for hver enkelt artikkeltype og bylineboks
#include "../INCLUDES/importpanel.jsxinc"; // brukergrensesnittet
/* jshint ignore:end */

var DEBUG = false; // hvis true flyttes ikke saker til neste nivå i prodsys. Debug kan også være et prodsak_id - i såfall brukes ikke dialogboksen
var BILDEDEBUG = false; // siden det tar så lang tid å finne bilder, kan det skrus av når man driver med bugtesting av skriptet
var mappaMi; // mappa for denne utgava av universitas;
var myDocument; // det aktive dokumentet;
var mySpread; // oppslaget i InDesign der saken skal importeres
var epostMatrix = dokTools.parseCSV(config.epostCSV); // tabell over navn og epostadresser
var feilmeldingsBoks = [5, 5, 40, 40]; // størrelsen på feilmeldingsboks når man ikke får limt inn bilder
var bildemax = [80, 80] ;// max størrelse på bilder som legges i pasteboard

  function importerSak(JSONsak, somArtikkelType, importerbilder) { // JSONsak er et objekt basert på prodsys-json. somArtikkelType er et artikkeltypeobjekt
    BILDEDEBUG = importerbilder; // Skal bilder importeres. Kan skrus av for å teste eller spare litt tid
    try { // sørger for at det finnes et åpent dokument og avslutter skriptet hvis ikke
      myDocument = app.activeDocument;
      mappaMi = myDocument.filePath.fullName + "/";
    } catch (myError) {
      alert("Kan ikke importere\ringen åpne dokumenter, eller aktivt dokument er ikke lagret\r\rfeilmelding: " + myError);
      exit();
    }
    utgavemappe = mappaMi.match(config.rotRegExp);
    if (utgavemappe) {
      mappaMi = utgavemappe[0]; // mappa for denne utgava av Universitas
    }
    var artikkelType = (somArtikkelType) ? somArtikkelType : artikkeltyper[-1]; // for testeformål kan importerSak kalles uten somArtikkelType - da blir artikkeltype automatisk den siste typen i lista ("annet")
    mySpread = app.activeWindow.activeSpread;
    var originalenheter = dokTools.changeUnits(myDocument, [MeasurementUnits.MILLIMETERS, MeasurementUnits.MILLIMETERS]); // sørger for at millimeter er standard enhet - hvis det er noe annet, lagres det i objektet originalenheter.
    if (DEBUG) { // brukes bare ved uttesting av skriptet, ikke i vanlig produksjon
      minArtikkel = new artikkel(prodsys.get(JSONsak.prodsak_id), artikkelType, mySpread, app.selection); // henter sak fra prodsys og oppretter artikkelobjekt
      prodsys.post(JSONsak.prodsak_id, '{"produsert":"3"}'); // flytter saken til "Til Desk" i prodsys;
    } else {
      try { // fanger opp eventuelle bugs
        minArtikkel = new artikkel(prodsys.get(JSONsak.prodsak_id), artikkelType, mySpread, app.selection); // henter sak fra prodsys og oppretter artikkelobjekt
        prodsys.post(JSONsak.prodsak_id, '{"produsert":"4"}'); // flytter saken videre i prodsys;
      } catch (myError) { // produserer feilmelding
        if (minArtikkel.progressBar) {
          minArtikkel.progressBar.close(); // fjerner framdriftsvindu
        }
        var myMessage = "file: " + myError.fileName + "\r" + myError.name + ": " + myError.description + " in line " + myError.line + "\r" + myError.line + " " + myError.source.split("\n")[myError.line - 1]; // feilmelding
        dokTools.errorAlert(myMessage, "Noe gikk galt i import"); // viser feilmelding i et vindu
      }
    }
  }

  function artikkel(JSONsak, somArtikkelType, mySpread, mySelection) { // det viktigste objektet i dette skriptet. Inneholder masse funksjoner og verdier - opprettes på grunnlag av en string fra prod.sys
    this.main = function() { // hovedfunksjon - kaller en drøss subrutiner i rekkefølge
      if (JSONsak === null) {
        exit();
      } // avslutter hele skriptet hvis den opprinnelige JSON-importen fra prodsys ikke resulterer i en gyldig string
      this.id = JSONsak.prodsak_id; // unik id-nummer for artikkelen i prodsys
      this.artikkeltype = somArtikkelType; // artikkeltypeobjekt fra artikkeltyper.jsxinc - inneholder info og metoder for tittelstil, bylineboks med mer.
      this.selection = mySelection; // Tekstrammer og bilderammer i InDesign der saken skal limes inn
      JSONsak = this.lagUndersak(JSONsak); // hvis saken inneholder undersak blir den skilt ut og importert for seg selv.
      this.skjema = lagSkjema(this, this.selection, app.activeWindow.activeSpread); // finner skjema for å koble saker.
      this.bylineboksInnhold = this.artikkeltype.bylineboks ? [this.artikkeltype.temaord] : null; //en array med tekster til bylineboksen, hvis det skal være en. Inneholder temaord og navn på en eller flere journalister og fotografer
      this.gb = []; // topp, venstre, bunn, høyre, spalteantall, spaltebredde, spaltemellomrom - dette er den geometriske plasseringen på siden der saken blir importert
      this.bilder = JSONsak.bilete || []; // Array av JSON-objekter for bildene. i et slikt format: {"prodbilde_id":"37547","bildefil":"29_fotobest_01_CL.jpg","bildetekst":"","kommentar":"","prioritet":"1","prodsak_id":"11124"},
      this.pageItems = {
        textFrames: [],
        rectangles: [],
        cells: []
      }; // en objekt som innehodler arrays av tekstrammer, bilderammer og tabellceller som saken blir limt inn i
      this.paragraphs = []; // array med avsnitts-objekter, som inneholder tekst, avsnittstil, og en peker til tekstramme eller celle som teksten skal limes inn i
      this.autolayout = (this.artikkeltype.autolayout === "TRUE"); // autolayout brukes hvis saken importeres uten at det er valgt en mal-gruppe i InDesign.

      if (!JSONsak.tekst.match(/@bl:/) && this.artikkeltype.byline) { // hvis journalisten har glemt byline
        JSONsak.tekst = JSONsak.tekst + "\r@bl:" + this.artikkeltype.byline.replace(/;/g, ","); // legger inn en generisk byline ("Navn Navnesen")
      }

      if (!JSONsak.tekst.match(/@temaord:/) && this.artikkeltype.temaord && !this.artikkeltype.bylineboks) { //hvis journalisten har glemt temaord
        JSONsak.tekst = JSONsak.tekst + "\r@temaord:" + this.artikkeltype.temaord; // legger inn generisk temaord
      }

      if (!JSONsak.tekst.match(/\w+@\w+\.\w+/) && this.artikkeltype.epostbyline) { // hvis journalisten har glemt epostadresse
        JSONsak.tekst = JSONsak.tekst + "\r@epost:" + this.artikkeltype.epostbyline; // legger inn generisk epostadresse
      }
      this.progressBar = dokTools.progressBar("Importerer " + JSONsak.arbeidstittel, "", this.bilder.length + 4, false); // viser en framdriftsrapport på skjermen for brukeren
      this.progressBar.update("Importerer tekst");
      this.pasteString = this.taGrep(JSONsak.tekst); // vasker teksten og gjør en rekke endringer. Retter bl.a opp vanlige feil som ekstra mellomrom eller feil hermetegn

      // TODO: gjør til subfunksjon
      this.bildetekster = this.pasteString.match(/@bt:([^\r]+)/g) || []; // finner alle bildetekstene som er skrevet rett inn i brødteksten i stedet for å være koblet til enkeltbilder i prodsys
      for (n = 0; n < this.bildetekster.length; n++) {
        var myRegExp = new RegExp(this.bildetekster[n] + "\\r?", "gi");
        this.pasteString = this.pasteString.replace(myRegExp, ""); // klipper ut bildetekst fra brødtekst
        this.bildetekster[n] = this.bildetekster[n].replace(/@bt:/, ""); // legger i en array
      }
      for (var n = 0; n < this.bilder.length; n++) { // går gjennom bildene som er kobla til saken
        if ("" === this.bilder[n].bildetekst) { // hvis bildet ikke har bildetekst
          this.bilder[n].bildetekst = this.bildetekster.pop() || ""; // legger til bildetekst 
        }
      }
      for (n = 0; n < this.bildetekster.length; n++) { // hvis det er flere bildetekster enn bilder
        this.bilder.push({
          "prodbilde_id": null,
          "bildefil": null,
          "bildetekst": this.bildetekster[n],
          "prioritet": "5",
          "prodsak_id": this.id
        }); // lager bilde som har tekst men ikke noen bildefil tilkobla
      }

      this.byline = this.finnByline(this.pasteString); // finner hvem som har skrevet saken
      this.epost = this.epost ? this.finnEpost(this.byline) || this.epost : null; // epostbyline for saken, hvis sakstypen skal ha epostbyline.
      this.pasteString = this.artikkeltype.taGrep(this.pasteString); // vask av tekst med regulære uttrykk som er tilpasset artikkeltypen?
      this.length = this.pasteString.length; // antall tegn i saken
      this.gb[4] = Math.ceil(this.length / config.tegnPerSpalte); // estimat av antall spalter saken trenger i tilfelle autolayout
      this.gb = this.plasser(this.gb[4]) || config.kriseGB; // finner ledig plass til artikkelen i tilfelle autolayout
      this.paragraphStyles = this.finnavsnittstiler(this.pasteString); // returnerer array over brukte avsnittstiler (string)
      this.characterStyles = this.finnbokstavstiler(this.pasteString); // returnerer array over brukte bokstavstiler (string)
      this.paragraphs = this.parseParagraphs(this.pasteString); // returnerer array av avsnitt-objekter
      this.artikkeltype.gjorKlar(this, mySpread); // denne metoden kan brukes hvis artikkeltypen trenger egen klargjøring av indesign-dokumentet før import. Ikke aktuellt i de fleste tilfeller

      if (this.skjema.stories.length > 0) { // hvis skjemaet inneholder stories
        this.kobleGeometri(this.skjema); // kobler InDesignmalen til diverse avsnitt som skal importeres
        this.bylineBoksStory = this.skjema.stories[this.skjema.stories.length - 1].story; // denne storyen skal ha bylineboks hvis noen.
      } else { // hvis det ikke er noen stories i artikkelmalen
        this.bylineBoksStory = this.lageGeometri();
      }

      this.progressBar.update("Plasserer tekst");
      this.liminn(); // importerer tekst til tekstrammer og tabellceller

      if (this.artikkeltype.bylineboks) { // skal denne artikkeltypen ha bylineboks?
        var trynebilde = this.artikkeltype.lagBylineboks(this.bylineBoksStory, this.bylineboksInnhold); // lager bylineboks og returnerer bilderammen der et eventuellt trynebilde skal være (brukes for kommentarer og lignende)
        if (trynebilde) {
          this.skjema.pictures.push({
            rectangle: trynebilde
          }); // legger trynebildet i bilde-skjemat
        }
      }

      if (this.artikkeltype.trynebilde === "TRUE") {
        this.trynebilde = this.finnTryne(new Folder(config.trynemappe), this.byline); // leter etter bildefil med filnavn som svarer til navnet i byline
      }
      this.plasserbilder(this.skjema.pictures); // plasserer bilder i bilderammer
      this.progressBar.update("Rydder opp");
      bokstavstiler(this.characterStyles); // sørger for å legge på kursiv og uthevet tekst
      this.opprydding(); // fikser diverse avsluttende detaljer
      this.progressBar.close(); // fjerner framdriftsmeldinga - IMPORT FERDIG!
    };

    // CAVEAT EMPTOR! følgende metode ble kodet under juleøltesten 2011
    this.lagUndersak = function(JSONsak) { // Sjekker om det skal være undersak og oppretter en om nødvendig
      if (this.selection.length === 1 && mySelection[0] instanceof Group) { // hvis det er valgt en saksmal i InDesign
        var myGroup = this.selection[0];
        var myGroupItems = myGroup.pageItems.everyItem().getElements();
        var myGroupParent = myGroup.parent;
        var myGroupLabel = myGroup.label;
        var undersakgruppe = []; // undersak
        var myItem;
        myGroup.ungroup();

        for (var i = myGroupItems.length - 1; i >= 0; i--) {
          myItem = myGroupItems[i];
          if (myItem.appliedObjectStyle.name.match(/undersak/i)) { // pageItems som inneholder objekter med stilen "undersak"
            undersakgruppe.push(myItem); // legges i egen gruppe
            myGroupItems.splice(i, 1); // fjernes fra hovedgruppa
          }
        }
        if (undersakgruppe.length > 1) {
          undersakgruppe = myGroupParent.groups.add(undersakgruppe); // lager en ny gruppe av undersaken
        } else if (undersakgruppe.length === 0) {
          undersakgruppe = undefined;
        }
        if (myGroupItems.length > 0) {
          myGroup = myGroupParent.groups.add(myGroupItems); // gjenoppretter original gruppe
          myGroup.label = myGroupLabel;
          this.selection = [myGroup];
        } else { // da må jo dette være undersaken!
          this.selection = [undersakgruppe];
          undersakgruppe = undefined;
        }
      }
      // END CAVEAT

      if (JSONsak.tekst.match(/@tit:/) && JSONsak.tekst.match(/@tit:/g).length > 1) { // er det mer enn én @tit - tag ?
        //mekk undersak
        var undersakstags = ["tit|ing|txt|mt|spm"]; // disse tagsene tilhører undersaken, alle andre tags tilhører hovedsaken
        var undersaker = JSONsak.tekst.split("@tit:");
        var sakstype = artikkeltyper[this.artikkeltype.undersak]; // undersaken har egen sakstype
        var underJSON = { // undersaken får egen JSON
          bilete: [],
          prodsak_id: JSONsak.prodsak_id,
          tekst: "",
        };
        underJSON.bilete = [];
        if (sakstype && undersaker.length > 1) {
          for (var n = 2; n < undersaker.length; n++) {
            underJSON.tekst = "\n@tit:" + undersaker[n];
            var myTags = underJSON.tekst.split("\n@");
            var myTag;
            myTagloop: // sjekker hver enkelt avsnitt om det tilhører hovedsak eller undersak
            for (t = 1; t < myTags.length; t++) {
              myTag = myTags[t].match(/[^:]+/);
              if (myTag) {
                if (null === myTag[0].match(undersakstags)) { // avsnittet skal ikke være t undersaken, selv om det kommer etter undersakstittelen t råteksten (gjelder for eksempel uthevet sitat, faktaramme eller byline)
                  underJSON.tekst = underJSON.tekst.replace("@" + myTags[t], "");
                } else {
                  JSONsak.tekst = JSONsak.tekst.replace("@" + myTags[t], "");
                }
              }
            }
            new artikkel(underJSON, sakstype, mySpread, [undersakgruppe]); // REKURSIV MORRO. Oppretter nytt arkkelobjekt.
            undersakgruppe = undefined; // om det er flere undersaker er det bare den første som får mal-layout. De andre må få autolayout.
          }
        }
      } else if (undersakgruppe) { // det er ingen undersak, men det finnes undersaksmal
        undersakgruppe.remove(); // fjerner overflødig mal
      }
      return JSONsak; // saken med eventuell undersaktekst klippet ut
    };

    this.finnTryne = function(mappe, navn) { // funksjon som leter etter en trynebildefil basert på navnet på personen. Returnerer File eller null
      if (!navn) {
        return null;
      }
      var fil;
      navn = navn.replace(/(.*) ([^ ]+?$)/, "$2_$1").replace(/ /g, "_").toUpperCase() + ".jpg"; // lager filnavn i formatet ETTERNAVN_FORNAVN.jpg
      fil = mappe.getFiles(navn);
      fil = (fil.length > 0) ? new File(fil[0]) : null; // finner fila hvis den eksisterer
      return fil;
    };

    this.finnByline = function(pasteString) { // finner navn på person som har skrevet saken - returnerer første navn i byline eller null
      var myByline = pasteString.match(/@bl:(tekst: ?)?([^\r\n]+)/);
      if (myByline) {
        myByline = myByline[2].replace(/ og .*/, "").replace(/,.*/, "");
      }
      return myByline;
    };

    this.taGrep = function(rotestring) { // gjør diverse reglar expression-søk for å renske opp i artikkelen
      rotestring = rotestring.replace(/\\+(['"])/g, "$1"); // lureri med magic quotes. vekk med seg.
      rotestring = rotestring.replace(/^\s+/, ""); // fjerner whitespace i starten
      rotestring = rotestring.replace(/\s+$/, ""); // fjerner whitespace til slutt
      rotestring = rotestring.replace(/\s*[\r\n]+\s*/g, "\r"); // fjerner tomme avsnitt og unødvendig luft på slutten og starten av avsnitt
      rotestring = rotestring.replace(/<\/?b>/gi, ""); //fjerner BOLD tag :)
      rotestring = rotestring.replace(/ ?<rt> ?/gi, "<RIGHTTAB>"); // fikser <rt>-tags
      rotestring = rotestring.replace(/\s*<\/?br\/? *>/gi, "\n"); // bytter ut <br> med linjeskift
      rotestring = rotestring.replace(/@bl: ?(tekst:)? ?(.+)\u2022(.+)\( ?foto ?\)/gi, "@bl:tekst: $2\rfoto:$3"); // tekst: og foto:
      rotestring = rotestring.replace(/\u2022/gi, " og "); // legger inn og i stedet for bullet
      rotestring = rotestring.replace(/([:!;?])\b/g, "$1 "); // putter mellomrom etter kolon, utropstegn, spørsmålstegn osv.
      rotestring = rotestring.replace(/\b,([a-å])/gi, ", $1"); // Legger til mellomrom etter komma før bokstav
      rotestring = rotestring.replace(/ {2,}/g, " "); // fjerner overflødige mellomrom
      rotestring = rotestring.replace(/\t{2,}/g, "\t"); // fjerner overflødige tabulatortegn
      rotestring = rotestring.replace(/\s+([?|,|.|:|!])/g, "$1"); // fjerner mellomrom foran skilletegn
      rotestring = rotestring.replace(/(@[^:]+:)\s+/g, "$1"); // fjerner whitespace mellom @stil: og tekst
      rotestring = rotestring.replace(/(@[^:]+:)(@[^:]+:)/g, "$2"); // tomme avsnitt blir fjerna.
      rotestring = rotestring.replace(/--/g, "–"); //gjør om to bindestreker til tankestrek
      rotestring = rotestring.replace(/^- ?/gm, "–"); //gjør om bindestrek på starten av avsnitt til tankestrek
      rotestring = rotestring.replace(/\B-\B/g, "–"); //gjør om bindestrek med luft på begge sider til tankestrek
      rotestring = rotestring.replace(/[”“"]\b/g, "«").replace(/\b[”“"]/g, "»"); // sørger for riktige hermetegn
      rotestring = rotestring.replace(/@fakta:([^\r]+)\r([^@])/gi, "@fakta:$1\r@fak1:$2"); //sørger for riktig stiler i faktarammer
      rotestring = rotestring.replace(/^\s*(kilder?):/gmi, "@fak2:kilde:"); // sørger for riktig stil i kildehenvisning i faktaramme
      rotestring = rotestring.replace(/<\/?(.)>/g, "<@$1>"); // gjør om <I> og </I> til <@I> osv.
      rotestring = rotestring.replace(/ÆTT/g, "@"); // gjør om ÆTT til krøllalfa
      rotestring = rotestring.replace(/@sitat:[«– ]*([^»\r]*)»?/g, "@sitat:«$1»"); // legger til hermetegn på sitat hvis det trengs;
      rotestring = rotestring.replace(/^(@\w+:)?(<\S+>)?([\w.]+@[\w.]+)(<\S+>)?$/m, "@epost:$3"); // gjør epostadresse om til epostbyline, fjerner eventuell kursiv
      return rotestring;
    };

    this.finnEpost = function(myByline) { // finner riktig epostadresse ved å slå opp byline i en tabell over navn og epostadresser
      if (myByline) {
        myByline = myByline.replace(/^([a-åæÆ]+).*?([a-åæÆ]+)$/i, "$1.*$2");
        myRegExp = new RegExp(myByline);
        for (n = 0; n < epostMatrix.length; n++) {
          if (myRegExp.test(epostMatrix[n][0])) {
            return epostMatrix[n][1];
          }
        }
      }
      return null;
    };

    this.finnavsnittstiler = function(pasteString) { // lager en liste over avsnittstiler i bruk i artikkelen
      var myParagraphStyles = pasteString.match(/^@[^>:]+:/gm); //En array aver tags
      myParagraphStyles = dokTools.removeDuplicates(myParagraphStyles);
      for (var n = 0; n < myParagraphStyles.length; n += 1) {
        myParagraphStyles[n] = myParagraphStyles[n].slice(1, -1).toLowerCase(); //  fjerner "@" og ":"
      }
      return myParagraphStyles;
    };

    this.finnbokstavstiler = function(pasteString) { // lager en liste over bokstavstiler i bruk i artikklen
      var myCharacterStyles = pasteString.match(/<@\w+>/g) || [];
      myCharacterStyles = dokTools.removeDuplicates(myCharacterStyles);
      for (var n = 0; n < myCharacterStyles.length; n++) {
        myCharacterStyles[n] = myCharacterStyles[n].slice(2, -1).toUpperCase(); //  fjerner "<@" og ">"
      }
      return myCharacterStyles;
    };

    this.parseParagraphs = function(pasteString) { // deler artikkelen opp i en array med objekter som inneholder tekststring og paragraphstyle
      var paragraphs = [];
      var stil = this.paragraphStyles[0];
      var avsnittsamling = pasteString.split("\r"); // lager en array av strings
      for (i = 0; i < avsnittsamling.length; i++) {
        mittAvsnitt = avsnittsamling[i];
        var nystil = mittAvsnitt.match(/^@[^>:]+:/i); // hvis avsnittet har en xtag
        if (nystil) {
          nystil = nystil[0].slice(1, -1).toLowerCase(); // fjerner "@" og ":"
        }
        if (nystil) {
          stil = this.skjema.styles[nystil] || this.artikkeltype["@" + nystil] || artikkeltyper["annet"]["@" + nystil] || "@" + nystil;
          mittAvsnitt = mittAvsnitt.replace(/@[^:]+:/, "");
        }
        if (stil.match(/bl/) && this.bylineboksInnhold) { // byline
          this.bylineboksInnhold.push(mittAvsnitt);
        } else if (stil.match(/temaord/) && this.bylineboksInnhold) { // temaord
          this.bylineboksInnhold[0] = mittAvsnitt;
        } else if (stil !== "SLETT") { // alle andre avsnitt bortsett fra "SLETT"
          paragraphs.push({
            contents: mittAvsnitt,
            style: stil
          });
        }
      }
      return paragraphs;
    };

    this.kobleGeometri = function(koblingsskjema) { //finner tekstrammer, tabeller og bilderammer i malen som saken skal importes til
      dokTools.clearSearch();
      app.findGrepPreferences.findWhat = "[^~a]+|~-"; //TODO Forklare InDesigns spesielle grep-tegn for anchored objects og sånn.
      app.changeGrepPreferences.changeTo = " ";
      var minStory;
      var minTextframe;
      var minAvsnittstil;
      var mittAvsnitt;
      var targetStory;
      for (n = 0; n < this.paragraphs.length; n++) { // blar gjennom alle avsnittene i artikkelen
        mittAvsnitt = this.paragraphs[n];
        mittAvsnitt.targetStory = koblingsskjema.stories[koblingsskjema.stories.length - 1].story; // default er den bakerste storyen i arrayen.
        for (var p = 0; p < koblingsskjema.stories.length; p++) { // blar gjennom alle stories i koblingsskjemaet
          targetStory = koblingsskjema.stories[p];
          for (q = 0; q < targetStory.styles.length; q++) { // blar gjennom alle avsnittmalene som skal kobles til tekstrammen i følge koblingsskjemaet
            minAvsnittstil = targetStory.styles[q];
            if (minAvsnittstil === mittAvsnitt.style) { //hvis stilen stemmer
              mittAvsnitt.targetStory = targetStory.story;
            }
          }
        }
        minStory = mittAvsnitt.targetStory;
        if (minStory instanceof Cell) {
          if (minStory.label === "") {
            minStory.label = "importert";
            if (minStory.contents !== "") {
              minStory.changeGrep();
            }
          }
          minTextframe = minStory;
          this.pageItems.cells.push(minStory);
          while (!(minTextframe instanceof TextFrame)) {
            minTextframe = minTextframe.parent;
            if (minTextframe instanceof Application) {
              break;
            }
          }
          this.pageItems.textFrames.push(minTextframe);
        } else if (minStory instanceof Story && minStory.label === "") {
          if (minStory.contents !== "") {
            minStory.changeGrep();
          }
          minStory.label = "importert";
          this.pageItems.textFrames = this.pageItems.textFrames.concat(minStory.textContainers);
        }
      }
      dokTools.clearSearch();
    };

    this.lageGeometri = function() { // lager tekstrammer hvis det mangler (Autolayout)
      var tit_ramme;
      var ing_ramme;
      var txt_ramme;
      var byline_ramme;
      var sitat_ramme;
      var fakta_ramme;
      var mittAvsnitt;
      var shortstyle;
      var myObjectStyle;
      for (var n = 0; n < this.paragraphs.length; n++) {
        mittAvsnitt = this.paragraphs[n];
        if (mittAvsnitt.targetStory === undefined) {
          shortstyle = mittAvsnitt.style.slice(2).replace(/ .*/, ""); //gjør navn som "A txt 0:" om til "txt"
          switch (shortstyle) {

            case "tit":
            case "stikktit":
              if (tit_ramme) { // hvis det allerede finnes en tit_ramme er det en ekstra tittel eller stikktittel
                this.gb[0] = this.gb[0] + 10;
                if (txt_ramme) { // det finnes allerede brødtekst - altså er øvrig tekst en undersak
                  txt_ramme = undefined; // glemmer forrige txt_ramme
                  ing_ramme = undefined; // glemmer forrige ing_ramme
                  this.gb[4] = 2;
                  this.gb = dokTools.finnLedigPlass(mySpread, this.gb[4]);
                }
              }

              tit_ramme = mySpread.textFrames.add();
              tit_ramme.geometricBounds = [this.gb[0], this.gb[1], this.gb[0] + 20, this.gb[3]];
              myObjectstyle = dokTools.velgStil(myDocument, "object", config.objektstiler.tittel);
              tit_ramme.applyObjectStyle(myObjectstyle);
              this.pageItems.textFrames.push(tit_ramme);
              mittAvsnitt.targetStory = tit_ramme.parentStory;
              break;

            case "ingress":
              if (ing_ramme === undefined) {
                ing_ramme = mySpread.textFrames.add();
                ing_ramme.geometricBounds = [this.gb[0] + 20, this.gb[1], this.gb[2], this.gb[1] + this.gb[5]];
                myObjectstyle = dokTools.velgStil(myDocument, "object", config.objektstiler.ingress);
                ing_ramme.applyObjectStyle(myObjectstyle);
                this.pageItems.textFrames.push(ing_ramme);
              }
              mittAvsnitt.targetStory = ing_ramme.parentStory;
              break;

            case "sitat":
              sitat_ramme = mySpread.textFrames.add(); // ny for hvert sitat
              sitat_ramme.geometricBounds = [this.gb[0] + 20, this.gb[3] - this.gb[5], this.gb[2], this.gb[3]];
              myObjectstyle = dokTools.velgStil(myDocument, "object", config.objektstiler.sitat);
              sitat_ramme.applyObjectStyle(myObjectstyle);
              this.pageItems.textFrames.push(sitat_ramme);
              mittAvsnitt.targetStory = sitat_ramme.parentStory;
              break;

            case "sitatbyline":
              if (!sitat_ramme) {
                sitat_ramme = mySpread.textFrames.add();
                sitat_ramme.geometricBounds = [this.gb[0] + 20, this.gb[3] - this.gb[5], this.gb[2], this.gb[3]];
                myObjectstyle = dokTools.velgStil(myDocument, "object", config.objektstiler.sitat);
                sitat_ramme.applyObjectStyle(myObjectstyle);
                this.pageItems.textFrames.push(sitat_ramme);
              }
              mittAvsnitt.targetStory = sitat_ramme.parentStory;
              break;

            case "faktatit":
              fakta_ramme = mySpread.textFrames.add(); // ny for hvert faktatit
              fakta_ramme.geometricBounds = [this.gb[2] - 60, this.gb[3] - this.gb[5], this.gb[2], this.gb[3]];
              myObjectstyle = dokTools.velgStil(myDocument, "object", config.objektstiler.fakta);
              fakta_ramme.applyObjectStyle(myObjectstyle);
              this.pageItems.textFrames.push(fakta_ramme);
              mittAvsnitt.targetStory = fakta_ramme.parentStory;
              break;

            case "faktatxt":
            case "faktaliste":
              mittAvsnitt.targetStory = fakta_ramme.parentStory;
              break;

            default: // alle andre stiler
              if (txt_ramme === undefined) {
                txt_ramme = mySpread.textFrames.add();
                txt_ramme.geometricBounds = [this.gb[0] + 20, this.gb[1], this.gb[2], this.gb[3]];
                txt_ramme.textFramePreferences.textColumnCount = this.gb[4];
                txt_ramme.sendToBack();
                this.pageItems.textFrames.push(txt_ramme);
                if (byline_ramme === undefined) {
                  byline_ramme = txt_ramme;
                }
              }
              mittAvsnitt.targetStory = txt_ramme.parentStory;
          }
        }
      }
      dokTools.removeWhiteSpace(txt_ramme.parentStory);
      return byline_ramme.parentStory;
    };


    this.liminn = function() { // limer inn hvert avsnitt i sin tekstramme
      for (var j = 0; j < this.paragraphs.length; j++) {
        var avsnitt = this.paragraphs[j];
        var targetStory = avsnitt.targetStory;
        var avsnittstil = dokTools.velgStil(myDocument, "paragraph", avsnitt.style);
        targetStory.insertionPoints[-1].appliedCharacterStyle = myDocument.characterStyles[0];
        if (j > 0) {
          targetStory.insertionPoints[-1].contents = "\r";
        }
        targetStory.insertionPoints[-1].contents = avsnitt.contents;
        targetStory.paragraphs[-1].appliedParagraphStyle = avsnittstil;
        dokTools.removeWhiteSpace(targetStory);
      }
    };

    this.plasser = function(spalter) { // finn ut hvor saken skal plasseres i tilfelle autolayout
      return dokTools.finnLedigPlass(mySpread, spalter);
    };

    this.plasserbilder = function(mineBilder) { // limer bilder inn i rectangles
      var feilmelding = "";
      var BTheight = 6; //  høyden på bt-bokser
      var mittBilde;
      var minBildeFrame;
      var minBildetekst;
      var bildeRamme;
      var btRamme;
      var spalter = Math.floor(this.bilder.length / 3) + 1;

      for (var n = this.bilder.length - 1; n >= 0; n--) {
        if (this.bilder[n].prioritet === "0") {
          this.bilder.splice(n, 1);
        }
      }

      this.bilder.sort(function(a, b) {
        return a.prioritet - b.prioritet || a.bildefil > b.bildefil;
      });

      this.gb = dokTools.finnLedigPlass(mySpread, spalter) || config.kriseGB;
      var myGB = [this.gb[0], this.gb[1], this.gb[0] + this.gb[5], this.gb[1] + this.gb[5]];
      this.progressBar.update("Gjør klar " + this.bilder.length + " bilder");
      if (this.trynebilde && mineBilder.length > 0) {
        minBildeFrame = mineBilder.pop().rectangle;
        minBildeFrame.contentType = ContentType.graphicType;
        try {
          minBildeFrame.place(this.trynebilde);
          minBildeFrame.fit(FitOptions.FILL_PROPORTIONALLY);
          minBildeFrame.fit(FitOptions.CENTER_CONTENT);
          minBildeFrame.label = "ignore";
          //minBildeFrame.label='prodsak_id:'+this.id;
        } catch (e) {
          $.bp();
          $.writeln(e);
        }
      }

      while (this.bilder.length > mineBilder.length) {
        bildeRamme = mySpread.rectangles.add();
        bildeRamme.applyObjectStyle(dokTools.velgStil(myDocument, "object", config.objektstiler.bilde));
        bildeRamme.geometricBounds = myGB;
        btRamme = mySpread.textFrames.add();
        btRamme.geometricBounds = [myGB[2], myGB[1], myGB[2] + BTheight, myGB[3]];
        myGB = [myGB[0], myGB[1] + this.gb[5] + this.gb[6], myGB[2], myGB[3] + this.gb[5] + this.gb[6]];
        mineBilder.push({
          "rectangle": bildeRamme,
          "bt": btRamme
        });

        if (myGB[3] > this.gb[3]) {
          myGB = [myGB[2] + 15, this.gb[1], myGB[2] + 20 + this.gb[5], this.gb[1] + this.gb[5]];
        }

        if (myGB[2] > this.gb[2]) {
          this.gb = dokTools.finnLedigPlass(mySpread, spalter);
          myGB = [this.gb[0], this.gb[1], this.gb[0] + this.gb[5], this.gb[1] + this.gb[5]];
        }
      }

      for (var q = 0; q < this.bilder.length; q += 1) {
        this.progressBar.update("bilde " + (q + 1) + " av " + this.bilder.length + "  :  " + this.bilder[q].bildefil);
        minBildeFrame = mineBilder[q].rectangle;
        minFolder = Folder(mappaMi + this.artikkeltype.seksjon);
        if (BILDEDEBUG && this.bilder[q].bildefil) { // BILDEDEBUG kan skrus av for DEBUG
          mittBilde = dokTools.finnFil(minFolder, this.bilder[q].bildefil);
          if (!mittBilde) {
            minFolder = Folder(config.rotMappe);
            var pattern = this.bilder[q].bildefil.match(/^(\d{2})_([A-Z]{3})/);
            if (pattern) {
              minFolder = Folder(minFolder.fullName + "/" + pattern[1]);
              minRegExp = new RegExp(pattern[2], "i");
              if (minFolder.exists) {
                minFolder = minFolder.getFiles(function(myFile) {
                  return myFile.constructor.name === "Folder" && myFile.name.match(new RegExp(pattern[2], "i"));
                });
                if (minFolder) {
                  minFolder = minFolder[0];
                  mittBilde = dokTools.finnFil(minFolder, this.bilder[q].bildefil);
                }
              }
            }
          }
        }
        minBildetekst = this.bilder[q].bildetekst || this.bildetekster.pop() || "";
        if (minBildetekst !== "" && mineBilder[q].bt === null) {
          myGB = mineBilder[q].rectangle.geometricBounds;
          btRamme = mySpread.textFrames.add();
          btRamme.geometricBounds = [myGB[2] - BTheight, myGB[1], myGB[2], myGB[3]];
          mineBilder[q].rectangle.geometricBounds = [myGB[0], myGB[1], myGB[2] - BTheight, myGB[3]];
          mineBilder[q].rectangle.bringToFront();
          mineBilder[q].bt = btRamme;
        }
        minBildetekst = (minBildetekst === "") ? "BT: bildetekst" : this.taGrep(minBildetekst);
        if (mittBilde) {
          minBildeFrame.contentType = ContentType.graphicType;
          try {
            minBildeFrame.place(mittBilde);
            if (minBildeFrame.appliedObjectStyle.name === config.objektstiler.faksimile) { // faksimiler som anmeldelsesbildet står litt på skrå og skal ha et fast flateareal 
              var myRotation = minBildeFrame.rotationAngle; // vinkelen som faksimilen står på skrå
              minBildeFrame.rotationAngle = 0;
              var myBounds = [minBildeFrame.geometricBounds[0], minBildeFrame.geometricBounds[1], minBildeFrame.geometricBounds[2], minBildeFrame.geometricBounds[3]];
              var mySize = (myBounds[2] - myBounds[0]) * (myBounds[3] - myBounds[1]); // arealet til faksmilien. Dette skal være fast og må tilpasses høyde/bredde-forholdet.
              var width, height;
              var ratio;
              if (minBildeFrame.graphics.length === 1) {
                ratio = (minBildeFrame.graphics[0].geometricBounds[2] - minBildeFrame.graphics[0].geometricBounds[0]) / (minBildeFrame.graphics[0].geometricBounds[3] - minBildeFrame.graphics[0].geometricBounds[1]);
                width = Math.sqrt(mySize / ratio);
                height = width * ratio;
                myBounds[2] = myBounds[0] + height;
                myBounds[3] = myBounds[1] + width;
                minBildeFrame.geometricBounds = myBounds;
                minBildeFrame.fit(FitOptions.FILL_PROPORTIONALLY);
              }
              minBildeFrame.rotationAngle = myRotation;
            } else { // bilder som ikke skal inn i faksimile-stilen.
              minBildeFrame.fit(FitOptions.FILL_PROPORTIONALLY);
              minBildeFrame.fit(FitOptions.CENTER_CONTENT);
            }
            minBildeFrame.label = 'prodsak_id:' + this.bilder[q].prodsak_id + ', prodbilde_id:' + this.bilder[q].prodbilde_id;
          } catch (e) {}
          this.pageItems.rectangles.push(minBildeFrame);

        } else if (this.bilder[q].bildefil) {
          var feilmelding = "finner ikke bildefila:\r" + this.bilder[q].bildefil + "\rBildet ligger trolig i feil mappe, eller er sletta";
          var feilMeldingFrame = mySpread.textFrames.add();
          feilMeldingFrame.geometricBounds = [minBildeFrame.geometricBounds[0] + feilmeldingsBoks[0], minBildeFrame.geometricBounds[1] + feilmeldingsBoks[1], minBildeFrame.geometricBounds[0] + feilmeldingsBoks[2], minBildeFrame.geometricBounds[1] + feilmeldingsBoks[3]];
          feilMeldingFrame.appliedObjectStyle = dokTools.velgStil(myDocument, "object", config.objektstiler.beskjed);
          feilMeldingFrame.textFramePreferences.textColumnCount = 1;
          feilMeldingFrame.parentStory.contents = feilmelding;
        }
        if (mineBilder[q].bt) {
          mineBilder[q].bt.applyObjectStyle(dokTools.velgStil(myDocument, "object", config.objektstiler.bt));
          mineBilder[q].bt.parentStory.insertionPoints[0].applyParagraphStyle(dokTools.velgStil(myDocument, "paragraph", this.artikkeltype["@bt"] || artikkeltyper["annet"]["@bt"]));
          mineBilder[q].bt.parentStory.insertionPoints[0].contents = minBildetekst;
          mineBilder[q].bt.label = 'prodsak_id:' + this.bilder[q].prodsak_id + ', prodbilde_id:' + this.bilder[q].prodbilde_id;
          this.pageItems.textFrames.push(mineBilder[q].bt);
        }
      }
    };
    this.opprydding = function() {
      var ryddOppTekst = function(myText, minEpost) {
        app.findGrepPreferences.findWhat = "<RIGHTTAB>"; // høyrejustert tabulator
        app.changeGrepPreferences.changeTo = "~y";
        myText.changeGrep();
        app.findGrepPreferences.findWhat = "epost@epost.no";
        app.changeGrepPreferences.changeTo = minEpost || "";
        myText.changeGrep();
        app.findGrepPreferences.findWhat = "(\\d) (\\d)";
        app.changeGrepPreferences.changeTo = "$1 ~s$2";
        myText.changeGrep();
        app.findGrepPreferences.findWhat = "(\\d) (kr|m|km|s)\\>";
        myText.changeGrep();
        app.findGrepPreferences.findWhat = "~s+";
        app.changeGrepPreferences.changeTo = "~s";
        myText.changeGrep();
        app.findGrepPreferences.findWhat = "(\\d) ?- ?(\\d)";
        app.changeGrepPreferences.changeTo = "$1~=$2";
        myText.changeGrep();
        app.findGrepPreferences.findWhat = "^[~=-]\\s?\\<";
        app.changeGrepPreferences.changeTo = "~=~s";
        myText.changeGrep();
        app.findGrepPreferences.findWhat = '\\>"';
        app.changeGrepPreferences.changeTo = '»';
        myText.changeGrep();
        app.findGrepPreferences.findWhat = '"\\<';
        app.changeGrepPreferences.changeTo = '«';
        myText.changeGrep();

        // finn kulelister og endre dem til riktig paragraph style
        app.findGrepPreferences.findWhat = "^[#\\*]\\s?"; // hash eller asterix og space
        app.changeGrepPreferences.changeTo = "";
        app.findGrepPreferences.appliedParagraphStyle = dokTools.velgStil(myDocument, "paragraph", "A faktatxt");
        app.changeGrepPreferences.appliedParagraphStyle = dokTools.velgStil(myDocument, "paragraph", "A faktaliste");
        myText.changeGrep();
        app.changeGrepPreferences = NothingEnum.nothing;
        app.findGrepPreferences.appliedParagraphStyle = NothingEnum.nothing;
        app.changeGrepPreferences.bulletsAndNumberingListType = 1280598644; // kuleliste
        myText.changeGrep();
        app.changeGrepPreferences = NothingEnum.nothing;
        app.changeGrepPreferences.changeTo = "";
        myText.changeGrep(); // for å fjerne driten
        dokTools.clearSearch();
      };
      var mittBilde, minStory, minTextframe, minCelle;

      app.select(null); // tømmer selection	
      dokTools.clearSearch();

      for (var n = 0; n < this.pageItems.textFrames.length; n++) {
        minTextframe = this.pageItems.textFrames[n];
        minStory = minTextframe.parentStory;
        ryddOppTekst(minStory, this.epost);
        minStory.label = "";
        if (minStory.tables.length > 0) {
          minStory.tables.everyItem().cells.everyItem().label = "";
        }
        minTextframe.label = 'prodsak_id: ' + this.id; // Setter prodsak_id på alle objekter i saken
        if (this.artikkeltype.opprydding(minTextframe)) { // type.opprydding kan fjerne tomme tekstrammer
          dokTools.avsnittSkift(minStory);
          applyItalic(minStory);
        }
        if (minTextframe.parent instanceof Page || minTextframe.parent instanceof Spread) {
          app.select(minTextframe, SelectionOptions.ADD_TO);
        }
      }

      for (var p = 0; p < this.pageItems.cells.length; p++) {
        minCelle = this.pageItems.cells[p];
        minStory = minCelle.texts[0];
        ryddOppTekst(minStory, this.epost);
      }

      // Fikse tekstinngangsord
      app.changeGrepPreferences.appliedParagraphStyle = dokTools.velgStil(myDocument, "paragraph", this.artikkeltype["@tingo"]);
      app.findGrepPreferences.findWhat = "(?i)^tingo:?\\s*(.)";
      app.changeGrepPreferences.changeTo = "TINGO $1";
      app.changeGrep();
      app.findGrepPreferences.appliedParagraphStyle = app.changeGrepPreferences.appliedParagraphStyle;
      app.findGrepPreferences.findWhat = "^TINGO ";
      app.changeGrepPreferences = NothingEnum.nothing;
      app.changeGrep();
      app.findGrepPreferences.findWhat = "~=\\b";
      app.changeGrepPreferences.changeTo = "~=~s";
      app.changeGrep();
      dokTools.clearSearch();

      for (var q = 0; q < this.pageItems.rectangles.length; q++) {
        mittBilde = this.pageItems.rectangles[q];
        if (mittBilde.parent instanceof Page || mittBilde.parent instanceof Spread) {
          app.select(mittBilde, SelectionOptions.ADD_TO);
        }
      }

    };
    this.main(); // kjører main - en funksjon som kaller andre funksjoner i objektet
  }

  function bokstavstiler(myCharacterStyles) { // bruker inDesigns GREP for å gi tekstbolker riktig bokstavstil i følge xtags
    if (myCharacterStyles !== null) {
      dokTools.clearSearch();
      for (n = 0; n < myCharacterStyles.length; n++) {
        var stil = myCharacterStyles[n];
        app.findGrepPreferences.findWhat = "(?i)(?s)<@" + stil + ">(.+?)<@" + stil + ">";
        app.changeGrepPreferences.changeTo = "$1";
        app.changeGrepPreferences.appliedCharacterStyle = dokTools.velgStil(myDocument, "character", stil);
        app.changeGrep();
        dokTools.clearSearch();
      }
    }
  }

  function applyItalic(myStory) { // applies Italics may take a story, else does it for the entire document (slower);
    var mySelection = app.selection;
    var myDocument = app.activeDocument;
    var myRanges; 
    if (myStory) {
      myRanges = myStory.textStyleRanges.everyItem().getElements();
    } else {
      myRanges = myDocument.stories.everyItem().textStyleRanges.everyItem().getElements(); // gets every textStyleRange in the document;
    }
    var italicStyle = myDocument.characterStyles.itemByName(config.italicStyle); // this character styles has no attributes;
    if (italicStyle === null) {
      return;
    }
    var myRange;
    var myFont;
    var newStyle;
    var newStyleName;
    var n;
    for (n = 0; n < myRanges.length; n++) {
      myRange = myRanges[n];
      if (myRange.appliedCharacterStyle === italicStyle) {
        app.select(myRange);
        app.menuActions.itemByID(119611).invoke(); // apply italics - same as [cmd]+[shift]+[i]
        myFont = myRange.appliedFont;
        newStyleName = "I " + myFont.fontStyleName;
        newStyle = myDocument.characterStyles.itemByName(newStyleName); // if the style is created;
        if (newStyle === null) {
          newStyle = myDocument.characterStyles.add({
            name: newStyleName,
            fontStyle: myFont.fontStyleName
          }); // if the style does not exist yet;
        }
        myRange.appliedCharacterStyle = newStyle;
      }
    }
    app.select(mySelection); // restores the original selection
  }


  function getScriptFolder() { // finner folderen som skriptet ligger i både når det kjøres fra InDesign og fra EST
  	var activeScript;
    try {
      activeScript = File(app.activeScript); // InDesign
    } catch (e) {
      activeScript = File(e.fileName); // EST
    }
    return activeScript.parent; // skriptfolderen
  }


  function lagSkjema(myLabel, mySelection, mySpread) { // finner ut hvilke stiler og bilder som skal hvor ut i fra en selection som består av en gruppe eller tekstramme
    var mittSkjema = {
      pictures: [],
      stories: [],
      styles: {}
    }; // alle bilde
    var myDocument = mySpread.parent;
    var myParagraphStyles;
    var myText;
    var findStyles = function(myParagraphs) {
      var myParagraph;
      var myStyles = [];
      for (q = 0; q < myParagraphs.length; q++) {
        myStyles[q] = myParagraphs[q].appliedParagraphStyle.name;
      }
      myStyles = dokTools.removeDuplicates(myStyles);
      return myStyles;
    };


    var findGroup = function(minArtikkel, mySelection, mySpread) {
      var myLabel = minArtikkel.artikkeltype.name;
      var myFoundGroup;
      if (mySelection.length > 0) {
        while (mySelection.parent instanceof Group) {
          mySelection = [mySelection.parent]; // en ny array som bare inneholder parent G
        }
      }

      if (mySelection.length > 1) { // flere enn ett pageObject er selected av brukeren
        myFoundGroup = mySpread.groups.add(mySelection); // lager et nytt gruppeobjekt
      } else if (mySelection.length === 1) { // nøyaktig ett pageObject er selektert av brukeren
        myFoundGroup = mySelection[0];
        if (myFoundGroup instanceof TextFrame || myFoundGroup instanceof Group) {
          var foundLabel = myFoundGroup.label.toLowerCase();
          var myArtikkeltyper = artikkeltyper;
          var foundArtikkeltype = artikkeltyper[foundLabel];
          foundLabel = foundLabel.replace(/[\(\)\*\?\\\/]/g, ".");
          if (!myLabel.toLowerCase().match(foundLabel) && foundArtikkeltype) {
            if (!confirm("Sjekk sakstype\rMalen er tenkt for artikkeltypen " + foundArtikkeltype.name + ". Saken du importerer er av typen " + myLabel + ". Importer likevel?")) {
              exit();
            } else {
              minArtikkel.artikkeltype = foundArtikkeltype;
            }
          }
        } else { // selection er noe annet enn en TextFrame eller Group
          myFoundGroup = null;
        }
      }
      if (myFoundGroup === null) { // ingen gruppe er etablert
        for (var n = 0; n < mySpread.pageItems.length; n++) {
          if (mySpread.pageItems[n].label.toLowerCase() === myLabel.toLowerCase()) {
            myFoundGroup = mySpread.pageItems[n].getElements()[0]; // et pageElement med riktig label
            break;
          }
        }
      }
      return myFoundGroup;
    };

    var findAllElements = function(myGroup, mittSkjema) {
      var findElements = function(myStory) {
        var myItem;
        //var myStory;
        var myPicture;
        mittSkjema.stories.push(myStory);
        for (var m = 0; m < myStory.tables.length; m++) {
          if (myStory.tables[m].appliedTableStyle.name.match("bylineboks")) {
            myStory.tables[m].remove(); //sletter bylinebokser
          } else {
            for (var o = 0; o < myStory.tables[m].cells.length; o++) {
              findElements(myStory.tables[m].cells[o]); // rekursiv kalling av funksjon!
            }
          }
        }
        for (var p = 0; p < myStory.pageItems.length; p++) {
          myItem = myStory.pageItems[p].getElements()[0];
          if (myItem.constructor.name === "TextFrame") {
            findElements(myItem.parentStory); // rekursiv kalling av funksjon!
          } else if (myItem.constructor.name === "Rectangle" && myItem.contentType === ContentType.GRAPHIC_TYPE) {
            mittSkjema.pictures.push(myItem.id);
          } else {
            // et annet type element, som jeg gir blaffen i
          }
        }
      };
      if (myGroup instanceof Group) {
        loop: for (var n = 0; n < myGroup.textFrames.length; n++) { // går gjennom alle textFrames i gruppa
          for (var m = 0; m < n; m++) {
            if (myGroup.textFrames[n].parentStory === myGroup.textFrames[m].parentStory) {
              continue loop;
            }
          }
          findElements(myGroup.textFrames[n].parentStory); // legger til eventuelle nested objects i elementet mittSkjema.
        }
        for (q = 0; q < myGroup.rectangles.length; q++) { // går gjennom alle rectangles (bilderammer) i gruppa
          if (myGroup.rectangles[q].contentType === ContentType.GRAPHIC_TYPE) {
            mittSkjema.pictures.push(myGroup.rectangles[q].id);
          }
        }
        myGroup.ungroup();
      } else if (myGroup instanceof TextFrame) {
        findElements(myGroup.parentStory);
      }
      return mittSkjema;
    };
    var sorterStories = function(myStories) {
      if (myStories.length > 0) {
        var txtStory;
        var myStory;

        var sortByLength = function(a, b) {
          return (b.story.contents.length - a.story.contents.length); // sorterer stories etter hvilken som har flest paragraphStyles i seg, eventuellt lengden på story
        };
        var sortByPosition = function(a, b) {
          return (a.position - b.position); // sorterer stories etter deres posisjon
        };
        for (n = 0; n < myStories.length; n++) {
          myStory = {};
          myStory.maltekst = true;
          myStory.story = myStories[n];
          myStory.styles = findStyles(myStory.story.paragraphs);
          myStory.position = dokTools.findPosition(myStory.story);
          myStories[n] = myStory;
        }
        myStories.sort(sortByLength);
        txtStory = myStories.splice(0, 1); // txtStory blir den storien med flest ulike ParagraphStyles;
        myStories.sort(sortByPosition);
        myStories = myStories.concat(txtStory); // txtStory blir plassert til slutt, uavhengig av posisjon
        for (var n = myStories.length - 1; n > 0; n--) { // fjerner duplikater ER DETTE NØDVENDIG ?
          if (myStories[n].story === myStories[n - 1].story) {
            myStories.splice(n, 1);
          }
        }
      }
      return myStories;
    };
    var sorterPictures = function(myPictures) {
      var myGB;
      var myPicture;
      myPictures = dokTools.removeDuplicates(myPictures);
      for (n = 0; n < myPictures.length; n++) {
        myPicture = {};
        myPicture.rectangle = myDocument.pageItems.itemByID(myPictures[n]);
        myGB = myPicture.rectangle.geometricBounds;
        myPicture.size = (myGB[2] - myGB[0]) * (myGB[3] - myGB[1]);
        myPictures[n] = myPicture; // bytter ut pekeren til rectangle med et objekt med flere greier på plass;
      }
      myPictures.sort(function(a, b) { // sorterer bilder
        var resultat;
        resultat = (Math.round(b.size - a.size)); // sorterer etter areal
        if (resultat === 0) {
          resultat = Math.round((a.rectangle.geometricBounds[0] - b.rectangle.geometricBounds[0])); // sorterer etter bildetopp
        }
        if (resultat === 0) {
          resultat = Math.round((a.rectangle.geometricBounds[1] - b.rectangle.geometricBounds[1])); // sorterer etter venstre side av bilde
        }
        return resultat;
      });
      return myPictures;
    };

    var finnDefaultStyles = function(myStories, configStyles) {
      var myStyleName;
      var myStyles = {};
      for (var styleName in configStyles) {
        if (configStyles.hasOwnProperty(styleName)) {
          myLoop: for (var n = 0; n < myStories.length; n++) {
            for (var i = 0; i < myStories[n].styles.length; i++) {
              myStyleName = myStories[n].styles[i];
              if (myStyleName.match("\\b" + styleName)) {
                myStyles[styleName] = myStyleName;
                break myLoop;
              }
              myStyles[styleName] = "";
            }
          }
        }
      }
      return myStyles;
    };

    var myGroup = findGroup(myLabel, mySelection, mySpread);
    mittSkjema = findAllElements(myGroup, mittSkjema);
    mittSkjema.stories = sorterStories(mittSkjema.stories);
    mittSkjema.pictures = sorterPictures(mittSkjema.pictures);
    mittSkjema.styles = finnDefaultStyles(mittSkjema.stories, config.overrideStyles);
    return (mittSkjema);
  }

if (DEBUG.constructor.name === "Number") { // DEBUG kan være en prodsak_id
  var sakstyper = artikkeltyper.liste(); // en array over de ulike sakstypene som artikkeltyper.jsxdev kjenner til
  var minSakstype = artikkeltyper[sakstyper[sakstyper.length - 1].toLowerCase()];
  var testSakstype;
  var erTtype;
  var minSak = prodsys.get(DEBUG);
  var minIndex = sakstyper.length - 1;

  for (var n = 0; n < sakstyper.length; n += 1) {
    testSakstype = artikkeltyper[sakstyper[n].toLowerCase()];
    erType = testSakstype.erType(minSak);
    if (erType === "mappe") { // gjetter hvilken sakstype det dreier seg om - se artikkeltyper.jsxinc Dette er nødvendig i tilfelle lista over sakstyper i produksjonssystemet ikke er oppdatert.
      minSakstype = testSakstype;
    } else if (erType === true) {
      minSakstype = testSakstype;
      break;
    }
  }
  importerSak(minSak, minSakstype, BILDEDEBUG); // importerer saken og plasserer den på siden.
} else {
  importPanel.visDialog(DEBUG);
}

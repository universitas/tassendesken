#include prodsys.jsxinc 
var artikkeltyper = { // Hvilken mappe skal bildefilene lagres i? Dette objektet BØR oppdateres hvis det skjer endringer i prodsys.
	nyhet: "Nyhet",
	nett: "Nyhet",
	nyhetsnotis: "Nyhet",
	news: "Nyhet",
	omverden: "Nyhet",
	fempaaPlassen: "Nyhet",
	kultur: "Kultur",
	kulturnotis: "Kultur",
	kulturkommentar: "Kultur",
	anmeldelser: "Plakaten",
	treFavoritter: "Plakaten",
	kortomnytt: "Plakaten",
	kommentar: "Side2",
	år: "Nyhet",
	leder: "Side2",
	sms: "Debatt",
	kronikk: "Debatt",
	leserbrev: "Debatt",
	gjesteskribent: "Side2",
	studietid: "Kultur",
	petit: "Kultur",
	minstudietid: "Kultur",
	vispor:  "Baksiden",
	tassen:  "Baksiden",
	adnotam: "Baksiden",
	rubrikk: null,
	plakaten: "Plakaten",
	oyeblikket: "Side2",
	frampeik: "Plakaten",
	supernova: null,
	novanoir: null,
	quiz: "Baksiden",
	magasin: "Magasin",
	velkomstbilag: "Magasin",
	universitasmelder: null,
	Nett:	"Nyheter"
	}
var seksjoner = ["Side2","Baksiden","Debatt","Forside","Kultur","Nyhet","Plakaten","Magasin"];// godkjente seksjoner
var panelSize = 10; // antall prodsys-saker som skal vises.
var dokumentPanelSize = 10; // antall Photoshop-dokumenter som skal vises.
var startnummer = 0; // øverste sak i lista om man skroller
var jpgsettings = new JPEGSaveOptions;
jpgsettings.embedColorProfile=true;
jpgsettings.quality=10;
if ($.os.match("Mac")){
	var rotmappe = "/univ-desken/"; // bildene skal ligge her
	var smallFont = ScriptUI.newFont("Lucida Grande", "bold", 9) // litt mindre font enn standardstørrelsen
} else if ($.os.match("Windows")){
	var rotmappe = "//platon/univ-desken/"; // bildene skal ligge her
	var smallFont = ScriptUI.newFont("Arial", "bold", 9) // litt mindre font enn standardstørrelsen
}

var mittNavn = "";
if (app.documents.length<dokumentPanelSize){
	panelSize = panelSize + (dokumentPanelSize - app.documents.length) * 2;
}




// BRUKES IKKE LENGER FORDI KJETIL BLE FORVIRRA
//~ var fotograf;

//~ try{
//~ 	fotograf = app.getCustomOptions("fotograf");
//~ 	mittNavn = fotograf.getString(0);
//~ }catch(e){
//~ 	fotograf = new ActionDescriptor;
//~ 	fotograf.putString(0, mittNavn);
//~ 	app.putCustomOptions ("fotograf", fotograf, true)
//~ }

if (app.documents.length == 0){
	alert("Lagre bilder til universitas\nDet er ingen åpne dokumenter å lagre"); // avbryter
} else if (!Folder(rotmappe).exists) {
	alert("Lagre bilder til universitas\nDu er ikke koblet til "+rotmappe); // avbryter
} else {
	main(); // viser dialogvindu
//~ 	fotograf.putString(0, mittNavn);
//~ 	app.putCustomOptions ("fotograf", fotograf, true)
}

function main(){
	try{
		var mineSaker = prodsys.get(); // henter saker fra prodsys;
	}catch(e){
		errorAlert(e,"Får ikke kontakt med prodsys");
		exit();
	}
	var text;
	var valgtsak;
	var myDok;
	var myRow;
	var myDialog = new Window('dialog', 'Lagre til Universitas'); // brukergrensesnittet vises i denne dialogboksen
	
	for (n=mineSaker.length-1;n>=0;n-=1){ // sorter ut hvilke saker som er aktuelle å koble bilder til
		if (mineSaker[n].produsert!="0"&&mineSaker[n].produsert!="3"){ // fjerner ting som ikke har status = 0
			mineSaker.splice(n,1)
		}
	}
	mineSaker = [{value:true, arbeidstittel:"IKKE KOBLE TIL NOEN SAK", tekst:"hvis du velger dette blir ikke bildet koblet til produksjonssystemet", mappe:""}].concat(mineSaker.reverse()); // legger til et valg i starten av lista

	var panel1 = myDialog.add("panel", undefined, "Saker i prodsys:"); // liste over saker 
	panel1.orientation = "row";
	panel1.tekst = panel1.add("group");
	panel1.tekst.orientation = "column";
	panel1.tekst.spacing = 0;

	var panel2 = myDialog.add("panel"); // her skriver man inn info om fotograf, utgave, sakstittel, seksjon etc.
	panel2.orientation = "row";
	panel2.spacing = 10;
	
	label = panel2.add("statictext",undefined,"fotograf:");
	label.graphics.font=smallFont;
	
	var fotoInit = panel2.add("edittext",undefined, mittNavn); // felt til å skrive inn initaler for fotograf
	fotoInit.characters = 3;
	fotoInit.active = true;
		
	label = panel2.add("statictext",undefined,"nr:"); // felt tl å skrive inn utgavenummer
	label.graphics.font=smallFont;
	var utgavenummer = panel2.add("edittext",undefined, utgave()); // funksjonen utgave() finner navnet på mappa med høyest nummer
	utgavenummer.characters = 2;
	
	label = panel2.add("statictext",undefined,"tittel:"); // tittel på saken
	label.graphics.font=smallFont;
	var sakstittel = panel2.add("edittext",undefined, ""); 
	sakstittel.characters = 11;

	label = panel2.add("statictext",undefined,"seksjon:"); // navn på seksjonen
	label.graphics.font=smallFont;
	var mappenavn = panel2.add("edittext",undefined,"");
	mappenavn.characters = 7;
	
	var panel3 = myDialog.add("panel", undefined, "lagre bildefiler:"); // her velger man filnavn og hvilke bilder som skal lagres.
	panel3.spacing = 2;

	
	fotoInit.onChanging = function(){
		filnavn(1); // oppdaterer filnavnene
	};

	fotoInit.onChange = function(){
		fotoInit.text = fotoInit.text.toUpperCase(); // teksten blir store bokstaver
		fotoInit.text = fotoInit.text.replace(/[^A-Å]/gi,""); // fjerner ikke-bokstaver
		mittNavn = fotoInit.text;
		filnavn(1);
	};

	utgavenummer.onChange = function(){
		utgavenummer.text = utgavenummer.text.replace(/\D/g,""); // fjerner alt annet enn tall
		if (parseInt(utgavenummer.text)>99){ 
			utgavenummer.text = 99; // max utgavenummer
		}
		if (parseInt(utgavenummer.text)<1){
			utgavenummer.text = 1; // minste utgavenummer
		}
		filnavn(1);
	};
	sakstittel.onChange = function(){
		sakstittel.text = sakstittel.text.toLowerCase();
		sakstittel.text = sakstittel.text.replace(/æ/g,"a").replace(/ø/g,"o").replace(/å/g,"a").replace(/[^a-z0-9]/g,""); // kutter ut ikke-norske bokstaver og ikke-alfanumeriske tegn
		filnavn(1);
	};
	mappenavn.onChange = function(){
		var myRegexp = new RegExp ("^"+mappenavn.text,"i");		
		folderExists=false; 
		for(n=0;n<seksjoner.length;n+=1){ // går gjennom seksjonene for å se om de matcher med det som er skrevet i feltet
			if (myRegexp.test(seksjoner[n])&&mappenavn.text!=""){
				mappenavn.text=seksjoner[n]; // finner en match og bytter ut teksten med navnet på seksjonen
				folderExists=true; 
			}
		}
		if (!folderExists){ // ingen match og feltet tømmes
			mappenavn.text="";
		}
		filnavn(1);
	};

	var panel4 = myDialog.add("group"); // knapper for ok og avbryt

	myDialog.defaultElement = panel4.add("button", undefined, "ok"); 
	myDialog.defaultElement.enabled = false; // kan ikke trykke "ok" uten at nok informasjon er punchet inn
	myDialog.cancelElement = panel4.add("button", undefined, "avbryt");	
	
	panel1.minimumSize.width = 450;
	panel2.minimumSize.width = 450;
	panel3.minimumSize.width = 450;
	panel1.tekst.margins = [0,0,0,7];

	if (mineSaker.length < panelSize){
		panelSize = mineSaker.length; // panelSize er grensen for om det skal være scrollbar
	}
	
	var saksListe=[]; // lista over sakene som skal vises i panelet 
	for (var n = 0; n < panelSize; n+=1){
		myRow = panel1.tekst.add("group");
		saksListe[n]=myRow;
		myRow.text = myRow.add("statictext", undefined, mineSaker[n].mappe);
		myRow.text.alignment = ["left","bottom"];
		myRow.text.preferredSize = [75,12]
		myRow.text2 = myRow.add("statictext", undefined, mineSaker[n].arbeidstittel.substr(0,38));
		myRow.text2.alignment = ["fill","bottom"];
		myRow.button = myRow.add("radiobutton");
		myRow.button.alignment = ["right","bottom"];
		myRow.button.preferredSize = [18,20]
		myRow.text.graphics.font = smallFont;
		myRow.preferredSize = [400,20];
		myRow.alignment = "fill";
	}
	
	function saksListeFyll(start){
		var n;
		for (var m = 0; m < panelSize; m+=1){
			myRow = saksListe[m];
			n = m+start;
			myRow.text.text = mineSaker[n].mappe;
			myRow.text2.text = mineSaker[n].arbeidstittel.substr(0,38);
			myRow.button.value = mineSaker[n].value;
			myRow.button.onClick = function(sak,button){
				return function(){
					valgtsak = (sak!=0)? mineSaker[sak]: undefined;
					for (q=0;q<saksListe.length;q++){
						saksListe[q].button.value=false;
					}
					for (q=0;q<mineSaker.length;q++){
						mineSaker[q].value=false;
					}
					mineSaker[sak].value=true;
					button.value=true;
					if (valgtsak){ 
						mappenavn.text = artikkeltyper[valgtsak.mappe]||"";
						sakstittel.text = valgtsak.arbeidstittel.toLowerCase().replace(/^[\d\s]+/,"").replace(/æ/g,"a").replace(/ø/g,"o").replace(/å/g,"a").replace(/[^a-z0-9]/g,"").substr(0,12);
						filnavn(1);
					}
				}
			}(n,myRow.button);
			myRow.helpTip = mineSaker[n].tekst.substr(0,500);
		}
	}
	saksListeFyll(0);
	
	
	

	if (mineSaker.length > panelSize) {
		panel1.scrollbar = panel1.add("scrollbar",undefined,0,0,mineSaker.length-panelSize);
		panel1.scrollbar.jumpDelta = 1;
		panel1.scrollbar.stepDelta = 1;
		panel1.scrollbar.alignment = ["right","fill"];
		panel1.scrollbar.preferredSize.width = 15;
		panel1.scrollbar.preferredSize.height = 100;
		panel1.scrollbar.onChanging = function(){
			saksListeFyll(Math.floor(panel1.scrollbar.value));
			myDialog.layout.layout(true);
		}
	}
		
	var filer = [];
	var myDocuments = [app.activeDocument];
	for (var n=0; n < app.documents.length&&n < dokumentPanelSize-1; n++){
		if (app.documents[n]!=app.activeDocument){
			myDocuments.push(app.documents[n]);
		}
	}
	
	for (var n = 0; n < myDocuments.length; n+=1){
		myDok = myDocuments[n];
		if (n>0){
			separator = panel3.add("panel");
			separator.preferredSize = [420,2];
		}
		// Rad 1
		myRow = panel3.add("group");
		myRow.alignment = "fill";
		myRow.maxSize = [420,12];

		filer[n] = {dokument:myDok};
		filer[n].checkbox = myRow.add("checkbox")
 		filer[n].checkbox.onClick = function(){
			filnavn(1);
		}
		label = myRow.add("statictext", undefined, myDok.name.substr(0,25), undefined);
		label.graphics.font=smallFont;
		filer[n].filnavn = myRow.add("edittext",undefined,(myDok.name+".").replace(/\..*/,".jpg").replace(/\s+/g,"_"));
		filer[n].filnavn.characters = 35;
		filer[n].filnavn.graphics.font=smallFont;
		filer[n].filnavn.alignment = ["right","fill"];
		
		filer[n].filnavn.onChange = function(myEditText){
			return function(){
				myEditText.text = (myEditText.text+".").replace(/\..*/,".jpg").replace(/\s+/g,"_");
			}
		}(filer[n].filnavn);
				
		filer[n].checkbox.enabled = false;

		// Rad 2
		myRow = panel3.add("group");
		myRow.alignment = "fill";
		myRow.maxSize = [420,12];
		label = myRow.add("statictext", undefined, "prioritet:", undefined);
		label.graphics.font=smallFont;
		filer[n].prioritet = myRow.add("edittext",undefined,"1");
		filer[n].prioritet.graphics.font=smallFont;
			
		filer[n].prioritet.onChange = function(myEditText){
			return function(){
				var myPrioritet= parseInt(myEditText.text) 
				if (false==(myPrioritet>=0&&myPrioritet<=5)){
					myEditText.text = "0";
				}
			}
		}(filer[n].prioritet);
	
		label = myRow.add("statictext", undefined, "nøkkelord:", undefined);
		label.helpTip = "Skriv inn navn på personer, steder og så videre for å gjøre bildet søkbart"
		label.graphics.font=smallFont;		
		label.alignment = ["right","fill"];
		filer[n].bildetekst = myRow.add("edittext",undefined,"");
		filer[n].bildetekst.graphics.font=smallFont;
		filer[n].bildetekst.characters = 35;
		filer[n].bildetekst.alignment = ["right","fill"];
		filer[n].bildetekst.helpTip = label.helpTip;
		
		if (n == 0){
			filer[n].checkbox.value = true;
		} else {
			filer[n].checkbox.value = false;
		}
	}		
		
		
	var svar = myDialog.show();
	if (svar == 1){ // hvis man trykker "OK"
		var json = '{"bilete":[';
		var save = false;
		var minFil;
		var fila;
		var mappami;
		var path = [];
		for (var n=0; n<filer.length; n+=1){
			minFil = filer[n];
			myDok = minFil.dokument;
			mappami = minFil.mappe;
			if (minFil.checkbox.value==true&&minFil.fil){
				while (mappami.exists==false){
					//path.push(mappami.name.replace(/(\d\d)/, "_$1"));
					path.push(mappami.name);
					mappami = mappami.parent;
				}
				
				while (path.length > 0){
					mappami = new Folder(mappami.fullName+"/"+path.pop());
					if (mappami.exists==false){
						mappami.create();
					}
				}
			
				var filnavn = mappami.fullName+"/"+minFil.filnavn.text;
				var bildetekst = minFil.bildetekst.text;
				var prioritet = minFil.prioritet.text;
				
				fila = new File(filnavn);
				app.activeDocument = myDok;
				myDok.info.keywords = bildetekst.replace(/ ?, ?/g,",").split(",");
				if (myDok.layers.length == 1&&myDok.layers[0].isBackgroundLayer){ // er dokumentet flattened?
					myDok.saveAs(fila, jpgsettings); // save as 
				} else {
					myDok.saveAs(fila, jpgsettings, true); // save as copy
				}
				json += '{"prodbilde_id":"0","bildefil":"'+fila.name+'","bildetekst":"'+bildetekst+'","prioritet":"'+prioritet+'"},'
				save = true;
			}
		}
		json = json.replace(/,$/,"]}").replace(/-/g,"_");
		if (save&&valgtsak!=undefined){
			try{
				prodsys.post(valgtsak.prodsak_id,json);
			}catch(e){
				//errorAlert(e, "Feil ved eksport");
			}
		}
	}
	
	
	function filnavn(siffer){
		siffer = 0;
 		var filnavn;
		var myFile;
		var myFolder;
		var initialer = fotoInit.text.toUpperCase().replace(/[^A-Å]/gi,"");
		var nummer = ("0"+utgavenummer.text).slice(-2);
		var mappe = mappenavn.text;
		var arbeidstittel = sakstittel.text;
		var mappepath;
		
		if (initialer&&nummer&&mappe&&arbeidstittel){			
			mappepath = rotmappe+nummer+"/"+mappe+"/";
			myFolder = new Folder(mappepath);
			if (!myFolder.exists){
				mappepath = rotmappe+"_"+nummer+"/"+mappe+"/";
				myFolder = new Folder(mappepath);
			}
			mappe = mappe.slice(0,3).toUpperCase();
			siffer = 1;
			for (var n=0; n < filer.length; n+=1){
				if (filer[n].checkbox.enabled == false){
					filer[n].checkbox.enabled = true;
					myDialog.defaultElement.enabled = true;
				}
				if (filer[n].checkbox.value == true){
					do{
						filnavn = nummer+"_"+mappe+"_"+arbeidstittel+"_"+((siffer<10)? "0"+siffer: siffer)+"_"+initialer+".jpg";
						myFile = new File(mappepath+filnavn);
						siffer += 1
					} while (myFile.exists);
					filer[n].filnavn.text = filnavn;
					filer[n].fil = myFile;
					filer[n].mappe = myFolder;
				} else {
					filer[n].filnavn.text = nummer+"_"+mappe+"_"+arbeidstittel+"_"+"XX"+"_"+initialer+".jpg";
				}
			}
		} else {
			for (var n=0; n < filer.length; n+=1){
				// filer[n].checkbox.value = false;
				filer[n].checkbox.enabled = false;
				myDialog.defaultElement.enabled = false;
			}
		}
	}
}

function errorAlert(message, title) {
	var d = new Window('dialog', title);
	var msg = message.split("\n");
	var f = d.graphics.font; 
	d.top = d.add("group"); 
	d.top.orientation="row";
	d.right = d.top.add("group", undefined); d.right.orientation="column";
	d.bold = d.right.add('statictext', undefined, msg[0]);
	d.bold.graphics.font = ScriptUI.newFont(f.name,ScriptUI.FontStyle.BOLD,f.size);
	d.rom = d.right.add('edittext', undefined, msg.slice(1).join("\n"), 
		{readonly:false, borderless: false, multiline: true, scrollable: true});
	d.rom.graphics.font = ScriptUI.newFont(f.name,f.style,f.size-2);
	d.rom.preferredSize = [300,300];
	d.rom.alignment="fill";
	d.rom.active = true;
	d.ok = d.add("button", undefined, "OK", { name: "ok"});
	d.ok.alignment = "right";
	d.show();
}

function utgave(){ // finner ut hvilket nummer som er det neste ved å lete etter mappa med høyest nummer
	var path = rotmappe;
	var nummer;
	var myFile;
	for (i = 50; i > 0; i--){
		if (i<10){
			nummer = "0"+i;
		}
		else {
			nummer = i;
		}
		myFile = Folder (path+nummer);
		if (myFile.exists) {
			return i
		}
	}
	return 0;
}

function parseCSV(filePath){ // leser en CSV-fil og returnerer en array med tabellen i fila
	var csvfil;
	var result;
	csvfil=new File(filePath);
	csvfil.open();
	fileContent = csvfil.read();
	csvfil.close();
	eval("result=[['"+fileContent.replace(/,/g, "','").replace (/\n/g, "'],['")+"']];");
	return result;
}
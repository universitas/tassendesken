/* jshint ignore:start */
// #include config.jsxinc
#include ../prodsys.jsxinc
/* jshint ignore:end */

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
	Nett: "Nyheter"
	};
var seksjoner = ["Side2","Baksiden","Debatt","Forside","Kultur","Nyhet","Plakaten","Magasin"];// godkjente seksjoner
var panelSize = 10; // antall prodsys-saker som skal vises.
var dokumentPanelSize = 10; // antall Photoshop-dokumenter som skal vises.
var startnummer = 0; // øverste sak i lista om man skroller
var jpgsettings = JPEGSaveOptions;
jpgsettings.embedColorProfile=true;
jpgsettings.quality=10;
var rotmappe = config.rotMappe; // bildene skal ligge her
var smallfont = config.smallFont; // litt mindre font enn standardstørrelsen
var mittNavn = "";
var dash = "-";
if (app.documents.length<dokumentPanelSize){
	panelSize = panelSize + (dokumentPanelSize - app.documents.length) * 2;
}

if (app.documents.length === 0){
	alert("Lagre bilder til universitas\nDet er ingen åpne dokumenter å lagre"); // avbryter
} else if (!Folder(rotmappe).exists) {
	alert("Lagre bilder til universitas\nDu er ikke koblet til "+rotmappe); // avbryter
} else {
	main(); // viser dialogvindu
}

function main(){
	var mineSaker;
	try{
		mineSaker = prodsys.get(); // henter saker fra prodsys;
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
			mineSaker.splice(n,1);
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
	label.graphics.font=smallfont;

	var fotoinit = panel2.add("edittext",undefined, ""); // felt til å skrive inn initaler for fotograf
	fotoinit.characters = 3;
	fotoinit.active = true;

	label = panel2.add("statictext",undefined,"nr:"); // felt tl å skrive inn utgavenummer
	label.graphics.font=smallfont;
	var utgavenummer = panel2.add("edittext",undefined, utgave()); // funksjonen utgave() finner navnet på mappa med høyest nummer
	utgavenummer.characters = 2;

	label = panel2.add("statictext",undefined,"tittel:"); // tittel på saken
	label.graphics.font=smallfont;
	var sakstittel = panel2.add("edittext",undefined, "");
	sakstittel.characters = 11;

	label = panel2.add("statictext",undefined,"seksjon:"); // navn på seksjonen
	label.graphics.font=smallfont;
	var mappenavn = panel2.add("edittext",undefined,"");
	mappenavn.characters = 7;

	var panel3 = myDialog.add("panel", undefined, "lagre bildefiler:"); // her velger man filnavn og hvilke bilder som skal lagres.
	panel3.spacing = 2;


	fotoinit.onChanging = function(){
         filnavn(1); // oppdaterer filnavnene
	};

	fotoinit.onChange = function(){
		fotoinit.text = fotoinit.text.toUpperCase(); // teksten blir store bokstaver
		fotoinit.text = fotoinit.text.replace(/[^a-å]/gi,""); // fjerner ikke-bokstaver
		mittNavn = fotoinit.text;
		filnavn(1);
	};

	utgavenummer.onChange = function(){
		utgavenummer.text = utgavenummer.text.replace(/\d/g,""); // fjerner alt annet enn tall
		if (parseint(utgavenummer.text)>99){
			utgavenummer.text = 99; // max utgavenummer
		}
		if (parseint(utgavenummer.text)<1){
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
		var myregexp = new regexp ("^"+mappenavn.text,"i");
		folderexists=false;
		for(n=0;n<seksjoner.length;n+=1){ // går gjennom seksjonene for å se om de matcher med det som er skrevet i feltet
			if (myregexp.test(seksjoner[n])&&mappenavn.text!==""){
				mappenavn.text=seksjoner[n]; // finner en match og bytter ut teksten med navnet på seksjonen
				folderexists=true;
			}
		}
		if (!folderexists){ // ingen match og feltet tømmes
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

	var saksliste=[]; // lista over sakene som skal vises i panelet
	for (var n = 0; n < panelSize; n+=1){
		myrow = panel1.tekst.add("group");
		saksliste[n]=myrow;
		myrow.text = myrow.add("statictext", undefined, mineSaker[n].mappe);
		myrow.text.alignment = ["left","bottom"];
		myrow.text.preferredSize = [75,12];
		myrow.text2 = myrow.add("statictext", undefined, mineSaker[n].arbeidstittel.substr(0,38));
		myrow.text2.alignment = ["fill","bottom"];
		myrow.button = myrow.add("radiobutton");
		myrow.button.alignment = ["right","bottom"];
		myrow.button.preferredSize = [18,20];
		myrow.text.graphics.font = smallfont;
		myrow.preferredSize = [400,20];
		myrow.alignment = "fill";
	}

	function sakslistefyll(start){
		var n;
		for (var m = 0; m < panelSize; m+=1){
			myrow = saksliste[m];
			n = m+start;
			myrow.text.text = mineSaker[n].mappe;
			myrow.text2.text = mineSaker[n].arbeidstittel.substr(0,38);
			myrow.button.value = mineSaker[n].value;
			myrow.button.onClick = function(sak,button){
				return function(){
					valgtsak = (sak!==0)? mineSaker[sak]: undefined;
					for (q=0;q<saksliste.length;q++){
						saksliste[q].button.value=false;
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
				};
			}(n,myrow.button);
			myrow.helpTip = mineSaker[n].tekst.substr(0,500);
		}
	}
	sakslistefyll(0);


	if (mineSaker.length > panelSize) {
		panel1.scrollbar = panel1.add("scrollbar",undefined,0,0,mineSaker.length-panelSize);
		panel1.scrollbar.jumpdelta = 1;
		panel1.scrollbar.stepdelta = 1;
		panel1.scrollbar.alignment = ["right","fill"];
		panel1.scrollbar.preferredSize.width = 15;
		panel1.scrollbar.preferredSize.height = 100;
		panel1.scrollbar.onChanging = function(){
			sakslistefyll(math.floor(panel1.scrollbar.value));
			myDialog.layout.layout(true);
		};
	}

	var filer = [];
	var mydocuments = [app.activeDocument];
	for (n = 0; n < app.documents.length&&n < dokumentPanelSize-1; n++){
		if (app.documents[n]!=app.activeDocument){
			mydocuments.push(app.documents[n]);
		}
	}

	for (n = 0; n < mydocuments.length; n+=1){
		mydok = mydocuments[n];
		if (n>0){
			separator = panel3.add("panel");
			separator.preferredSize = [420,2];
		}
		// rad 1
		myrow = panel3.add("group");
		myrow.alignment = "fill";
		myrow.maxSize = [420,12];

		filer[n] = {dokument:mydok};
		filer[n].checkbox = myrow.add("checkbox");
 		filer[n].checkbox.onClick = function(){
			filnavn(1);
		};
		label = myrow.add("statictext", undefined, mydok.name.substr(0,25), undefined);
		label.graphics.font=smallfont;
		filer[n].filnavn = myrow.add("edittext",undefined,(mydok.name+".").replace(/\..*/,".jpg").replace(/\s+/g,dash));
		filer[n].filnavn.characters = 35;
		filer[n].filnavn.graphics.font=smallfont;
		filer[n].filnavn.alignment = ["right","fill"];

		filer[n].filnavn.onChange = function(myedittext){
			return function(){
				myedittext.text = (myedittext.text+".").replace(/\..*/,".jpg").replace(/\s+/g,dash);
			};
		}(filer[n].filnavn);

		filer[n].checkbox.enabled = false;

		// rad 2
		myrow = panel3.add("group");
		myrow.alignment = "fill";
		myrow.maxSize = [420,12];
		label = myrow.add("statictext", undefined, "prioritet:", undefined);
		label.graphics.font=smallfont;
		filer[n].prioritet = myrow.add("edittext",undefined,"1");
		filer[n].prioritet.graphics.font=smallfont;

		filer[n].prioritet.onChange = function(myedittext){
			return function(){
				var myprioritet= parseint(myedittext.text);
				if (false===(myprioritet>=0&&myprioritet<=5)){
					myedittext.text = "0";
				}
			};
		}(filer[n].prioritet);

		label = myrow.add("statictext", undefined, "nøkkelord:", undefined);
		label.helpTip = "skriv inn navn på personer, steder og så videre for å gjøre bildet søkbart";
		label.graphics.font=smallfont;
		label.alignment = ["right","fill"];
		filer[n].bildetekst = myrow.add("edittext",undefined,"");
		filer[n].bildetekst.graphics.font=smallfont;
		filer[n].bildetekst.characters = 35;
		filer[n].bildetekst.alignment = ["right","fill"];
		filer[n].bildetekst.helpTip = label.helpTip;

		if (n === 0){
			filer[n].checkbox.value = true;
		} else {
			filer[n].checkbox.value = false;
		}
	}


	var svar = myDialog.show();
	if (svar == 1){ // hvis man trykker "ok"
		var json = '{"bilete":[';
		var save = false;
		var minfil;
		var fila;
		var mappami;
		var path = [];
		for ( n=0; n<filer.length; n+=1){
			minfil = filer[n];
			mydok = minfil.dokument;
			mappami = minfil.mappe;
			if (minfil.checkbox.value===true&&minfil.fil){
				while (mappami.exists===false){
					//path.push(mappami.name.replace(/(\d\d)/, "_$1"));
					path.push(mappami.name);
					mappami = mappami.parent;
				}

				while (path.length > 0){
					mappami = new Folder(mappami.fullname+"/"+path.pop());
					if (mappami.exists===false){
						mappami.create();
					}
				}

				var filepath = mappami.fullName+"/"+minfil.filnavn.text;
				var bildetekst = minfil.bildetekst.text;
				var prioritet = minfil.prioritet.text;

				fila = new File(filepath);
				app.activeDocument = mydok;
				mydok.info.keywords = bildetekst.replace(/ ?, ?/g,",").split(",");
				if (mydok.layers.length == 1&&mydok.layers[0].isBackgroundLayer){ // er dokumentet flattened?
					mydok.saveAs(fila, jpgsettings); // save as
				} else {
					mydok.saveAs(fila, jpgsettings, true); // save as copy
				}
				json += '{"prodbilde_id":"0","bildefil":"'+fila.name+'","bildetekst":"'+bildetekst+'","prioritet":"'+prioritet+'"},';
				save = true;
			}
		}
		json = json.replace(/,$/,"]}").replace(/-/g,dash);
		if (save&&valgtsak!==undefined){
			try{
				prodsys.post(valgtsak.prodsak_id,json);
			}catch(e){
				//errorAlert(e, "feil ved eksport");
			}
		}
	}


	function filnavn(siffer){
		siffer = 0;
		var n;
 	   var filNavn;
		var myfile;
		var myfolder;
		var initialer = fotoinit.text.toUpperCase().replace(/[^a-å]/gi,"");
		var nummer = ("0"+utgavenummer.text).slice(-2);
		var mappe = mappenavn.text;
		var arbeidstittel = sakstittel.text;
		var mappepath;

		if (initialer&&nummer&&mappe&&arbeidstittel){
			mappepath = rotmappe+nummer+"/"+mappe+"/";
			myfolder = new Folder(mappepath);
			if (!myfolder.exists){
				mappepath = rotmappe+dash+nummer+"/"+mappe+"/";
				myfolder = new Folder(mappepath);
			}
			mappe = mappe.slice(0,3).toUpperCase();
			siffer = 1;
			for (n=0; n < filer.length; n+=1){
				if (filer[n].checkbox.enabled === false){
					filer[n].checkbox.enabled = true;
					myDialog.defaultElement.enabled = true;
				}
				if (filer[n].checkbox.value === true){
					do{
						filNavn = nummer+dash+mappe+dash+arbeidstittel+dash+((siffer<10)? "0"+siffer: siffer)+dash+initialer+".jpg";
						myfile = new File(mappepath+filNavn);
						siffer += 1;
					} while (myfile.exists);
					filer[n].filnavn.text = filNavn;
					filer[n].fil = myfile;
					filer[n].mappe = myfolder;
				} else {
					filer[n].filNavn.text = nummer+dash+mappe+dash+arbeidstittel+dash+"xx"+dash+initialer+".jpg";
				}
			}
		} else {
			for (n=0; n < filer.length; n+=1){
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
			return i;
		}
	}
	return 0;
}

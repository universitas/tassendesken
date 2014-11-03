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

if (app.documents.length == 0){
	alert("Lagre bilder til universitas\nDet er ingen åpne dokumenter å lagre"); // avbryter
} else if (!Folder(rotmappe).exists) {
	alert("Lagre bilder til universitas\nDu er ikke koblet til "+rotmappe); // avbryter
} else {
	main(); // viser dialogvindu
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
	label.graphics.font=smallfont;

	var fotoinit = panel2.add("edittext",undefined, mittnavn); // felt til å skrive inn initaler for fotograf
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

	var panel3 = mydialog.add("panel", undefined, "lagre bildefiler:"); // her velger man filnavn og hvilke bilder som skal lagres.
	panel3.spacing = 2;


	fotoinit.onchanging = function(){
		filnavn(1); // oppdaterer filnavnene
	};

	fotoinit.onchange = function(){
		fotoinit.text = fotoinit.text.touppercase(); // teksten blir store bokstaver
		fotoinit.text = fotoinit.text.replace(/[^a-å]/gi,""); // fjerner ikke-bokstaver
		mittnavn = fotoinit.text;
		filnavn(1);
	};

	utgavenummer.onchange = function(){
		utgavenummer.text = utgavenummer.text.replace(/\d/g,""); // fjerner alt annet enn tall
		if (parseint(utgavenummer.text)>99){
			utgavenummer.text = 99; // max utgavenummer
		}
		if (parseint(utgavenummer.text)<1){
			utgavenummer.text = 1; // minste utgavenummer
		}
		filnavn(1);
	};
	sakstittel.onchange = function(){
		sakstittel.text = sakstittel.text.tolowercase();
		sakstittel.text = sakstittel.text.replace(/æ/g,"a").replace(/ø/g,"o").replace(/å/g,"a").replace(/[^a-z0-9]/g,""); // kutter ut ikke-norske bokstaver og ikke-alfanumeriske tegn
		filnavn(1);
	};
	mappenavn.onchange = function(){
		var myregexp = new regexp ("^"+mappenavn.text,"i");
		folderexists=false;
		for(n=0;n<seksjoner.length;n+=1){ // går gjennom seksjonene for å se om de matcher med det som er skrevet i feltet
			if (myregexp.test(seksjoner[n])&&mappenavn.text!=""){
				mappenavn.text=seksjoner[n]; // finner en match og bytter ut teksten med navnet på seksjonen
				folderexists=true;
			}
		}
		if (!folderexists){ // ingen match og feltet tømmes
			mappenavn.text="";
		}
		filnavn(1);
	};

	var panel4 = mydialog.add("group"); // knapper for ok og avbryt

	mydialog.defaultelement = panel4.add("button", undefined, "ok");
	mydialog.defaultelement.enabled = false; // kan ikke trykke "ok" uten at nok informasjon er punchet inn
	mydialog.cancelelement = panel4.add("button", undefined, "avbryt");

	panel1.minimumsize.width = 450;
	panel2.minimumsize.width = 450;
	panel3.minimumsize.width = 450;
	panel1.tekst.margins = [0,0,0,7];

	if (minesaker.length < panelsize){
		panelsize = minesaker.length; // panelsize er grensen for om det skal være scrollbar
	}

	var saksliste=[]; // lista over sakene som skal vises i panelet
	for (var n = 0; n < panelsize; n+=1){
		myrow = panel1.tekst.add("group");
		saksliste[n]=myrow;
		myrow.text = myrow.add("statictext", undefined, minesaker[n].mappe);
		myrow.text.alignment = ["left","bottom"];
		myrow.text.preferredsize = [75,12]
		myrow.text2 = myrow.add("statictext", undefined, minesaker[n].arbeidstittel.substr(0,38));
		myrow.text2.alignment = ["fill","bottom"];
		myrow.button = myrow.add("radiobutton");
		myrow.button.alignment = ["right","bottom"];
		myrow.button.preferredsize = [18,20]
		myrow.text.graphics.font = smallfont;
		myrow.preferredsize = [400,20];
		myrow.alignment = "fill";
	}

	function sakslistefyll(start){
		var n;
		for (var m = 0; m < panelsize; m+=1){
			myrow = saksliste[m];
			n = m+start;
			myrow.text.text = minesaker[n].mappe;
			myrow.text2.text = minesaker[n].arbeidstittel.substr(0,38);
			myrow.button.value = minesaker[n].value;
			myrow.button.onclick = function(sak,button){
				return function(){
					valgtsak = (sak!=0)? minesaker[sak]: undefined;
					for (q=0;q<saksliste.length;q++){
						saksliste[q].button.value=false;
					}
					for (q=0;q<minesaker.length;q++){
						minesaker[q].value=false;
					}
					minesaker[sak].value=true;
					button.value=true;
					if (valgtsak){
						mappenavn.text = artikkeltyper[valgtsak.mappe]||"";
						sakstittel.text = valgtsak.arbeidstittel.tolowercase().replace(/^[\d\s]+/,"").replace(/æ/g,"a").replace(/ø/g,"o").replace(/å/g,"a").replace(/[^a-z0-9]/g,"").substr(0,12);
						filnavn(1);
					}
				}
			}(n,myrow.button);
			myrow.helptip = minesaker[n].tekst.substr(0,500);
		}
	}
	sakslistefyll(0);




	if (minesaker.length > panelsize) {
		panel1.scrollbar = panel1.add("scrollbar",undefined,0,0,minesaker.length-panelsize);
		panel1.scrollbar.jumpdelta = 1;
		panel1.scrollbar.stepdelta = 1;
		panel1.scrollbar.alignment = ["right","fill"];
		panel1.scrollbar.preferredsize.width = 15;
		panel1.scrollbar.preferredsize.height = 100;
		panel1.scrollbar.onchanging = function(){
			sakslistefyll(math.floor(panel1.scrollbar.value));
			mydialog.layout.layout(true);
		}
	}

	var filer = [];
	var mydocuments = [app.activedocument];
	for (var n=0; n < app.documents.length&&n < dokumentpanelsize-1; n++){
		if (app.documents[n]!=app.activedocument){
			mydocuments.push(app.documents[n]);
		}
	}

	for (var n = 0; n < mydocuments.length; n+=1){
		mydok = mydocuments[n];
		if (n>0){
			separator = panel3.add("panel");
			separator.preferredsize = [420,2];
		}
		// rad 1
		myrow = panel3.add("group");
		myrow.alignment = "fill";
		myrow.maxsize = [420,12];

		filer[n] = {dokument:mydok};
		filer[n].checkbox = myrow.add("checkbox")
 		filer[n].checkbox.onclick = function(){
			filnavn(1);
		}
		label = myrow.add("statictext", undefined, mydok.name.substr(0,25), undefined);
		label.graphics.font=smallfont;
		filer[n].filnavn = myrow.add("edittext",undefined,(mydok.name+".").replace(/\..*/,".jpg").replace(/\s+/g,"_"));
		filer[n].filnavn.characters = 35;
		filer[n].filnavn.graphics.font=smallfont;
		filer[n].filnavn.alignment = ["right","fill"];

		filer[n].filnavn.onchange = function(myedittext){
			return function(){
				myedittext.text = (myedittext.text+".").replace(/\..*/,".jpg").replace(/\s+/g,"_");
			}
		}(filer[n].filnavn);

		filer[n].checkbox.enabled = false;

		// rad 2
		myrow = panel3.add("group");
		myrow.alignment = "fill";
		myrow.maxsize = [420,12];
		label = myrow.add("statictext", undefined, "prioritet:", undefined);
		label.graphics.font=smallfont;
		filer[n].prioritet = myrow.add("edittext",undefined,"1");
		filer[n].prioritet.graphics.font=smallfont;

		filer[n].prioritet.onchange = function(myedittext){
			return function(){
				var myprioritet= parseint(myedittext.text)
				if (false==(myprioritet>=0&&myprioritet<=5)){
					myedittext.text = "0";
				}
			}
		}(filer[n].prioritet);

		label = myrow.add("statictext", undefined, "nøkkelord:", undefined);
		label.helptip = "skriv inn navn på personer, steder og så videre for å gjøre bildet søkbart"
		label.graphics.font=smallfont;
		label.alignment = ["right","fill"];
		filer[n].bildetekst = myrow.add("edittext",undefined,"");
		filer[n].bildetekst.graphics.font=smallfont;
		filer[n].bildetekst.characters = 35;
		filer[n].bildetekst.alignment = ["right","fill"];
		filer[n].bildetekst.helptip = label.helptip;

		if (n == 0){
			filer[n].checkbox.value = true;
		} else {
			filer[n].checkbox.value = false;
		}
	}


	var svar = mydialog.show();
	if (svar == 1){ // hvis man trykker "ok"
		var json = '{"bilete":[';
		var save = false;
		var minfil;
		var fila;
		var mappami;
		var path = [];
		for (var n=0; n<filer.length; n+=1){
			minfil = filer[n];
			mydok = minfil.dokument;
			mappami = minfil.mappe;
			if (minfil.checkbox.value==true&&minfil.fil){
				while (mappami.exists==false){
					//path.push(mappami.name.replace(/(\d\d)/, "_$1"));
					path.push(mappami.name);
					mappami = mappami.parent;
				}

				while (path.length > 0){
					mappami = new folder(mappami.fullname+"/"+path.pop());
					if (mappami.exists==false){
						mappami.create();
					}
				}

				var filnavn = mappami.fullname+"/"+minfil.filnavn.text;
				var bildetekst = minfil.bildetekst.text;
				var prioritet = minfil.prioritet.text;

				fila = new file(filnavn);
				app.activedocument = mydok;
				mydok.info.keywords = bildetekst.replace(/ ?, ?/g,",").split(",");
				if (mydok.layers.length == 1&&mydok.layers[0].isbackgroundlayer){ // er dokumentet flattened?
					mydok.saveas(fila, jpgsettings); // save as
				} else {
					mydok.saveas(fila, jpgsettings, true); // save as copy
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
				//erroralert(e, "feil ved eksport");
			}
		}
	}


	function filnavn(siffer){
		siffer = 0;
 		var filnavn;
		var myfile;
		var myfolder;
		var initialer = fotoinit.text.touppercase().replace(/[^a-å]/gi,"");
		var nummer = ("0"+utgavenummer.text).slice(-2);
		var mappe = mappenavn.text;
		var arbeidstittel = sakstittel.text;
		var mappepath;

		if (initialer&&nummer&&mappe&&arbeidstittel){
			mappepath = rotmappe+nummer+"/"+mappe+"/";
			myfolder = new folder(mappepath);
			if (!myfolder.exists){
				mappepath = rotmappe+"_"+nummer+"/"+mappe+"/";
				myfolder = new folder(mappepath);
			}
			mappe = mappe.slice(0,3).touppercase();
			siffer = 1;
			for (var n=0; n < filer.length; n+=1){
				if (filer[n].checkbox.enabled == false){
					filer[n].checkbox.enabled = true;
					mydialog.defaultelement.enabled = true;
				}
				if (filer[n].checkbox.value == true){
					do{
						filnavn = nummer+"_"+mappe+"_"+arbeidstittel+"_"+((siffer<10)? "0"+siffer: siffer)+"_"+initialer+".jpg";
						myfile = new file(mappepath+filnavn);
						siffer += 1
					} while (myfile.exists);
					filer[n].filnavn.text = filnavn;
					filer[n].fil = myfile;
					filer[n].mappe = myfolder;
				} else {
					filer[n].filnavn.text = nummer+"_"+mappe+"_"+arbeidstittel+"_"+"xx"+"_"+initialer+".jpg";
				}
			}
		} else {
			for (var n=0; n < filer.length; n+=1){
				// filer[n].checkbox.value = false;
				filer[n].checkbox.enabled = false;
				mydialog.defaultelement.enabled = false;
			}
		}
	}
}

function erroralert(message, title) {
	var d = new window('dialog', title);
	var msg = message.split("\n");
	var f = d.graphics.font;
	d.top = d.add("group");
	d.top.orientation="row";
	d.right = d.top.add("group", undefined); d.right.orientation="column";
	d.bold = d.right.add('statictext', undefined, msg[0]);
	d.bold.graphics.font = scriptui.newfont(f.name,scriptui.fontstyle.bold,f.size);
	d.rom = d.right.add('edittext', undefined, msg.slice(1).join("\n"),
		{readonly:false, borderless: false, multiline: true, scrollable: true});
	d.rom.graphics.font = scriptui.newfont(f.name,f.style,f.size-2);
	d.rom.preferredsize = [300,300];
	d.rom.alignment="fill";
	d.rom.active = true;
	d.ok = d.add("button", undefined, "ok", { name: "ok"});
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

// function parseCSV(filePath){ // leser en CSV-fil og returnerer en array med tabellen i fila
// 	var csvfil;
// 	var result;
// 	csvfil=new File(filePath);
// 	csvfil.open();
// 	fileContent = csvfil.read();
// 	csvfil.close();
// 	eval("result=[['"+fileContent.replace(/,/g, "','").replace (/\n/g, "'],['")+"']];");
// 	return result;
// }
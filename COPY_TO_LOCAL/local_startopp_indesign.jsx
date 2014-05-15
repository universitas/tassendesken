#targetengine "session"

function tassenMenu(){ // lager en meny i Indesign for egne skripts
    var myEvent;
    var menuName = "Universitas";
    if ($.os.match("Macintosh")){
        var scriptpath = "/Volumes/univ-desken/UTTEGNER/SCRIPTS_CS55/" // mappa der skriptene ligger
    } else { // Windows
        var scriptpath = "//platon/univ-desken/UTTEGNER/SCRIPTS_CS55/" // mappa der skriptene ligger
    }
	var myMenuItems = [ // skript som skal ha egne menyvalg
        ["Importer fra prodsys", "import.jsx"],
        ["Opprett ny avis", "mekksider.jsx"],
        ["Eksporter til PDF og prodsys", "eksportSider.jsx"],
        ["Endre sidetall og filnavn", "endreSidetall.jsx"],
        ["Lag saksmal","lagMal.jsx"],
        ["Lag spaltestreker","spaltestreker.jsx"],
	]
	var tassenMenu = app.menus.item("$ID/Main").submenus.item(menuName);
	
	if (tassenMenu != null){
		tassenMenu.remove(); // sletter menyen og fjerner det som måtte være der fra før av
	}
	
	tassenMenu = app.menus.item("$ID/Main").submenus.add(menuName);
	for (var n = 0; n<myMenuItems.length; n++){
		myEvent = app.scriptMenuActions.add(myMenuItems[n][0]);
		myEvent.addEventListener ("onInvoke", File(scriptpath+myMenuItems[n][1]));
		tassenMenu.menuItems.add(myEvent);
	}
	aktiverMenyItem = function(){
		var myMenuItem = ["Saksmaler -> Bibliotek og MAL_AVIS","legg_Saksmaler_i_Bibliotek.jsx"];
		var myItem = tassenMenu.menuItems.itemByName (myMenuItem[0]);
		if (null != myItem){
			myItem.remove();
		}
		myEvent = app.scriptMenuActions.add(myMenuItem[0]);
		myEvent.addEventListener ("onInvoke", File(scriptpath+myMenuItem[1]));
		if (app.documents.length > 0&&app.activeDocument.name.match(/saksmaler/i)){
			tassenMenu.menuItems.add(myEvent);
		} 
	}
	var myDokListener = tassenMenu.addEventListener("beforeDisplay", aktiverMenyItem, false);
}

function openLibraries(){ // åpner alle libraries på desktoppen
	var myLibraries 
	if ($.os.match("Macintosh") ){
		myLibraries = Folder("~/Desktop/").getFiles("*.indl");
	} else {
		myLibraries = Folder(Folder.desktop).getFiles("*.indl");
	}
	for (var i=0; i<myLibraries.length; i++){
		app.open(myLibraries[i]);		
	}
}

tassenMenu();
openLibraries();
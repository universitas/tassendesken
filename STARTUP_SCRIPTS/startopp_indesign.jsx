// Dette skriptet skal kjøre før indesign cs5.5+ starter. Det kopierer en del filer fra serveren til hver enkelt mac eller pc

var version = app.version.substr(0,3); // Versjon av InDesign der "8.0" er CS6. Er nødvendig for å finne mappa der lokale innstillinger må lagres.

alert("startup_indesign")

function copyFiles(localFolder, serverFolder, fileName) { // kopierer filer fra et sted (univ-desken) til et annet (brukerens område på den lokale maskina)
	if (!serverFolder.exists){
		throw "er ikke koblet til univ-desken";
		}
	if (!localFolder.exists){
		localFolder.create();
		}
	var myScripts = serverFolder.getFiles(fileName);
	for (var j = 0; myScripts.length > j; j++) {
		var myFile= myScripts[j];
		var target = new File(localFolder+"/"+myFile.name);
		if ((!target.exists||(target.exists && target.length != myFile.length))&&myFile.name.substr(0, 2)!="._"){
			var funker = myFile.copy(target); 
		}
	}
} 

function deleteFiles(myFolder, fileName){
	var myFile, myFiles;
	if (myFolder.exists){
		myFiles = myFolder.getFiles(fileName);
		for (var j=0; myFiles.length > j; j++){
			myFile = myFiles[j];
			try{
				myFile.remove()
			}catch(e){}
		}
	}
}

try{

	if ($.os.match("Macintosh")){
		copyFiles(Folder("~/Library/Preferences/Adobe%20InDesign/Version%20"+version+"/en_GB/InDesign%20Shortcut%20Sets/"), Folder("/univ-desken/UTTEGNER/SCRIPTS_CS55/"), "*.indk"); // Keyboard shortcuts
		copyFiles(Folder("~/Library/Application%20Support/Adobe/Adobe%20PDF/Settings/"), Folder("/univ-desken/UTTEGNER/SCRIPTS_CS55/"), "*.joboptions"); // PDF Export options
		copyFiles(Folder("~/Library/Preferences/Adobe%20InDesign/Version%20"+version+"/en_GB/Scripts/Startup%20Scripts/"), Folder("/univ-desken/UTTEGNER/SCRIPTS_CS55/OPPDATER/STARTUP_INDESIGN/"), "*.*"); // Startup scripts CS5
		copyFiles(Folder("~/Library/Preferences/Adobe%20InDesign/Version%20"+version+"/en_GB/Scripts/Scripts%20Panel/"), Folder("/univ-desken/UTTEGNER/SCRIPTS_CS55/"), "local_*.jsx"); // Javascript files
		copyFiles(Folder("~/Desktop/"), Folder("/univ-desken/UTTEGNER/MALER/"), "*.indl");// library files
		app.colorSettings.cmsSettings="universitas"; // sets the correct colour settings
	}else{ //Windows
        copyFiles(Folder(Folder.userData+"/Adobe/InDesign/Version "+version+"/en_GB/InDesign Shortcut Sets"), Folder("//platon/univ-desken/UTTEGNER/SCRIPTS_CS55/"), "*.indk"); // Keyboard shortcuts
        copyFiles(Folder(Folder.userData+"/Adobe/Adobe PDF/Settings"), Folder("//platon/univ-desken/UTTEGNER/SCRIPTS_CS55/"), "*.joboptions"); // PDF Export options
        copyFiles(Folder(Folder.userData+"/Adobe/InDesign/Version "+version+"/en_GB/Scripts/Startup Scripts"), Folder("//platon/univ-desken/UTTEGNER/SCRIPTS_CS55/OPPDATER/STARTUP_INDESIGN/"), "*.*"); // Startup scripts CS5
        copyFiles(Folder(Folder.userData+"/Adobe/InDesign/Version "+version+"/en_GB/Scripts/Scripts Panel"), Folder("//platon/univ-desken/UTTEGNER/SCRIPTS_CS55/"), "local_*.jsx"); // Javascript files
        copyFiles(Folder(Folder.desktop), Folder("//platon/univ-desken/UTTEGNER/MALER_CS55/"), "*.indl");// library files
        copyFiles(Folder(Folder.userData+"/Adobe/Color/Settings"), Folder("//platon/univ-desken/UTTEGNER/SCRIPTS_CS55/"), "*.csf"); // Color Profile
        app.colorSettings.cmsSettings="universitas"; // sets the correct colour settings
	}
}

catch(e){
	alert(e);
}



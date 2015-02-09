// Dette skriptet skal kjøre før indesign cs5.5+ starter. Det kopierer en del filer fra serveren til hver enkelt mac eller pc

// var version = app.version.substr(0,3); // Versjon av InDesign der "8.0" er CS6. Er nødvendig for å finne mappa der lokale innstillinger må lagres.
function get_folders(){

	VERSION = app.version.substr(0,3);
	LANGUAGE = 'en_GB';

	if ($.os.match("Macintosh")){
		DESKTOP = '~/Desktop';
		PREF = '~/Library/Preferences/Adobe InDesign/Version ' +VERSION + '/' + LANGUAGE +'/';
		SETTINGS ='~/Library/Application Support/Adobe/';
		SERVER = '/univ-desken/';
	} else {
		DESKTOP = Folder.desktop;
		PREF = Folder.userData + '/Adobe/InDesign/Version ' +VERSION + '/' + LANGUAGE +'/';
		SETTINGS = Folder.userData + '/Adobe/';
		SERVER = '//kant.uio.no/div-universitas-desken/';
	}

	folders = {
		local: {
			keyboard_shortcuts: PREF + 'InDesign Shortcut Sets/',
			startup_scripts: PREF +'Scripts/Startup Scripts/',
			script_panel: PREF + 'Scripts/Scripts Panel/',
			color_profile: SETTINGS + 'Color/Settings/',
			job_options: SETTINGS + 'Adobe PDF/Settings/',
			desktop: DESKTOP,
		},
		server: {
			libraries: SERVER + 'UTTEGNER/MALER/',
			repo: SERVER + 'SCRIPTS/COPY_TO_LOCAL/'
		}
	};

	return folders;
}

folders = get_folders();

var files_to_copy = [
	{
		filename: '*.psp', // Keyboard shortcuts indesign
		localfolder: folders.local.keyboard_shortcuts,
		remotefolder: folders.server.repo
	},
	{
		filename: '*.joboptions', // pdf joboptions indesign
		localfolder: folders.local.job_options,
		remotefolder: folders.server.repo
	},
	{
		filename: 'local_startopp_indesign.jsx', // indesign startup script
		localfolder: folders.local.startup_scripts,
		remotefolder: folders.server.repo
	},
	{
		filename: 'local_*.jsx', // scripts to indesign script panel
		localfolder: folders.local.script_panel,
		remotefolder: folders.server.repo
	},
	{
		filename: '*.csf', // color profile
		localfolder: folders.local.color_profile,
		remotefolder: folders.server.repo
	},
	{
		filename: '*.indl', // indesign libraries
		localfolder: folders.local.desktop,
		remotefolder: folders.server.libraries
	},
];

function main() {
	deleteFiles(folders.local.startup_scripts, '*.js*');
	for (var n=0; files_to_copy.length > n; n++){
		file = files_to_copy[n];

		filename = file.filename;
		source = Folder(file.remotefolder);
		destination = Folder(file.localfolder);
		copyFiles(destination, source, filename);

	}

	app.colorSettings.cmsSettings="universitas"; // sets the correct colour settings
}

function copyFiles(localFolder, serverFolder, fileName) { // kopierer filer fra et sted (univ-desken) til et annet (brukerens område på den lokale maskina)
	if (!serverFolder.exists){
		throw "er ikke koblet til univ-desken";
		}
	if (!localFolder.exists){
		localFolder.create();
		}
	var myFiles = serverFolder.getFiles(fileName);
	for (var j = 0; myFiles.length > j; j++) {
     var myFile= myFiles[j];
     if (myFile.name.substr(0,2)=='._'){
       continue;
     }
		var funker = false;
		var target = new File(localFolder+"/"+myFile.name);
		if (!target.exists || (target.exists && target.length != myFile.length)){
			funker = myFile.copy(target);
		}
    //$.writeln(funker, target);
	}
}

function deleteFiles(myFolder, fileName){
	var myFile, myFiles;
	if (myFolder.exists){
		myFiles = myFolder.getFiles(fileName);
		for (var j=0; myFiles.length > j; j++){
			myFile = myFiles[j];
			try{
				myFile.remove();
			}catch(e){}
		}
	}
}

main();
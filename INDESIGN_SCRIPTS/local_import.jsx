var scriptFile = "import.jsx";
var scriptFolder = "/Volumes/univ-desken/UTTEGNER/SCRIPTS_CS55/"

var myRunScript = function (scriptFile, scriptFolder){
	var myScript = File(scriptFolder+scriptFile);
	if (myScript.exists){
		app.doScript (myScript);
	}
}

myRunScript(scriptFile, scriptFolder);
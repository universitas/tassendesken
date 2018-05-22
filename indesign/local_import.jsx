var scriptFile = "import.jsx";
var scriptFolder = "//platon/univ-desken/SCRIPTS/indesign/";

var myRunScript = function(scriptFile, scriptFolder) {
  var myScript = File(scriptFolder + scriptFile);
  if (myScript.exists) {
    app.doScript(myScript);
  }
};

myRunScript(scriptFile, scriptFolder);

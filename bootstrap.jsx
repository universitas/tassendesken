// Bootstrap script for Indesign 
// kjør install.jsx som admin for å installere

// på windows/CS5.5 Skal ligge i mappa
// C:\Program Files (x86)\Adobe\Adobe InDesign CS5.5\Scripts\startup scripts\
// på windows/CS6 Skal ligge i mappa
// C:\Program Files (x86)\Common Files\Adobe\Startup Scripts CS6\Adobe InDesign\
// på windows/CC skal ligge i mappe
// C:\Program Files (x86)\Common Files\Adobe\Startup Scripts CC\Adobe InDesign\

var SCRIPTDIR = '%SCRIPTDIR%'  // will be replaced by install script

function main() {
  var appName = getAppName()
  if (!appName) return;
  var scriptFile = new File(SCRIPTDIR + '/startup_scripts/startopp_' + appName + '.jsx')
  if (!scriptFile.exists) return;
  $.evalFile(scriptFile)
}

function getAppName() {
  if (BridgeTalk.appSpecifier.match('indesign')) {
    // Kjører dette skriptet hvis det er InDesign som åpnes,
    // men bare i #engine = "main"
    return ($.engineName == 'main') ? 'indesign' : null
  } else return BridgeTalk.appName
}

main()
// vi: ft=javascript

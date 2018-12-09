// Bootstrap script for Indesign
// på mac/CS5.5 Skal ligge i mappa
// /Library/Applicaton Support/Adobe/Startup Scripts CS5.5/Adobe Indesign/
// på windows/CS5.5 Skal ligge i mappa
// C:\Program Files (x86)\Adobe\Adobe InDesign CS5.5\Scripts\startup scripts\
// på windows/CS6 Skal ligge i mappa
// C:\Program Files (x86)\Common Files\Adobe\Startup Scripts CS6\Adobe InDesign\

var MAC_MOUNTED_DRIVE = '/univ-desken/'
var SERVERNAME = '//kant.uio.no/div-universitas-desken/'
var SCRIPTFOLDER = 'SCRIPTS/startup_scripts/'

function main() {
  var appName = getAppName()
  if (!appName) return
  if ($.os.match('Macintosh')) {
    mount_desken_osx(MAC_MOUNTED_DRIVE, SERVERNAME)
    SERVERNAME = MAC_MOUNTED_DRIVE
  }
  var scriptfile = SERVERNAME + SCRIPTFOLDER + 'startopp_' + appName + '.jsx'
  eval_remote_script(scriptfile)
}

function getAppName() {
  if (BridgeTalk.appSpecifier.match('indesign')) {
    // Kjører dette skriptet hvis det er InDesign som åpnes,
    // men bare i #engine = "main"
    if ($.engineName == 'main') return 'indesign'
    else return null
  } else return BridgeTalk.appName
}

function eval_remote_script(scriptPath) {
  // to run a script that exists on a mounted drive we have to use
  // ExtendScript's $.evalFile() method.
  var scriptFile = File(scriptPath)
  if (scriptFile.exists) $.evalFile(scriptFile)
}

function mount_desken_osx(localpath, remotepath) {
  // denne funker bare for mac - lag ny for windows om nødvendig.
  if (!Folder(localpath).exists) {
    var mountedpath = '/Volumes/' + localpath
    var cmd = [
      'mkdir -p',
      mountedpath,
      '&&',
      'mount -t smbfs',
      remotepath,
      mountedpath
    ].join(' ')
    app.doScript(
      'do shell script "' + cmd + '"',
      ScriptLanguage.APPLESCRIPT_LANGUAGE
    )
  }
}

main()
// vi: ft=javascript

// Startopp-skript for universitas.
// På mac/CS3 Skal ligge i mappa /Library/Application Support/Adobe/Startup Scripts CS3/Adobe Indesign/
// på mac/CS5.5 Skal ligge i mappa /Library/Applicaton Support/Adobe/Startup Scripts CS5.5/Adobe Indesign/
// på windows/CS5.5 Skal ligge i mappa C:\Program Files (x86)\Adobe\Adobe InDesign CS5.5\Scripts\startup scripts\
// på windows/CS6 Skal ligge i mappa C:\Program Files (x86)\Common Files\Adobe\Startup Scripts CS6\Adobe InDesign\
// på windows/CS6 Skal ligge i mappa C:\Program Files (x86)\Common Files\Adobe\Startup Scripts CS6\Adobe Photoshop\

// Laget av Håken Lid februar 2010 for Adobe CS3 - må antageligvis oppdateres for nyere versjon av Adobepakka

function main(){
  var SERVERNAME = '//kant.uio.no/div-universitas-desken/';
  var SCRIPTFOLDER = 'SCRIPTS/startup_scripts/';
  var MAC_MOUNTED_DRIVE = '/univ-desken/';

  var scriptfile, appname;

  if ($.os.match("Macintosh")){
    mount_desken_osx(MAC_MOUNTED_DRIVE, SERVERNAME);
    SERVERNAME = MAC_MOUNTED_DRIVE;
  }

  appname = get_app_name();
  if (appname) {
    scriptfile = SERVERNAME + SCRIPTFOLDER + 'startopp_' + appname + '.jsx';
    success = eval_remote_script(scriptfile);
    // alert(scriptfile + " ran: " +success, "STARTUP SCRIPT");
  }
}

function get_app_name(){
  var appname;

  if( BridgeTalk.appSpecifier.match("indesign") ){
    if ($.engineName=="main") {
      // Kjører dette skriptet hvis det er InDesign som åpnes, men bare i #engine = "main"
      // (inDesign starter to andre engines ved oppstart)
      appname = 'indesign';
    } else {
      // feil engine, ingen starupskript
      appname = null;
    }
  } else {
    appname = BridgeTalk.appName;
  }
  return appname;
}

function eval_remote_script(scriptPath){
  // to run a script that exists on a mounted drive we have to use ExtendScript's $.evalFile() method.
  // warning: "eval is evil"
  var scriptFile = File(scriptPath);
  if (scriptFile.exists){
    $.evalFile(scriptFile);
    return true;
  } else {
    return false;
  }
}

function mount_desken_osx(localpath, remotepath){
// denne funker bare for mac - lag ny for windows om nødvendig.
  if ( ! Folder(localpath).exists ){
    mountedpath = '/Volumes/' + localpath;
    app.doScript(
      'do shell script "mkdir '+ mountedpath + '"' + '\r' +
      'do shell script "mount -t smbfs ' + remotepath + ' ' +mountedpath + '"',
      ScriptLanguage.APPLESCRIPT_LANGUAGE
    );
  }
}

main();
// Startopp-skript for universitas. 
// På mac/CS3 Skal ligge i mappa /Library/Application Support/Adobe/Startup Scripts CS3/Adobe Indesign/
// på mac/CS5.5 Skal ligge i mappa /Library/Applicaton Support/Adobe/Startup Scripts CS5.5/Adobe Indesign/
// på windows/CS5.5 Skal ligge i mappa C:\Program Files (x86)\Adobe\Adobe InDesign CS5.5\Scripts\startup scripts\
// på windows/CS6 Skal ligge i mappa C:\Program Files (x86)\Common Files\Adobe\Startup Scripts CS6\Adobe InDesign\

// Laget av Håken Lid februar 2010 for Adobe CS3 - må antageligvis oppdateres for nyere versjon av Adobepakka

var main = function(){    
    if ($.os.match("Macintosh")){
        startup_mac();
    } else {
        startup_windows();
    }
}

var startup_mac = function(){
    if( BridgeTalk.appSpecifier == "indesign-7.5"&&$.engineName=="main") { // Kjører dette skriptet hvis det er InDesign som åpnes, men bare i #engine = "main" (inDesign starter to andre engines ved oppstart)
        if (!Folder("/univ-desken/").exists){
            mountDesken();
        }
        doMyScript("/univ-desken/UTTEGNER/SCRIPTS_CS55/OPPDATER/startopp_indesign.jsx");
    }

    if( BridgeTalk.appSpecifier == "indesign-7.5"&&$.engineName=="main") { // Kjører dette skriptet hvis det er InDesign som åpnes, men bare i #engine = "main" (inDesign starter to andre engines ved oppstart)
        doMyScript("/univ-desken/UTTEGNER/SCRIPTS_CS55/OPPDATER/startopp_indesign_CS5_5.jsx");
    }

    if( BridgeTalk.appName == "photoshop" ) { // Kjører dette skriptet hvis det er PhotoShop som åpnes
        doMyScript("/univ-desken/UTTEGNER/SCRIPTS_CS55/OPPDATER/startopp_photoshop.jsx");
    }

    if( BridgeTalk.appName == "bridge" ) { // Kjører dette skriptet hvis det er Bridge som åpnes
        doMyScript("/univ-desken/UTTEGNER/SCRIPTS_CS55/OPPDATER/startopp_bridge.jsx");
    }

    if( BridgeTalk.appName == "illustrator" ) { // Kjører dette skriptet hvis det er Bridge som åpnes
        doMyScript("/univ-desken/UTTEGNER/SCRIPTS_CS55/OPPDATER/startopp_illustrator.jsx");
    }

    if( BridgeTalk.appName == "incopy" ) { // Kjører dette skriptet hvis det er InCopy som åpnes
        doMyScript("/univ-desken/UTTEGNER/SCRIPTS_CS55/OPPDATER/startopp_incopy.jsx");
    }

    function doMyScript(scriptpath){
        var myScript = File(scriptpath);
        if (myScript.exists){
            $.evalFile(myScript);
            return true;
        } else {
            return false;
        }
    }
    function mountDesken(){
        app.doScript('do shell script "mkdir /Volumes/univ-desken" \r do shell script "mount -t smbfs //platon.uio.no/univ-desken /Volumes/univ-desken"', ScriptLanguage.APPLESCRIPT_LANGUAGE);
    }
}

startup_windows = function(){
  
    if( BridgeTalk.appSpecifier.match("indesign")&&$.engineName=="main") { // Kjører dette skriptet hvis det er InDesign som åpnes, men bare i #engine = "main" (inDesign starter to andre engines ved oppstart)
        doMyScript("//platon/univ-desken/UTTEGNER/SCRIPTS_CS55/OPPDATER/startopp_indesign_CS5_5.jsx");
    }

    if( BridgeTalk.appName == "photoshop" ) { // Kjører dette skriptet hvis det er Photoshop som åpnes
        doMyScript("//platon/univ-desken/UTTEGNER/SCRIPTS_CS55/OPPDATER/startopp_photoshop.jsx");
    }

    if( BridgeTalk.appName == "bridge" ) { // Kjører dette skriptet hvis det er Bridge som åpnes
        doMyScript("//platon/univ-desken/UTTEGNER/SCRIPTS_CS55/OPPDATER/startopp_bridge.jsx");
    }

    if( BridgeTalk.appName == "illustrator" ) { // Kjører dette skriptet hvis det er Bridge som åpnes
        doMyScript("//platon/univ-desken/UTTEGNER/SCRIPTS_CS55/OPPDATER/startopp_illustrator.jsx");
    }

    if( BridgeTalk.appName == "incopy" ) { // Kjører dette skriptet hvis det er InCopy som åpnes
        doMyScript("//platon/univ-desken/UTTEGNER/SCRIPTS_CS55/OPPDATER/startopp_incopy.jsx");
    }

    function doMyScript(scriptpath){
        var myScript = File(scriptpath);
        if (myScript.exists){
            $.evalFile(myScript);
            return true;
        } else {
            return false;
        }
    }
    function mountDesken(){ // denne funker bare for mac - lag ny for windows om nødvendig.
        app.doScript('do shell script "mkdir /Volumes/univ-desken" \r do shell script "mount -t smbfs //platon.uio.no/univ-desken /Volumes/univ-desken"', ScriptLanguage.APPLESCRIPT_LANGUAGE);
    }
}

main();
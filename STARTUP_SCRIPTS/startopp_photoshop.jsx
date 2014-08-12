try {
    app.colorSettings = "universitas";
} catch (myError) {}

function copyFiles(localFolder, serverFolder, fileName) {
    // kopierer filer fra et sted (univ-desken) til et annet (brukerens område på den lokale maskina)
    if (!serverFolder.exists) {
        throw "er ikke koblet til univ-desken";
    }
    if (!localFolder.exists) {
        localFolder.create();
    }
    var myScripts = serverFolder.getFiles(fileName);
    for (var j = 0; myScripts.length > j; j++) {
        var myFile = myScripts[j];
        var target = new File(localFolder + "/" + myFile.name);
        if ((!target.exists || (target.exists && target.length != myFile.length)) && myFile.name.substr(0, 2) != "._") {
            var funker = myFile.copy(target);
        }
    }
}

if (parseInt(app.version) == 10) {
    // CS 3 på mac
    try {
        copyFiles(
            Folder("~/Library/Preferences/Adobe%20Photoshop%20CS3%20Settings/"),
            Folder("/univ-desken/UTTEGNER/SCRIPTS/OPPDATER/STARTUP_PHOTOSHOP/"), "*.psp");
        //photoshop keyboard shortcuts  OBS: målmappa må være skrivbar!
        copyFiles(
            Folder("/Applications/Adobe%20Photoshop%20CS3/Presets/Scripts/"),
            Folder("/univ-desken/UTTEGNER/SCRIPTS/OPPDATER/STARTUP_PHOTOSHOP/"), "*.jsx");
        //scriptfiler til photoshop OBS: målmappa må være skrivbar!
        copyFiles(
            Folder("/Applications/Adobe%20Photoshop%20CS3/Presets/Scripts/"),
            Folder("/univ-desken/UTTEGNER/SCRIPTS/"), "artikkeltyper.jsxinc");
        // en include
        copyFiles(
            Folder("/Applications/Adobe%20Photoshop%20CS3/Presets/Scripts/"),
            Folder("/univ-desken/UTTEGNER/SCRIPTS/"), "prodsys.jsxinc");
        // en include
    } catch (e) {
        alert(e);
    }
} else if (app.version == "12.1.0" && $.os.match("Macintosh")) {
    // CS 5 på mac
    try {
        copyFiles(
            Folder("~/Library/Preferences/Adobe%20Photoshop%20CS5.1%20Settings/"),
            Folder("/univ-desken/UTTEGNER/SCRIPTS/OPPDATER/STARTUP_PHOTOSHOP/"), "*.psp");
        //photoshop keyboard shortcuts  OBS: målmappa må være skrivbar!
        copyFiles(
            Folder("/Applications/Adobe%20Photoshop%20CS5.1/Presets/Scripts/"),
            Folder("/univ-desken/UTTEGNER/SCRIPTS/OPPDATER/STARTUP_PHOTOSHOP/"), "*.jsx");
        //scriptfiler til photoshop OBS: målmappa må være skrivbar!
        copyFiles(
            Folder("/Applications/Adobe%20Photoshop%20CS5.1/Presets/Scripts/"),
            Folder("/univ-desken/UTTEGNER/SCRIPTS/"), "artikkeltyper.jsxinc");
        // en include
        copyFiles(
            Folder("/Applications/Adobe%20Photoshop%20CS5.1/Presets/Scripts/"),
            Folder("/univ-desken/UTTEGNER/SCRIPTS/"), "prodsys.jsxinc");
        // en include
    } catch (e) {
        alert(e);
    }
} else if ($.os.match("Windows")) {
    // CS 5.5 eller senere på windows
    try {
        var localScriptfolder = Folder(app.path + "/Presets/Scripts");
        var localPreferencesfolder = app.preferencesFolder;

        copyFiles(
            //photoshop keyboard shortcuts  OBS: målmappa må være skrivbar!
            localPreferencesfolder,
            Folder("//platon/univ-desken/UTTEGNER/SCRIPTS_CS55/OPPDATER/STARTUP_PHOTOSHOP/"),
            "*.psp"
        );

        copyFiles(
            //scriptfiler til photoshop OBS: målmappa må være skrivbar!
            localScriptfolder,
            Folder("//platon/univ-desken/UTTEGNER/SCRIPTS_CS55/OPPDATER/STARTUP_PHOTOSHOP/"),
            "*.jsx"
        );

        copyFiles(
            // en include
            localScriptfolder,
            Folder("//platon/univ-desken/UTTEGNER/SCRIPTS_CS55/"),
            "artikkeltyper.jsxinc"
        );

        copyFiles(
            // en include
            localScriptfolder,
            Folder("//platon/univ-desken/UTTEGNER/SCRIPTS_CS55/"),
            "prodsys.jsxinc"
        );
    } catch (e) {
        alert(e);
    }
}

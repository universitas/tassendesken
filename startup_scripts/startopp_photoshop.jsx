try {
  app.colorSettings = 'universitas'
} catch (myError) {}

function copyFiles(localFolder, serverFolder, fileName) {
  // kopierer filer fra et sted (univ-desken) til et annet (brukerens område på den lokale maskina)
  if (!serverFolder.exists) {
    throw 'er ikke koblet til univ-desken'
  }
  if (!localFolder.exists) {
    localFolder.create()
  }
  var myScripts = serverFolder.getFiles(fileName)
  for (var j = 0; myScripts.length > j; j++) {
    var myFile = myScripts[j]
    var target = new File(localFolder + '/' + myFile.name)
    if (
      (!target.exists || (target.exists && target.length != myFile.length)) &&
      myFile.name.substr(0, 2) != '._'
    ) {
      var funker = myFile.copy(target)
      if (!funker) {
        //$.writeln('Ble ikke kopiert' + funker + target)
      } else {
        //$.writeln('Ble kopiert' + funker + target)
      }
    } else {
      //$.writeln('' + target + ' unendret')
    }
  }
}

if ($.os.match('Windows')) {
  try {
    var localScriptfolder = Folder(app.path + '/Presets/Scripts')
    var localPreferencesfolder = app.preferencesFolder
    var SERVER = '//kant.uio.no/div-universitas-desken/'

    copyFiles(
      //photoshop keyboard shortcuts  OBS: målmappa må være skrivbar!
      localPreferencesfolder,
      Folder(SERVER + 'SCRIPTS/copy_to_local/'),
      '*.psp'
    )

    copyFiles(
      //scriptfiler til photoshop OBS: målmappa må være skrivbar!
      localScriptfolder,
      Folder(SERVER + 'SCRIPTS/copy_to_local/'),
      'local_save_image_for_universitas.jsx'
    )

    copyFiles(
      // en include
      localScriptfolder,
      Folder(SERVER + 'SCRIPTS/includes/'),
      '*.jsxinc'
    )
  } catch (e) {
    alert(e)
  }
}
// vi: ft=javascript

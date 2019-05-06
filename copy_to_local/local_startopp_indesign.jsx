#targetengine session
#includepath ../includes
#include utils.jsxinc

main()

function curry(fn, args) {
  // simple function currying
  // ((a,b,c,...) -> d) -> a -> b -> c -> ... -> d
  var boundArgs = args || []
  return function() {
    var args = concat(boundArgs, arguments)
    if (args.length < fn.length) return curry(fn, args)
    else return fn.apply(this, args)
  }
}

function main() {
  var scripts_dir = 'SCRIPTS/indesign/'
  var menu_items = [
    // skript som skal ha egne menyvalg
    ['Importer fra prodsys', 'import.jsx'],
    ['Opprett ny avis', 'mekksider.jsx'],
    ['Eksporter til PDF og prodsys', 'eksportSider.jsx'],
    ['Endre sidetall og filnavn', 'endreSidetall.jsx'],
    ['Lag saksmal', 'lagMal.jsx'],
    ['Lag spaltestreker', 'spaltestreker.jsx']
  ]

  if ($.os.match('Macintosh')) {
    var server = '/univ-desken/'
    var desktop = Folder('~/Desktop/')
  } else {
    // Windows
    var server = '//kant.uio.no/div-universitas-desken/'
    if (!server.exists) {
      server = '/c/Shared/tassendesken/'
      scripts_dir = 'indesign/'
    }
    var desktop = Folder(Folder.desktop)
  }
  add_indesign_menu('Universitas', server + scripts_dir, menu_items)
  open_indesign_libraries(desktop)
}

function make_event_handler(name, file) {
  return tryLogErrors(function() {
    app.doScript(file)
  }, true)
}

function add_indesign_menu(menu_name, script_path, menu_items) {
  // lager en meny i Indesign for egne skripts

  var existing_menu = app.menus.item('$ID/Main').submenus.item(menu_name)
  if (existing_menu.isValid) existing_menu.remove() // sletter menyen og fjerner det som måtte være der fra før av
  var new_menu = app.menus.item('$ID/Main').submenus.add(menu_name)

  for (var n = 0; n < menu_items.length; n++) {
    var item_name = menu_items[n][0]
    var script_file = File(script_path + menu_items[n][1])
    if (!script_file.exists) {
      throw new Error('The file ' + script_file + ' was not found')
    }
    var event_handler = make_event_handler(item_name, script_file)
    var menu_item = app.scriptMenuActions.add(item_name)
    menu_item.addEventListener('onInvoke', event_handler)
    new_menu.menuItems.add(menu_item)
  }

  function show_item_when(item_name, script_file, my_menu, condition) {
    // sjekker filnavn hver gang menuen åpnes og legger til et element hvis fila heter 'saksmaler'
    // var myMenuItem = ['Saksmaler -> Bibliotek og MAL_AVIS','legg_Saksmaler_i_Bibliotek.jsx'];
    var func = function() {
      var myItem = my_menu.menuItems.itemByName(item_name)
      if (myItem.isValid) myItem.remove()
      myItem = app.scriptMenuActions.add(item_name)
      myItem.addEventListener('onInvoke', script_file)
      if (condition()) new_menu.menuItems.add(myItem)
    }
    return func
  }

  function check_file_open(regex) {
    return function() {
      return app.documents.length && app.activeDocument.name.match(regex)
    }
  }

  var aktiver_greia = show_item_when(
    'Saksmaler -> Bibliotek og Mal',
    File(script_path + 'legg_Saksmaler_i_Bibliotek.jsx'),
    new_menu,
    check_file_open(/saksmaler/i)
  )

  var myDokListener = new_menu.addEventListener(
    'beforeDisplay',
    aktiver_greia,
    false
  )
  aktiver_greia()
}

function open_indesign_libraries(folder) {
  // åpner alle libraries på desktoppen
  app.scriptPreferences.userInteractionLevel =
    UserInteractionLevels.NEVER_INTERACT
  app.open(folder.getFiles('*.indl'))
  app.scriptPreferences.userInteractionLevel =
    UserInteractionLevels.INTERACT_WITH_ALL
}
// vi: ft=javascript

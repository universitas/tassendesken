#targetengine 'session'

function main(){
  var new_scripts_folder = 'SCRIPTS/INDESIGN_SCRIPTS/';
  var old_scripts_folder = 'UTTEGNER/SCRIPTS_CS55/';
  var server = '//kant.uio.no/div-universitas-desken/';
  var desktop;

  var menu_items = [ // skript som skal ha egne menyvalg
        ['Importer fra prodsys', 'import.jsx'],
        ['Opprett ny avis', 'mekksider.jsx'],
        ['Eksporter til PDF og prodsys', 'eksportSider.jsx'],
        ['Endre sidetall og filnavn', 'endreSidetall.jsx'],
        ['Lag saksmal','lagMal.jsx'],
        ['Lag spaltestreker','spaltestreker.jsx'],
  ];

  if ($.os.match('Macintosh')){
      server = '/univ-desken/';
      desktop = Folder('~/Desktop/');
  } else { // Windows
      desktop = Folder(Folder.desktop);
  }

  add_indesign_menu('Universitas', menu_items, server + new_scripts_folder );
  open_indesign_libraries(desktop);
}

function add_indesign_menu(menu_name, script_path, menu_items){ // lager en meny i Indesign for egne skripts
  var new_menu_item;
  var existing_menu = app.menus.item('$ID/Main').submenus.item(menu_name);

  if (existing_menu){
    existing_menu.remove(); // sletter menyen og fjerner det som måtte være der fra før av
  }

  var new_menu = app.menus.item('$ID/Main').submenus.add(menu_name);

  for (var n = 0; n < menu_items.length; n++){
    new_menu_item = app.scriptMenuActions.add(menu_items[n][0]);
    new_menu_item.addEventListener ('onInvoke', File(scriptpath+menu_items[n][1]));
    new_menu.menuItems.add(new_menu_item);
  }

  var aktiverMenyItem = function(){
    // sjekker filnavn hver gang menuen åpnes og legger til et element hvis fila heter 'saksmaler'
    var myMenuItem = ['Saksmaler -> Bibliotek og MAL_AVIS','legg_Saksmaler_i_Bibliotek.jsx'];
    var myItem = new_menu.menuItems.itemByName (myMenuItem[0]);
    if (myItem){
      myItem.remove();
    }
    new_menu_item = app.scriptMenuActions.add(myMenuItem[0]);
    new_menu_item.addEventListener ('onInvoke', File(scriptpath+myMenuItem[1]));
    if (app.documents.length > 0&&app.activeDocument.name.match(/saksmaler/i)){
      new_menu.menuItems.add(new_menu_item);
    }
  };
  var myDokListener = new_menu.addEventListener('beforeDisplay', aktiverMenyItem, false);
}

function open_indesign_libraries(folder){
  // åpner alle libraries på desktoppen
  var myLibraries = folder.getFiles('*.indl');
  for (var i=0; i<myLibraries.length; i++){
    app.open(myLibraries[i]);
  }
}
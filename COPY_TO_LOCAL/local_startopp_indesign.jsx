#targetengine 'session'

main();

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

  add_indesign_menu(
    'Universitas', 
    server + old_scripts_folder,
    menu_items
    );
    
  add_indesign_menu(
    'Universitas ny', 
    server + new_scripts_folder,
    menu_items
    );
  open_indesign_libraries(desktop);
}

function add_indesign_menu(menu_name, script_path, menu_items){ // lager en meny i Indesign for egne skripts
  var new_menu_item;
  var existing_menu = app.menus.item('$ID/Main').submenus.item(menu_name);

  if (existing_menu.isValid){
    existing_menu.remove(); // sletter menyen og fjerner det som måtte være der fra før av
  }

  var new_menu = app.menus.item('$ID/Main').submenus.add(menu_name);

  for (var n = 0; n < menu_items.length; n++){
    var item_name = menu_items[n][0]
    var item_script = File(script_path+menu_items[n][1])
    var new_menu_item = app.scriptMenuActions.add(item_name);
    new_menu_item.addEventListener ('onInvoke', item_script);
    new_menu.menuItems.add(new_menu_item);
  }

  function show_item_when(item_name, script_file, my_menu, test_something){
    // sjekker filnavn hver gang menuen åpnes og legger til et element hvis fila heter 'saksmaler'
    // var myMenuItem = ['Saksmaler -> Bibliotek og MAL_AVIS','legg_Saksmaler_i_Bibliotek.jsx'];
    var func = function(){
      var myItem = my_menu.menuItems.itemByName (item_name);
      if (myItem.isValid){
        myItem.remove();
      }
      new_menu_item = app.scriptMenuActions.add(item_name);
      new_menu_item.addEventListener ('onInvoke', script_file);
      if (test_something()){
        new_menu.menuItems.add(new_menu_item);
      }
    }
    return func;
  };
  
  function check_file_open(regex){
    return function() {
      var file_is_open = ( app.documents.length > 0 && app.activeDocument.name.match(regex ) );
      return file_is_open;
    }
  }

  var aktiver_greia = show_item_when(
    'Saksmaler -> Bibliotek og Mal', 
    File(script_path+'legg_Saksmaler_i_Bibliotek.jsx'),
    new_menu,
    check_file_open(/saksmaler/i)
    )

  var myDokListener = new_menu.addEventListener('beforeDisplay', aktiver_greia, false);
  aktiver_greia();
}

function open_indesign_libraries(folder){
  // åpner alle libraries på desktoppen
  var myLibraries = folder.getFiles('*.indl');
  for (var i=0; i<myLibraries.length; i++){
    app.open(myLibraries[i]);
  }
}

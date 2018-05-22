#target 'indesign'
#targetengine 'session'

function make_event_handler(name, file) {
  if (!file.exists) throw new Error("file " + file + " does not exist");
  return function() {
    app.doScript(
      file,
      ScriptLanguage.JAVASCRIPT,
      [],
      UndoModes.FAST_ENTIRE_SCRIPT,
      name
    );
  };
}

var handler = make_event_handler(
  "Importer fra prodsys",
  File("../indesign/import.jsx")
);

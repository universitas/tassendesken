#target "indesign";

var findAllElements = function() {
  var group = app.selection[0];
  var skjema = {
    pictures: [],
    stories: [],
    styles: {}
  }; 
  var textFrames = group.textFrames.everyItem();
  var tables = textFrames.tables.everyItem().getElements();
  skjema.stories = textFrames.parentStory;
  for (var i = 0; i < group.allPageItems.length; i++) {
    var pageItem = group.allPageItems[i];
    if (pageItem.contentType === ContentType.GRAPHIC_TYPE) 
      skjema.pictures.push(pageItem);
  }
  for (var i=0; i < tables.length; i++) {
    try {
      var table = tables[i];
      if (/bylineboks/.test(table.appliedTableStyle.name)) 
        table.remove();
    } catch(e) {
      $.writeln(e)
    }
  }
  group.ungroup();
  return skjema;
}

findAllElements();

function findTables(group) {
  var stories = group.textFrames.everyItem()
  var tables = stories.tables.everyItem().getElements();
  for (var t=0; t<tables.length; t++) {
    try {
      var tb = tables[t];
      $.writeln(tb.id);
    } catch(e) {$.writeln(e)}
  }
}

findTables(app.selection[0])
//~ app.doScript(
//~   func,
//~   ScriptLanguage.JAVASCRIPT,
//~   [],
//~   UndoModes.ENTIRE_SCRIPT,
//~   'doscript',
//~ );
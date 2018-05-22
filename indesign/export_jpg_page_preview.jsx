/* jshint ignore:start */
#target "indesign"
#targetengine "session"
#include ../_includes/index.jsxinc
/* jshint ignore:end */

function export_all_pages(event) {
  var doc = event.target;
  if (!(doc.constructor.name == "Document" && doc.name.match(/UNI.*.indd/))) {
    return;
  }
  var expPrefs = app.jpegExportPreferences;
  var directory = new Folder(doc.filePath.path + "/PREVIEW/");
  directory.exists || directory.create();
  expPrefs.jpegQuality = JPEGOptionsQuality.MEDIUM;
  expPrefs.exportResolution = 150;
  var page, file, filename;
  for (var i = 0; i < doc.pages.length; i++) {
    page = doc.pages[i];
    filename = "page_" + page.name + ".jpg";
    file = new File(directory.fsName + "/" + filename);
    expPrefs.pageString = page.name;
    // doc.asynchronousExportFile (ExportFormat.JPG, file);
    doc.exportFile(ExportFormat.JPG, file);
  }
}

app.addEventListener("afterSave", export_all_pages);

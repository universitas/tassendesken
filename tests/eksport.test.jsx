/* jshint ignore:start */
#target "indesign"
#targetengine "session"
#includepath "../_includes/"
#include "prodsys.jsxinc"
#include "dokTools.jsxinc"
#include "eksport.jsxinc"
/* jshint ignore:end */

config.DEBUG = true;
http.use_mock = function(request) {
  return request.match(/^GET/) ? false : true;
};
try {
  var dok = app.activeDocument;
} catch (e) {
  log("ERROR " + e.message);
  exit();
}
eksportTilProdsys(dok);

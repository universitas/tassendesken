/* jshint ignore:start */
#include ../_includes/dokTools.jsxinc
#include ../_includes/dokTools.jsxinc
#include ../_includes/eksport.jsxinc
#include ../_includes/eksport.jsxinc
#include ../_includes/prodsys.jsxinc
#include ../_includes/prodsys.jsxinc
#target "indesign"
#target "indesign"
#targetengine "session"
#targetengine "session"
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

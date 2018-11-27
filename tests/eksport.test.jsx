#include "test_runner.jsxinc";
#include "prodsys.jsxinc"
#include "dokTools.jsxinc"
#include "eksport.jsxinc"
#include "dokTools.jsxinc";

config.DEBUG = true
http.use_mock = function(request) {
  return request.match(/^GET/) ? false : true
}
try {
  var dok = app.activeDocument
} catch (e) {
  log('ERROR ' + e.message)
  exit()
}
eksportTilProdsys(dok)
// vi: ft=javascript

#includepath "../_includes/"
#include "test_runner.jsxinc";
#include "importpanel.jsxinc";
#include "prodsys.jsxinc";

function onImportClick(aktivSak, artikkeltype, importImages) {
  log(aktivSak)
}

config.DEBUG = true
importPanel(onImportClick)
//~ for (var n = 10; n < 200 ; n += 80) {
//~   response = prodsys.get(null, {limit: n});
//~   log(response.status);
//~   log(response.error ? response.error.message : response.json.results.length);
//~   log(response.body.length);
//~ }
// vi: ft=javascript

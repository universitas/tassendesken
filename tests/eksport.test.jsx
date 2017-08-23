/* jshint ignore:start */
#include ../_includes/dokTools.jsxinc
#include ../_includes/eksport.jsxinc
#include ../_includes/prodsys.jsxinc
#targetengine "session"
/* jshint ignore:end */


  config.DEBUG = true;
  var dok = app.activeDocument;
  eksportTilProdsys(dok);

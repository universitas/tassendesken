/* jshint ignore:start */
#include "../_includes/importpanel.jsxinc"; // brukergrensesnittet
#include "../_includes/prodsys.jsxinc";
/* jshint ignore:end */

/**
* @@@BUILDINFO@@@ importPanel.test.jsx !Version! Tue Aug 22 2017 00:28:24 GMT+0200
*/
var pks = [60641, 60677, 60706, 60710, 60693, 60740, 60736,
  60734, 60733, 60722, 60956, 60999, 61075, 61080, 61163, 61316, 61630, 61636, 61640,
  61645, 61631, 61675, 61731, 61732, 61770, 61828, 61839, 61789, 61949, 62009, 62012, 
  62011, 62056, 62057, 62072, 62073, 62099, 62119,
  62166, 62175, 62196, 62200, 62224, 59771, 62299, 62312, 62316, 62321, 62322, 62323]

config.DEBUG = true

for (var i = 0; i <= pks.length; i++) {
   log(pks[i]);
}


function onImportClick(aktivSak, artikkeltype, importImages) {
   log(aktivSak);
}

// importPanel(onImportClick)
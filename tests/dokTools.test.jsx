// vim: set ft=javascript:

#includepath "../_includes";
#include "index.jsxinc"; // diverse konfigurasjonsverdier
#include "dokTools.jsxinc";

testRunner();

function test_find_file() {
  var filename =  'dokTools.test.jsx';
  var cwd = File($.fileName).parent
  var file = dokTools.finnFil(cwd, filename);
  assert(file, 'file ' + filename + ' does not exist');
}

function test_find_nyhet_img() {
  var filename =  '10-NYH-NighthawkDiner-JY-05.47532.jpg';
  var cwd = Folder(config.rotMappe + '/' + 16 + '/Nyheter')
  var file = dokTools.finnFil(cwd, filename);
  assert(file, 'file ' + filename + ' does not exist in ' + cwd.fullName);  
}

function utgave() {
  // Finner kommende utgave av avisa ved å lete etter mappe med høyest tall.
  var path = config.rotMappe; // TODO fjern hardkoding
  var num;
  var cwd;
  for (i = 50; i > 0; i--) {
    if (i < 10) {
      num = "0" + i;
    } else {
      num = i;
    }
    cwd = Folder(path + num);
    if (cwd.exists) {
      return cwd; // har funnet riktig utgave
    }
  }
}
#includepath "../includes/"
#include "test_runner.jsxinc"
#include "artikkeltyper.jsxinc"

main()

function main() {
  config.DEBUG = true
  $.level = 2
  try {
    test_story_types()
    // test_http_methods();
  } catch (e) {
    log(e)
  }
}

function assert(bool, msg) {
  if (!bool) throw new Error('ASSERTION ERROR: ' + (msg || 'no message'))
}

function test_story_types() {
  log(artikkeltyper, 'storytypes.json')
}

function test_story_types() {
  var storytypes = dokTools.parseCSV(config.importCSV) // lager en array fra importfila
  assert(storytypes.length == 40, 'should have correct length')
}
// vi: ft=javascript

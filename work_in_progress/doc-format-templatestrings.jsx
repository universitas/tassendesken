#script "document format templatestrings"
#target "indesign"
#targetengine "session"
#include "../_includes/index.jsxinc"

// findTemplateStrings(app.activeDocument)

var utgaveData = {
  utg: { nr: '15', åg: '80', dato: 'onsdag 23. oktober 1970' },
  universitas: {
    addresse: 'universitas addresse',
    post: 'universitas post',
    epost: 'universitas epost',
    url: 'universitas url'
  },
  dl: {
    navn: 'Daglig Ledersen',
    epost: 'dl@universitas.no',
    tlf: '999 11 999'
  },
  aa: {
    navn: 'Annonse Ansvarligsen',
    epost: 'aa@universitas.no',
    tlf: '999 12 999'
  },
  rd: { navn: 'Redak Tørsen', epost: 'rd@universitas.no', tlf: '999 13 999' },
  rl: {
    navn: 'Redaksjon Ledersen',
    epost: 'rl@universitas.no',
    tlf: '999 14 999'
  },
  fs: { navn: 'Foto Sjeferud', epost: 'fs@universitas.no', tlf: '999 15 999' },
  ds: {
    navn: 'Deskus Sjeferud',
    epost: 'ds@universitas.no',
    tlf: '999 16 999'
  },
  nr: {
    navn: 'Nyhets Redktørsen',
    epost: 'nr@universitas.no',
    tlf: '999 17 999'
  },
  dr: {
    navn: 'Debattus Redaktus',
    epost: 'dr@universitas.no',
    tlf: '999 18 999'
  },
  kr: {
    navn: 'Kultura Redaktora',
    epost: 'kr@universitas.no',
    tlf: '999 19 999'
  },
  fr: {
    navn: 'Feature Redaktora',
    epost: 'fr@universitas.no',
    tlf: '999 20 999'
  },
  ar: {
    navn: 'Anmelder Redaktorum',
    epost: 'ar@universitas.no',
    tlf: '999 21 999'
  }
}

//~ pp( app.changeGrepPreferences.properties)
//~ exit()
app.doScript(
  changeTemplateStrings,
  ScriptLanguage.JAVASCRIPT,
  [utgaveData],
  UndoModes.ENTIRE_SCRIPT,
  'change template strings'
)

function pp(obj) {
  var rv = {}
  for (var key in obj) {
    var val = uneval(obj[key])
    // $.writeln(key, ':', val)
    if (val.substr(0, 7) == 'resolve' || val == '' || val == '({})') continue;
    rv[key] = obj[key]
  }
  $.writeln('\n\n', JSON.stringify(rv, null, 2))
}

function findTemplateStrings(doc) {
  app.findGrepPreferences = NothingEnum.nothing
  app.changeGrepPreferences = NothingEnum.nothing
  app.findChangeGrepOptions.properties = {
    includeLockedStoriesForFind: false,
    includeLockedLayersForFind: false,
    includeHiddenLayers: true,
    includeMasterPages: true,
    includeFootnotes: false,
    kanaSensitive: true,
    widthSensitive: true
  }
  app.findGrepPreferences.properties = {
    findWhat: '\\{\\{[^{]*\\}\\}'
  }
  var results = doc.findGrep()
  // $.writeln(results[0].reflect.properties)
  var data = {}
  pipe(
    pluck('contents'),
    map(function(s) {
      return s.replace(/[{}\s]/g, '').split('.')
    }),
    map(assocPair(data))
  )(results)
  return uneval(data)
}

function assocPair(obj) {
  return function(pair) {
    if (!(pair[0] in obj)) obj[pair[0]] = {}
    obj[pair[0]][pair[1]] = pair[0] + ' ' + pair[1]
  }
}

function changeTemplateStrings(args) {
  var data = utgaveData
  var doc = app.activeDocument
  app.findGrepPreferences = NothingEnum.nothing
  app.changeGrepPreferences = NothingEnum.nothing
  app.findChangeGrepOptions.properties = {
    includeHiddenLayers: true,
    includeMasterPages: true
  }
  var flatData = flattenObj(data)
  for (var key in flatData) {
    var findWhat = '\\{\\{ *' + key + ' *\\}\\}'
    var changeTo = flatData[key]
    app.findGrepPreferences.findWhat = findWhat
    app.changeGrepPreferences.changeTo = changeTo
    var res = doc.changeGrep()
    // $.writeln(findWhat, '\n', changeTo, '\n', res, '\n')
  }
}

function flattenObj(obj, path, rv) {
  if (!path) path = ''
  if (!rv) rv = {}
  for (key in obj) {
    var val = obj[key]
    if (typeof val == 'object') flattenObj(val, path + key + '.', rv)
    else rv[path + key] = val
  }
  return rv
}

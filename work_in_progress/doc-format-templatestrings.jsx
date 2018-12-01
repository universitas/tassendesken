#script "document format templatestrings"
#target "indesign"
#targetengine "session"
#include "../_includes/index.jsxinc"

function findPlaceHolders(doc) {
  app.findChangeGrepOptions.properties = {
    includeHiddenLayers: true,
    includeMasterPages: true
  }
  app.findGrepPreferences.properties = {
    findWhat: '\\{\\{[^{]*\\}\\}'
  }
  return pipe(
    call('findGrep'),
    map(
      pipe(
        prop('contents'),
        toLower,
        replace(/[}{ ]/g, '')
      )
    ),
    uniq
  )(doc)
}

function resetSearch() {
  app.changeGrepPreferences = NothingEnum.nothing
  app.findGrepPreferences = NothingEnum.nothing
  app.findChangeGrepOptions = NothingEnum.nothing
}

function changeTemplateStrings(doc, data) {
  resetSearch()
  var keys = findPlaceHolders(doc)
  var notFound = []
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i]
    var value = dotProp(key)(data)
    if (value) {
      app.findGrepPreferences.findWhat = '(?i)\\{\\{ *' + key + ' *\\}\\}'
      app.changeGrepPreferences.changeTo = value
      var res = doc.changeGrep()
      log('changed ' + key + ' -> ' + value + ' ' + res, '$')
    } else notFound.push(key)
  }
  notFound.length && log('could not find: ' + join(', ')(notFound), '$')
  resetSearch()
}

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

app.doScript(
  function() {
    changeTemplateStrings(app.activeDocument, utgaveData)
  },
  ScriptLanguage.JAVASCRIPT,
  [],
  UndoModes.ENTIRE_SCRIPT,
  'change template strings'
)

function pp(obj) {
  // prettyprint
  if (has('properties')(obj)) obj = obj.properties
  var rv = {}
  for (var key in obj) {
    var val = uneval(obj[key])
    if (val.substr(0, 7) == 'resolve' || val == '' || val == '({})') continue;
    rv[key] = obj[key]
  }
  $.writeln('\n\n', JSON.stringify(rv, null, 2))
}

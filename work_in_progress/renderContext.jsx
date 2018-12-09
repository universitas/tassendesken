// #script "document format templatestrings"
// #target "indesign"
// #targetengine "session"
// #include "../includes/index.jsxinc"

function renderTemplate(doc, context) {
  app.scriptPreferences.enableRedraw = false
  var changeList = _buildChangeList(doc, context)
  app.doScript(
    _changePlaceHolders,
    ScriptLanguage.JAVASCRIPT,
    [doc, changeList],
    UndoModes.FAST_ENTIRE_SCRIPT,
    'change template strings'
  )
  _clearGrepSearchOptions()
}

function _buildChangeList(doc, context) {
  // (Document, {k: v|{k:v}}) -> [[k, v]]
  var keys = sort(ascending(indentity), _findPlaceHolders(doc))
  var values = map(flip(dotProp)(context))(keys)
  return zip(keys, values)
}

function _changePlaceHolders(doc, changeList) {
  // (Document, [[k, v]]) -> undefined
  // changes placeholder tags in indesing document based on change list
  _clearGrepSearchOptions()
  app.findChangeGrepOptions.properties = {
    includeHiddenLayers: true,
    includeMasterPages: true
  }
  for (var i = 0; i < changeList.length; i++) {
    var ch = changeList[i]
    app.findGrepPreferences.findWhat = '(?i)\\{\\{ *' + ch[0] + ' *\\}\\}'
    app.changeGrepPreferences.changeTo = '' + ch[1]
    app.changeGrep()
  }
}

function _findPlaceHolders(doc) {
  // Document -> [String]
  // find all placeholder tags in indesign document
  var PATTERN = '\\{\\{.*?\\}\\}' // example: {{ person.name }}
  _clearGrepSearchOptions()
  app.findChangeGrepOptions.properties = {
    includeHiddenLayers: true,
    includeMasterPages: true
  }
  app.findGrepPreferences.properties = { findWhat: PATTERN }
  var searchResults = doc.findGrep()
  return pipe(
    map(
      pipe(
        prop('contents'),
        toLower,
        replace(/[}{ ]/g, '')
      )
    ),
    uniq
  )(searchResults)
}

function _clearGrepSearchOptions() {
  // reset active grep search preferences and options to defaults
  app.findGrepPreferences = NothingEnum.nothing
  app.findChangeGrepOptions = NothingEnum.nothing
  app.changeGrepPreferences = NothingEnum.nothing
}

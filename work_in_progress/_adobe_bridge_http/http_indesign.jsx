#target indesign
#targetengine session

function script(fileName) {
  // return script file as string for bridgetalk
  var scriptFile = File(File($.fileName).parent + '/' + fileName)
  if (!scriptFile.exists)
    return 'File ' + scriptFile.fullName + ' does not exists'
  scriptFile.open()
  var content = scriptFile.read()
  scriptFile.close()
  return content
}

function get(url, callback) {
  // http get
  var bt = new BridgeTalk()
  bt.target = BridgeTalk.getSpecifier('bridge')
  s = script('bridge_http.jsx')
  s += '\nget("' + url + '")'
  bt.body = s
  bt.onResult = callback
  bt.onError = callback
  bt.send()
}

get('http://universitas.no/api/', function(ev) {
  $.writeln(ev.body)
})
// vi: ft=javascript

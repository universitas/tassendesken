#target bridge

function get(url, headers) {
  if (!ExternalObject.webaccesslib) {
    ExternalObject.webaccesslib = new ExternalObject('lib:webaccesslib')
  }
  var http = new HttpConnection(url)
  http.method = 'GET'
  http.mime = 'application/json'
  http.responseencoding = 'utf8'
  http.execute()
  return http.response
}

data = get('http://universitas.no/api/legacy/')
$.writeln(data.substr(0, 500))
// vi: ft=javascript

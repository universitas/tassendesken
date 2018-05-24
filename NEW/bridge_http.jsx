if (!ExternalObject.webaccesslib) {
  ExternalObject.webaccesslib = new ExternalObject("lib:webaccesslib");
}

function get(url, headers) {
  var http = new HttpConnection(url);
  http.method = "GET";
  http.mime = "application/json";
  http.responseencoding = "utf8";
  http.execute();
  return http.response;
}

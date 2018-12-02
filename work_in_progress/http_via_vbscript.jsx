#include "../_includes/index.jsxinc"

/*
oXMLHttpRequest.open(bstrMethod, bstrUrl, varAsync, bstrUser, bstrPassword);
Parameters
bstrMethod
The HTTP method used to open the connection, such as GET, POST, PUT, or
PROPFIND. For XMLHTTP, this parameter is not case-sensitive. The verbs TRACE
and TRACK are not allowed when IXMLHTTPRequest is hosted in the browser.

bstrUrl
The requested URL. This can be either an absolute URL, such as
"http://Myserver/Mypath/Myfile.asp", or a relative URL, such as
"../MyPath/MyFile.asp".

varAsync[optional]
A Boolean indicator of whether the call is asynchronous. The default is True
(the call returns immediately). If set to True, attach an onreadystatechange
property callback so that you can tell when the send call has completed.

bstrUser[optional]
The name of the user for authentication. If this parameter is Null ("") or
missing and the site requires authentication, the component displays a logon
window.

bstrPassword[optional]
The password for authentication. This parameter is ignored if the user
parameter is Null ("") or missing.
*/

// VBScript to use windows https library
VbHttpGet = """
method = arguments(0)
url = arguments(1)
user = arguments(2)
password = arguments(3)
payload = arguments(4)

Set Http = CreateObject("MSXML2.XMLHTTP")
Http.open method, url, FALSE, user, password
Http.setRequestHeader "User-Agent", "InDesign script"
Http.send payload
app.ScriptArgs.SetValue "response", Http.responseText
app.ScriptArgs.SetValue "status", ""&Http.status
app.ScriptArgs.SetValue "headers", Http.getAllResponseHeaders()
"""

app.doScript(VbHttpGet, ScriptLanguage.VISUAL_BASIC,
  ['GET', 'https://universitas.no/api/', '', '', 'aaa'])
response = app.scriptArgs.getValue('response')
status = app.scriptArgs.getValue('status')
headers = app.scriptArgs.getValue('headers')
$.writeln(headers)
$.writeln(status, ' ', response.length)

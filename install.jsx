#include ./includes/utils.jsxinc

function main() {
  // installs bootstrap script to proper directory
  // must be run by windows admin user.
  if (!BridgeTalk.appSpecifier.match('indesign')) {
    alert('Must run in InDesign')
    return
  }
  var BOOTSTRAP = 'bootstrap.jsx'
  var SERVER = File($.fileName).parent
  var source = File(SERVER + '/' + BOOTSTRAP)
  var VERSION = app_version()[0] > 10 ? 'CC' : 'CS5.5'
  var commonFiles = '/c/Program%20Files%20(x86)/Common%20Files'
  var destination = File(commonFiles + '/Adobe/Startup Scripts ' + VERSION + '/Adobe InDesign/' + BOOTSTRAP)
  // if (destination.exists) return
  try {
    sed(source, destination, /%SCRIPTDIR%/, SERVER)
  } catch (error) {
    alert('Cannot open ' + destination + '!\r\rYou must run install script as Admin user', 'Must be admin')
  }
}

function app_version() {
  var numbers = app.version.split('.')
  return [ parseInt(numbers[0]), parseInt(numbers[1]) ]
}

main()
// vi: ft=javascript

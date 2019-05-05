function main() {
    var BOOTSTRAP = 'bootstrap.jsx'
    var SERVER = File($.fileName).parent 
    var source = File(SERVER + '/' + BOOTSTRAP)
    var destination = File(Folder.commonFiles + '/Adobe/Startup Scripts CC/Adobe InDesign/' + BOOTSTRAP)
    // if (destination.exists) return
    sed(source, destination, /%SCRIPTDIR%/, SERVER)
}

function sed(source, destination, needle, replacement) {
    // sed :: file, file, regex, string -> undefined
    // copy with replacement
    var open_ok = source.open('r')
    if (!open_ok) {
        throw Error('Cannot open ' + source + '! Does file exist?')    
    }
    var content = source.read()
    source.close()
    if (needle) {
      content = content.replace(needle, replacement)
    }
    open_ok = destination.open('w')
    if (!open_ok) {
        throw Error('Cannot open ' + destination + '! Must run install script as Admin')    
    }
    destination.write(content)
    destination.close()
    $.writeln('copied ' + source + '\rto\r' + destination)
}

main()
// vi: ft=javascript

#include "../_includes/config.jsxinc"; // diverse konfigurasjonsverdier
#include "../_includes/dokTools.jsxinc"; // diverse nyttige verktøyfunksjoner
#include "../_includes/prodsys.jsxinc"; // kommunikasjon med prodsys
#include "../_includes/json2.jsxinc"; // json library

main(62496)

function log(message) {
    // log message
    if (typeof message === 'object') 
      message = JSON.stringify(message, null, 2);
    $.writeln(message);
}


function main(pk){
    var sak = prodsys.get(pk);
    log(sak.tekst);
}
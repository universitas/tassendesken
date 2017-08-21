// vim: set ft=javascript:
#include "../_includes/config.jsxinc"; // diverse konfigurasjonsverdier
#include "../_includes/dokTools.jsxinc"; // diverse nyttige verktøyfunksjoner
#include "../_includes/prodsys.jsxinc"; // kommunikasjon med prodsys
#include "../_includes/json2.jsxinc"; // json library

main(62496)

function main(pk){
    config.DEBUG=true
    var sak = prodsys.get(pk);
    log(sak);
    return sak
}

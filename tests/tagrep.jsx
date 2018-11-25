function taGrep(rotestring) {
  // gjør diverse reglar expression-søk for å renske opp i artikkelen
  rotestring = rotestring.replace(/^@li: */gm, '* ') // bullet i fakta
  rotestring = rotestring.replace(/^@(box|image|pullquote):.*$/gm, '') // fjern disse
  rotestring = rotestring.replace(/\s*[\r\n]+\s*/g, '\r') // fjerner tomme avsnitt og unødvendig luft på slutten og starten av avsnitt
  rotestring = rotestring.replace(/<\/?b>/gi, '') //fjerner BOLD tag :)
  rotestring = rotestring.replace(/ ?<rt> ?/gi, '<RIGHTTAB>') // fikser <rt>-tags

  rotestring = rotestring.replace(/([:!;?])\b/g, '$1 ') // putter mellomrom etter kolon, utropstegn, spørsmålstegn osv.
  rotestring = rotestring.replace(/\b,([a-å])/gi, ', $1') // Legger til mellomrom etter komma før bokstav
  rotestring = rotestring.replace(/ {2,}/g, ' ') // fjerner overflødige mellomrom
  rotestring = rotestring.replace(/\t{2,}/g, '\t') // fjerner overflødige tabulatortegn
  rotestring = rotestring.replace(/\s+([?|,|.|:|!])/g, '$1') // fjerner mellomrom foran skilletegn
  rotestring = rotestring.replace(/(@[^:]+:)\s+/g, '$1') // fjerner whitespace mellom @stil: og tekst
  rotestring = rotestring.replace(/(@[^:]+:)(@[^:]+:)/g, '$2') // tomme avsnitt blir fjerna.
  rotestring = rotestring.replace(/--/g, '–') //gjør om to bindestreker til tankestrek
  rotestring = rotestring.replace(/^- ?/gm, '–') //gjør om bindestrek på starten av avsnitt til tankestrek
  rotestring = rotestring.replace(/\B-\B/g, '–') //gjør om bindestrek med luft på begge sider til tankestrek
  rotestring = rotestring.replace(/[”“"]\b/g, '«').replace(/\b[”“"]/g, '»') // sørger for riktige hermetegn
  rotestring = rotestring.replace(
    /@fakta:([^\r\n]+)[\r\n]+([^@])/gi,
    '@fakta:$1\r@fak1:$2'
  ) //sørger for riktig stiler i faktarammer

  rotestring = rotestring.replace(/^\s*(kilder?):/gim, '@fak2:kilde:') // sørger for riktig stil i kildehenvisning i faktaramme
  rotestring = rotestring.replace(/<\/?(.)>/g, '<@$1>') // gjør om <I> og </I> til <@I> osv.
  rotestring = rotestring.replace(/ÆTT/g, '@') // gjør om ÆTT til krøllalfa
  rotestring = rotestring.replace(/@sitat:[«– ]*([^»\r]*)»?/g, '@sitat:«$1»') // legger til hermetegn på sitat hvis det trengs;

  return rotestring
}

var file = File(File($.fileName).parent + '/bodytext.txt')
file.open()
var text = file.read()
file.close()
taGrep(text)
// vi: ft=javascript

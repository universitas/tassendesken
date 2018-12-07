// embeds png files in a jsx script

main()

function main() {
  // run in current directory
  var cwd = File($.fileName).parent
  var infiles = cwd.getFiles('*.png')
  var outfile = new File(cwd + '/uxIcons.jsxinc')
  embedPngs(infiles, outfile)
}

function _encodeChar(c) {
  return c == escape(c) ? c : escape(c).replace(/%/, '\\x')
}

function _getData(file, width) {
  var lines = ['']
  file.encoding = 'BINARY'
  file.open('r')
  while (!file.eof) {
    if (lines[lines.length - 1].length > width) lines.push('')
    lines[lines.length - 1] += _encodeChar(file.read(1))
  }
  file.close()
  return lines
}

function embedPngs(infiles, outfile) {
  var content = 'var uxIcons = {}'
  for (var i = 0; i < infiles.length; i++) {
    if (infiles[i].exists) {
      var png = infiles[i]
      var key = png.name.replace(/\.\w+$/, '').toUpperCase()
      var lines = _getData(png, 65)
      content +=
        '\n\nuxIcons.' +
        key +
        " = ScriptUI.newImage(\n  [\n    '" +
        lines.join("',\n    '") +
        "'\n  ].join('')\n)"
    }
  }
  outfile.open('w')
  outfile.write(content)
  outfile.close()
}

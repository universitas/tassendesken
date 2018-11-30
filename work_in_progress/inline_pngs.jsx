// from http://www.kahrel.plus.com/indesign/scriptui.html

function graphic_to_text(infiles) {
  var outfile,
    s,
    re1 = /^\(new String\(/,
    re2 = /\)\)$/
  for (var i = 0; i < infiles.length; i++) {
    if (infiles[i].exists) {
      outfile = File(infiles[i].fullName.replace(/\.\w+$/, '.jsx'))
      outfile.open('w')
      infiles[i].encoding = 'BINARY'
      infiles[i].open('r')
      s = infiles[i].read()
      outfile.write('var ' + outfile.name.replace('.jsx', '') + ' = ')
      outfile.write(
        s
          .toSource()
          .replace(re1, '')
          .replace(re2, '')
      )
      outfile.write(';')
      infiles[i].close()
      outfile.close()
    }
  }
}

// The function's input is an array of file objects. Here are some examples:
// graphic_to_text (Folder ("/d/test/").getFiles ("*.png"));
// graphic_to_text ([File ("/d/test/iconA.png"), File ("/d/test/iconB.jpg")]);
// graphic_to_text ([File ("/d/test/iconC.idrc")]);
// The first example is correct since getFiles() returns an array of file
// objects. In the second example, we name two files ; in the third example we
// want to convert just one file, so we pass that in the form of a one-element
// array

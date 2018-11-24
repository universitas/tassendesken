
function loremIpsumize(myText) {
  // myText could be a TextFrame, Story, InsertionPoint, Word, Text etc...
 
  var myStory // the parent Story of myText

  if (myText instanceof Story) {
    myStory = myText
  } else if (myText instanceof InsertionPoint) {
    myText = myStory = myText.parentStory
  } else if (myText.hasOwnProperty('parentStory')) {
    // myText instanceof Word, TextFrame, Character, TextColumn or Paragraph
    myStory = myText.parentStory
  } else {
    // myText is not text, but some other object
    return
  }
  myStory.label = ''
  if (myText instanceof Story || myText instanceof TextFrame) {
    for (var n = myStory.textFrames.length - 1; n >= 0; n--) {
      loremIpsumize(myStory.textFrames[n]) // clever recurson
    }
  }
  if (myText.hasOwnProperty('paragraphs') && myText.paragraphs.length > 1) {
    // The script returns better looking results when one Paragraph is processed at a time
    var myParagraphs = myText.paragraphs.everyItem().getElements()
    for (var m = myParagraphs.length - 1; m >= 0; m--) {
      loremIpsumize(myParagraphs[m]) // clever recurson
    }
  } else if (myText.contents !== '') {
    app.findGrepPreferences = NothingEnum.nothing
    app.changeGrepPreferences = NothingEnum.nothing
    app.findGrepPreferences.findWhat =
      "[\\u\\l'@\u00E6\u00C6]{1," + loremIpsumDictionary.length + '}' // only looks for word-characters and leave punctuation, spaces as they are

    var storyLineNumber = myStory.lines.length // remembers how many lines the story has, and tries to make the new text the same number of lines
    var myWordMatches = myText.findGrep() // an array of Word references that fit the grep
    for (var i = myWordMatches.length - 1; i >= 0; i--) {
      myWordMatches[i].contents = loremipsumWord(myWordMatches[i].contents) // changes the word into a random latin-sounding one
    }
    fineTuneText(storyLineNumber)
  }

  function fineTuneText(targetNumberOfLines) {
    // tries to make the text the correct number of lines by adding or subtracting one letter at a time
    var myNumberOfCharacters
    var newWord
    var myWord
    while (targetNumberOfLines !== myStory.lines.length) {
      myNumberOfCharacters = myText.characters.length
      for (
        var changeWord = myWordMatches.length - 1;
        changeWord >= 0;
        changeWord--
      ) {
        myWord = myWordMatches[changeWord]
        if (targetNumberOfLines > myStory.lines.length) {
          newWord = loremipsumWord(myWord.contents + 'a') // adds a letter
        } else if (targetNumberOfLines < myStory.lines.length) {
          newWord =
            myWord.contents.length > 1
              ? loremipsumWord(myWord.contents.slice(0, -1))
              : myWord.contents // removes a letter
        } else {
          return true // targetNumberOfLines === myStory.lines.length
        }
        myWord.contents = newWord
      }
      if (myNumberOfCharacters === myText.characters.length) {
        return false // Every word in the text has been reduced to a single character, and the text is still too long.... Give up.
      } else {
        myWordMatches = myText.findGrep() // Need to do a new search, since the text has been changed
      }
    }
  }

  function loremipsumWord(myWord) {
    // takes a string and returns a random word with same number of letters, and the same capitalization
    var replacementWord = ''
    var correctCaseWord = ''
    var wordLength = myWord.length
    if (wordLength >= loremIpsumDictionary.length) {
      // in case myWord is longer than the longest words in the dictionary
      replacementWord =
        loremipsumWord(myWord.substr(0, loremIpsumDictionary.length - 1)) +
        loremipsumWord(myWord.substr(loremIpsumDictionary.length - 1)) // The word is longer than the longest words in the dictionary. So it's split in two.
    } else {
      replacementWord =
        loremIpsumDictionary[wordLength][
          Math.floor(Math.random() * loremIpsumDictionary[wordLength].length)
        ] // finds a random word of the same length
      if (myWord.toLowerCase() != myWord) {
        // the word contains uppercase characters
        correctCaseWord = ''
        for (var n = 0; n < wordLength; n++) {
          // loops through each character in the original word, checking if it's upper or lower case.
          correctCaseWord +=
            myWord.charAt(n).toUpperCase() == myWord.charAt(n)
              ? replacementWord.charAt(n).toUpperCase()
              : replacementWord.charAt(n) // makes the character the correct case
        }
        replacementWord = correctCaseWord
      }
    }
    return replacementWord
  }
}

 var loremIpsumDictionary = [
    [''], // this is the dictionary of words sorted by number of letters. The words are taken from InDesigns "fill with placeholder text"-feature
    ['a', 'e', 'y'],
    [
      'el',
      'si',
      'em',
      'se',
      'an',
      'er',
      'do',
      're',
      'te',
      'at',
      'os',
      'od',
      'to',
      'et',
      'eu',
      'ud',
      'na',
      'ex',
      'ed',
      'ut',
      'ad',
      'il',
      'in',
      'la',
      'it',
      'is',
      'ip',
      'am',
      'ea'
    ],
    [
      'ing',
      'lam',
      'vel',
      'lan',
      'lis',
      'lor',
      'ute',
      'ver',
      'con',
      'lum',
      'lut',
      'ibh',
      'del',
      'unt',
      'min',
      'mod',
      'feu',
      'nim',
      'nis',
      'nit',
      'non',
      'nos',
      'bla',
      'eum',
      'eui',
      'num',
      'aut',
      'dio',
      'odo',
      'wis',
      'tis',
      'tio',
      'pis',
      'pit',
      'qui',
      'ate',
      'tin',
      'tie',
      'ese',
      'tet',
      'tem',
      'dip',
      'rat',
      'ero',
      'ril',
      'rit',
      'ros',
      'dit'
    ],
    [
      'duis',
      'alit',
      'dunt',
      'ecte',
      'sisi',
      'elis',
      'elit',
      'enim',
      'enis',
      'enit',
      'sent',
      'wisl',
      'erat',
      'amet',
      'tate',
      'alis',
      'erci',
      'erit',
      'wisi',
      'eros',
      'esed',
      'esse',
      'essi',
      'dion',
      'atem',
      'atet',
      'acil',
      'esto',
      'atio',
      'quis',
      'atue',
      'etue',
      'quip',
      'ting',
      'etum',
      'atum',
      'quat',
      'quam',
      'diat',
      'euip',
      'prat'
    ],
    [
      'lorem',
      'ispum',
      'magna',
      'ulput',
      'lutem',
      'minci',
      'minis',
      'lummy',
      'commy',
      'adiat',
      'minit',
      'conse',
      'lorer',
      'lorem',
      'ullum',
      'adiam',
      'lobor',
      'modip',
      'modit',
      'lenit',
      'lenim',
      'laore',
      'cipit',
      'molor',
      'utpat',
      'velis',
      'iusto',
      'iusci',
      'iurem',
      'molum',
      'velit',
      'ullan',
      'ullam',
      'nisci'
    ],
    [
      'mconse',
      'magnit',
      'mincip',
      'magnis',
      'magnim',
      'minisi',
      'minisl',
      'lutpat',
      'wissis',
      'wissim',
      'acidui',
      'modiat',
      'commod',
      'luptat',
      'wiscip',
      'wiscin',
      'lumsan',
      'wiscil',
      'molent',
      'cinibh',
      'lortio',
      'vulput',
      'molore',
      'lortin',
      'lortie',
      'vullut',
      'vullan',
      'vullam',
      'ncidui',
      'volute',
      'lorper'
    ],
    [
      'feuisci',
      'sustrud',
      'ationse',
      'feuisis',
      'feuisit',
      'feuguer',
      'feuismo',
      'feugiat',
      'feummod',
      'feugiam',
      'hendiam',
      'feugait',
      'dolorem',
      'andreet',
      'suscipi',
      'hendrem',
      'hendrer',
      'facipit',
      'heniamc',
      'amconul',
      'atuerat',
      'facipis',
      'dolorer',
      'facinim',
      'tetummy',
      'facinim',
      'delesto'
    ],
    [
      'dolortis',
      'vendreet',
      'vullutat',
      'consequi',
      'niatuero',
      'eugiamet',
      'nismodit',
      'adignibh',
      'eugiatet',
      'zzriusto',
      'doluptat',
      'veliquat',
      'nonsecte',
      'veliquam',
      'velestis',
      'dolortio',
      'nonsenim',
      'velessim',
      'dolortin',
      'dolortie',
      'velenibh',
      'nonsequi',
      'veleniat',
      'conullam',
      'eraessit'
    ],
    [
      'iriliquis',
      'blandipis',
      'quismolor',
      'irillamet',
      'consequis',
      'iriuscing',
      'blaorerit',
      'iriustrud',
      'etuerosto',
      'nissectet',
      'vendiamet',
      'volestisl',
      'dionsenim',
      'digniamet',
      'eniatisit',
      'quamcommy',
      'iurerosto',
      'ionsequat',
      'ptatueros',
      'consequat',
      'duiscipit',
      'scillummy',
      'veliquisl'
    ],
    [
      'loremipsum',
      'exeriurero',
      'nummodolor',
      'ullamcommy',
      'veriliquat',
      'conulputat',
      'uismodolor',
      'exeraessit',
      'exerostrud',
      'nullaortis',
      'tisiscipis',
      'nullaoreet',
      'nullandrem',
      'odigniamet',
      'nullandiat',
      'verciduisi',
      'erciduisit',
      'faciduisim',
      'lummolessi',
      'facincipit',
      'voloreetum'
    ],
    [
      'dolortionum',
      'veliquiscil',
      'euguerostie',
      'veliquamcon',
      'aciliquisim',
      'eummolestin',
      'adionsequat',
      'adipsustrud',
      'vercincinis',
      'dolorpercin',
      'exeraestrud',
      'ullaorperit',
      'wismolobore',
      'amconsequis',
      'essequating',
      'facipsustio',
      'doloreetuer',
      'elesequisim',
      'augiametuer'
    ],
    [
      'dolutatueros',
      'adigniamcore',
      'velesequipit',
      'adigniscipis',
      'eummolortion',
      'dolorperiure',
      'dolorpercing',
      'ulputpatetue',
      'uipsuscidunt',
      'aliquipsusci',
      'tumsandionse',
      'tionsequisim',
      'facilismolut',
      'facillametum',
      'atueraestrud',
      'sustionsenim',
      'iliquatiniat',
      'dolenismodit'
    ]
  ]

  loremIpsumDictionary = [
    [''], // Gangsta!
    ['i', 'a'],
    [
      'yo',
      'eu',
      'ut',
      'up',
      'sa',
      'fo',
      'go',
      'we',
      'ac',
      'at',
      'to',
      'im',
      'oo',
      'in',
      'of',
      'it',
      'ma',
      'my',
      'mi',
      'et',
      'da'
    ],
    [
      'the',
      'bow',
      'leo',
      'its',
      'nec',
      'non',
      'wow',
      'out',
      'own',
      'ass',
      'hac',
      'son',
      'get',
      'for',
      'and',
      'pot',
      'yih',
      'cum',
      'sit',
      'saw',
      'mah',
      'est',
      'vel',
      'sed',
      'you'
    ],
    [
      'shit',
      'shut',
      'amet',
      'quis',
      'quam',
      'ante',
      'phat',
      'dope',
      'down',
      'yall',
      'eget',
      'sure',
      'pede',
      'elit',
      'away',
      'enim',
      'orci',
      'nunc',
      'dang',
      'nisl',
      'nisi',
      'nibh',
      'neck',
      'mofo',
      'bomb',
      'urna',
      'boom',
      'this',
      'went',
      'home',
      'uhuh',
      'shiz',
      'dawg'
    ],
    [
      'vitae',
      'morbi',
      'fresh',
      'neque',
      'funky',
      'fusce',
      'velit',
      'metus',
      'doggy',
      'crazy',
      'thats',
      'black',
      'massa',
      'gonna',
      'risus',
      'nulla',
      'mamma',
      'dolor',
      'felis',
      'purus',
      'break',
      'crunk',
      'lacus',
      'class',
      'owned',
      'justo',
      'stuff',
      'izzle',
      'ipsum',
      'chung',
      'check',
      'bling',
      'shizz'
    ],
    [
      'pimpin',
      'ornare',
      'pizzle',
      'lectus',
      'bizzle',
      'libero',
      'ligula',
      'daahng',
      'luctus',
      'platea',
      'tellus',
      'nullam',
      'vizzle',
      'things',
      'hizzle',
      'tortor',
      'nostra',
      'sizzle',
      'mattis',
      'rizzle',
      'mauris',
      'gizzle',
      'nizzle',
      'ghetto',
      'sapien',
      'mizzle',
      'varius',
      'dizzle',
      'tempor',
      'montes',
      'turpis',
      'sheezy',
      'taciti',
      'fizzle'
    ],
    [
      'blandit',
      'shiznit',
      'gangsta',
      'etizzle',
      'yippiyo',
      'gdizzle',
      'nonummy',
      'boofron',
      'vivamus',
      'mammasa',
      'amizzle',
      'gravida',
      'viverra',
      'quizzle',
      'erizzle',
      'brizzle',
      'quisque',
      'enizzle',
      'feugiat',
      'lacinia',
      'elizzle',
      'commodo',
      'pretium',
      'posuere',
      'integer',
      'egestas',
      'tizzles',
      'crizzle',
      'shizzle'
    ],
    [
      'eleifend',
      'donizzle',
      'praesent',
      'pharetra',
      'socizzle',
      'pulvinar',
      'sociosqu',
      'ipsizzle',
      'varizzle',
      'dolizzle',
      'lacizzle',
      'beyonces',
      'torquent',
      'bibendum',
      'lorizzle',
      'maecenas',
      'felizzle',
      'mammasay',
      'aenizzle',
      'gangster',
      'metizzle',
      'shizznit',
      'shizzlin',
      'faucibus',
      'dictumst',
      'vehicula',
      'velizzle',
      'molestie',
      'interdum',
      'facilisi',
      'accumsan'
    ],
    [
      'sempizzle',
      'turpizzle',
      'auctizzle',
      'hendrerit',
      'consequat',
      'vulputate',
      'pretizzle',
      'phasellus',
      'tristique',
      'curabitur',
      'facilisis',
      'dictizzle',
      'elementum',
      'tellizzle',
      'tortizzle',
      'tempizzle',
      'nullizzle',
      'mollizzle',
      'maurizzle',
      'mattizzle',
      'malesuada',
      'fringilla',
      'feugizzle'
    ],
    [
      'iaculizzle',
      'euismizzle',
      'parturient',
      'dapibizzle',
      'vestibulum',
      'rhoncizzle',
      'aliquizzle',
      'integizzle',
      'adipiscing',
      'shackalack'
    ],
    [
      'pulvinizzle',
      'ultricizzle',
      'sagittizzle',
      'maecenizzle',
      'tellivizzle',
      'scelerisque',
      'suspendisse',
      'suscipizzle',
      'volutpizzle',
      'crocodizzle',
      'bibendizzle',
      'accumsizzle'
    ],
    [
      'crackalackin',
      'penatibizzle',
      'curabitizzle',
      'pellentesque',
      'hendrerizzle',
      'facilisizzle',
      'convallizzle',
      'fermentizzle'
    ]
  ]

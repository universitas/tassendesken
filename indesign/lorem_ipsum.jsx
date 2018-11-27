#target "indesign";
#includepath "../_includes/";
#include "index.jsxinc";

function main() {
  app.scriptPreferences.enableRedraw = false
  app.doScript(
    map(loremIpsumize),
    ScriptLanguage.JAVASCRIPT,
    [app.selection],
    UndoModes.FAST_ENTIRE_SCRIPT,
    'lorem ipsumize'
  )
  app.scriptPreferences.enableRedraw = true
}

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
    for (var n = myStory.textFrames.length - 1; n >= 0; n--)
      loremIpsumize(myStory.textFrames[n])
  }

  if (myText.hasOwnProperty('paragraphs') && myText.paragraphs.length > 1) {
    // The script returns better looking results when one Paragraph is processed at a time
    var myParagraphs = myText.paragraphs.everyItem().getElements()
    for (var m = myParagraphs.length - 1; m >= 0; m--)
      loremIpsumize(myParagraphs[m])
  } else if (myText.contents !== '') {
    app.findGrepPreferences = NothingEnum.nothing
    app.changeGrepPreferences = NothingEnum.nothing
    app.findGrepPreferences.findWhat =
      "[\\u\\l'@\u00E6\u00C6]{1," + loremWords.length + '}' // only looks for word-characters and leave punctuation, spaces as they are

    var storyLineNumber = myStory.lines.length // remembers how many lines the story has, and tries to make the new text the same number of lines
    var myWordMatches = myText.findGrep() // an array of Word references that fit the grep
    for (var i = myWordMatches.length - 1; i >= 0; i--)
      myWordMatches[i].contents = loremipsumWord(myWordMatches[i].contents) // changes the word into a random latin-sounding one
    fineTuneText(storyLineNumber)
  }

  function fineTuneText(targetNumberOfLines) {
    // tries to make the text the correct number of lines by adding or subtracting one letter at a time
    var myNumberOfCharacters
    while (true) {
      var actualLength = myStory.lines.length
      myNumberOfCharacters = myText.characters.length
      for (var i = myWordMatches.length - 1; i >= 0; i--) {
        var word = myWordMatches[i]
        var newWord
        if (targetNumberOfLines > actualLength) {
          newWord = loremipsumWord(word.contents + 'a') // adds a letter
        } else if (targetNumberOfLines < actualLength) {
          newWord =
            word.contents.length > 1
              ? loremipsumWord(word.contents.slice(0, -1))
              : word.contents // removes a letter
        } else {
          return true // targetNumberOfLines === myStory.lines.length
        }
        word.contents = newWord
      }
      if (myNumberOfCharacters === myText.characters.length) {
        return false
        // Every word in the text has been reduced to a single character, and
        // the text is still too long.... Give up.
      } else {
        myWordMatches = myText.findGrep()
        // Need to do a new search, since the text has been changed
      }
    }
  }
}

// [a] -> a
function randomChoice(a) {
  return a[Math.floor(Math.random() * a.length)]
}

// str, str -> str
function sameCase(a, b) {
  // make the string b match the case of string a
  if (a.toLowerCase() == a) return b
  var head = a[0].toUpperCase() === a[0] ? b[0].toUpperCase() : b[0]
  return head + sameCase(a.slice(1), b.slice(1))
}

// str -> str
function loremIpsumWord(word) {
  // prettier-ignore
  var loremWords = [
    [''], 
    ['i', 'a', 'u'],
    [ 'yo', 'eu', 'ut', 'up', 'sa', 'fo', 'go', 'we', 'ac', 'at', 'to', 'im',
      'oo', 'in', 'of', 'it', 'ma', 'my', 'mi', 'et', 'da' ],
    [ 'the', 'bow', 'leo', 'its', 'nec', 'non', 'wow', 'out', 'own', 'ass',
      'hac', 'son', 'get', 'for', 'and', 'pot', 'yih', 'cum', 'sit', 'saw',
      'mah', 'est', 'vel', 'sed', 'you' ],
    [ 'shit', 'shut', 'amet', 'quis', 'quam', 'ante', 'phat', 'dope', 'down',
      'yall', 'eget', 'sure', 'pede', 'elit', 'away', 'enim', 'orci', 'nunc',
      'dang', 'nisl', 'nisi', 'nibh', 'neck', 'mofo', 'bomb', 'urna', 'boom',
      'this', 'went', 'home', 'uhuh', 'shiz', 'dawg' ],
    [ 'vitae', 'morbi', 'fresh', 'neque', 'funky', 'fusce', 'velit', 'metus',
      'doggy', 'crazy', 'thats', 'black', 'massa', 'gonna', 'risus', 'nulla',
      'mamma', 'dolor', 'felis', 'purus', 'break', 'crunk', 'lacus', 'class',
      'owned', 'justo', 'stuff', 'izzle', 'ipsum', 'chung', 'check', 'bling',
      'shizz' ],
    [ 'pimpin', 'ornare', 'pizzle', 'lectus', 'bizzle', 'libero', 'ligula',
      'daahng', 'luctus', 'platea', 'tellus', 'nullam', 'vizzle', 'things',
      'hizzle', 'tortor', 'nostra', 'sizzle', 'mattis', 'rizzle', 'mauris',
      'gizzle', 'nizzle', 'ghetto', 'sapien', 'mizzle', 'varius', 'dizzle',
      'tempor', 'montes', 'turpis', 'sheezy', 'taciti', 'fizzle' ],
    [ 'blandit', 'shiznit', 'gangsta', 'etizzle', 'yippiyo', 'gdizzle',
      'nonummy', 'boofron', 'vivamus', 'mammasa', 'amizzle', 'gravida',
      'viverra', 'quizzle', 'erizzle', 'brizzle', 'quisque', 'enizzle',
      'feugiat', 'lacinia', 'elizzle', 'commodo', 'pretium', 'posuere',
      'integer', 'egestas', 'tizzles', 'crizzle', 'shizzle' ],
    [ 'eleifend', 'donizzle', 'praesent', 'pharetra', 'socizzle', 'pulvinar',
      'sociosqu', 'ipsizzle', 'varizzle', 'dolizzle', 'lacizzle', 'beyonces',
      'torquent', 'bibendum', 'lorizzle', 'maecenas', 'felizzle', 'mammasay',
      'aenizzle', 'gangster', 'metizzle', 'shizznit', 'shizzlin', 'faucibus',
      'dictumst', 'vehicula', 'velizzle', 'molestie', 'interdum', 'facilisi',
      'accumsan' ],
    [ 'sempizzle', 'turpizzle', 'auctizzle', 'hendrerit', 'consequat',
      'vulputate', 'pretizzle', 'phasellus', 'tristique', 'curabitur',
      'facilisis', 'dictizzle', 'elementum', 'tellizzle', 'tortizzle',
      'tempizzle', 'nullizzle', 'mollizzle', 'maurizzle', 'mattizzle',
      'malesuada', 'fringilla', 'feugizzle' ], 
    [ 'iaculizzle', 'euismizzle', 'parturient', 'dapibizzle', 'vestibulum',
      'rhoncizzle', 'aliquizzle', 'integizzle', 'adipiscing', 'shackalack' ],
    [ 'pulvinizzle', 'ultricizzle', 'sagittizzle', 'maecenizzle',
      'tellivizzle', 'scelerisque', 'suspendisse', 'suscipizzle',
      'volutpizzle', 'crocodizzle', 'bibendizzle', 'accumsizzle' ],
    [ 'crackalackin', 'penatibizzle', 'curabitizzle', 'pellentesque',
      'hendrerizzle', 'facilisizzle', 'convallizzle', 'fermentizzle' ]
  ]
  var words = loremWords[word.length]
  if (!words) {
    // word is too long
    var half = Math.floor(word.length / 2)
    var head = word.substr(0, half)
    var tail = word.substr(half)
    return loremIpsumWord(head) + loremIpsumWord(tail)
  }
  return sameCase(word, randomChoice(words))
}

if (ifMain($.fileName)) main()

// vi: ft=javascript

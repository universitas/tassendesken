#target "indesign"
#targetengine "session"
#include ../_includes/index.jsxinc

function main() {
  if (app.selection.length === 0)
    alert('Spaltestreker\rVelg en eller flere tekstrammer')
  else {
    for (var i = 0; i < app.selection.length; i++)
      addGutterLines(app.selection[i])
  }
}

function addGutterLines(textFrame) {
  if (!textFrame instanceof TextFrame) return
  var objStyle = dokTools.velgStil(
    app.activeDocument,
    'object',
    config.objektstiler.spaltestrek
  )
  var columns = textFrame.textFramePreferences.textColumnCount
  var gutter = textFrame.textFramePreferences.textColumnGutter
  var gb = textFrame.geometricBounds
  var inset = textFrame.textFramePreferences.insetSpacing
  if (typeof inset == 'number') inset = [inset, inset, inset, inset]
  var bounds = [
    gb[0] + inset[0],
    gb[1] + inset[1],
    gb[2] - inset[2],
    gb[3] - inset[3]
  ]
  var frameWidth = bounds[3] - bounds[1]
  var columnWidth = (frameWidth - (columns - 1) * gutter) / columns
  // remove existing gutter lines for this text frame
  var lines = app.activeDocument.graphicLines.everyItem().getElements() || []
  var label = 'textFrameid: ' + textFrame.id
  for (var i = 0; i < lines.length; i++)
    lines[i].label === label && lines[i].remove()

  for (i = 0; i < columns + 1; i++) {
    var x = bounds[1] + i * (columnWidth + gutter) - gutter / 2
    var line = textFrame.parent.graphicLines.add(
      undefined,
      undefined,
      undefined,
      { appliedObjectStyle: objStyle }
    )
    line.label = label
    line.paths[0].pathPoints[0].anchor = [x, bounds[0]]
    line.paths[0].pathPoints[1].anchor = [x, bounds[2]]
  }
}
// vi: ft=javascript

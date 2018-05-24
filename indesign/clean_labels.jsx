var doc = app.activeDocument
var items = doc.pageItems
var length = items.count()
var item, label
for (var i = 0; i < length; i++) {
  item = items.item(i)
  label = item.label
  if (label) {
    $.writeln(i, ' ', label)
    // item.label = '';
  }
}

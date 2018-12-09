#script "user interface for page builder"
#include "../includes/index.jsxinc"
#include "ux-utils.jsxinc"

function main(state, fetchData) {
  resourceString =
    "palette {\
    properties: {resizeable: true},\
    text: 'Gjør klar mal for utgave', frameLocation:[1200,10],\
    preferredSize: [400, 400], spacing: 5, margins: 10,\
    helpText: StaticText {\
      alignment: ['fill', 'top'],  text: 'endre mal' },\
    thead: Group {\
      margins: [7,2,25,0], alignment: 'top', preferredSize: [-1, 10],\
      t0: StaticText {text: 'startside:', preferredSize: [200, -1] },\
      t1: StaticText {text: 'master:', preferredSize: [200, -1] },\
    },\
    scrollPanel: Group {\
      margins: 0, minimumSize: [350, 100], alignment: ['fill', 'fill'] },\
    buttons: Group { \
      alignment: ['fill', 'bottom'], alignChildren: ['fill', 'center'],\
      margins: [0,10,0,0], minimumSize: [350, 40],\
      cancel: Button { text: 'Avbryt', preferredSize: [-1, 60]  },\
      accept: Button { text: 'OK', preferredSize: [-1, 30]  },\
    }\
  }"
  w = new Window(resourceString)
  w.state = state
  w.changeList = scrollPanel(w.scrollPanel, 640)
  uxStyle({ bg: 0.8 }, w)
  uxStyle({ fg: 0.4 }, w.thead)
  uxStyle({ bg: 0.98 }, w.changeList)
  w.buttons.cancel.onClick = function() {
    pp(w.state)
    w.close()
  }
  w.buttons.accept.onClick = function() {
    w.close()
  }
  w.onResize = function(e) {
    w.layout.resize()
  }
  w.render = function() {
    var rows = map(function(row) {
      changeRow(w.pagesList, row)
    })(w.state.changeList)
    for (var i = 0; i < rows.length; i += 2) uxStyle({ bg: 0.9 }, rows[i])
  }
  w.render()
  w.show()
  return w
}

function changeRow(parent, state) {
  var rs =
    "Group { margins: [5,2,5,2],\
    alignChildren: ['left', 'center'], preferredSize: [-1, 10],\
    key: StaticText {text: 'key', preferredSize: [45, -1] },\
    val: EditText {alignment: ['fill', 'center'] },\
  }"
  var row = parent.add(rs)
  row.key.text = state.key
  row.value.text = state.value
  row.val.onChange = function() {
    state.value = row.val.text
  }
  return row
}

// prettier-ignore
var INITIAL_STATE = {
  changeList: [
    ['bar', 'BAR'],
    ['foo.bar', 'foobar'],
    ['foo.baz', 'foo baz'],
  ]
}

if (ifMain($.fileName)) var w = main(INITIAL_STATE)

// vi: ft=javascript

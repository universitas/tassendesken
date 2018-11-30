#include ../_includes/index.jsxinc

function removeEventListeners(eventType) {
  return pipe(
    prop('eventListeners'),
    filter(propEq('eventType', eventType)),
    map(call('remove')),
    prop('length')
  )(app)
}

removeEventListeners(DocumentEvent.BEFORE_SAVE)

function checkPreflight(document, profile) {
  // Check if there's any preflight errors
  if (!document)
    document = app.activeDocument
  if (!profile)
    profile = document.preflightProfiles.firstItem()
  // ensure preflight checking is turned on
  var preflightOff = document.preflightOptions.preflightOff
  doc.preflightOptions.preflightOff = false

  // check document preflight
  var process = app.preflightProcesses.add(document, profile)
  process.waitForProcess()
  var results = process.aggregatedResults[2]
  if (results.length) {
    app.menuActions.itemByName('Preflight').invoke()
    return results
  }
  // reset preflight checking
  doc.preflightOptions.preflightOff = preflightOff
  return false
}

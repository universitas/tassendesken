function checkPreflight() {
    var doc = app.activeDocument
    var preflightOff = doc.preflightOptions.preflightOff
    doc.preflightOptions.preflightOff = false
    var profile = doc.preflightProfiles.firstItem();  
    var process = app.preflightProcesses.add(doc, profile);    
    process.waitForProcess();
    var results = process.aggregatedResults[2];
    if (results.length) {
      app.menuActions.itemByName('Preflight').invoke()
      return results
    }
    doc.preflightOptions.preflightOff = preflightOff
    return false
}

checkPreflight()
//DESCRIPTION:Export all pages to JPG format with the desired dimensions
// Export to JPG - all pages.jsx
//
// Modified 2016-04-26
// Keith Gilbert, Gilbert Consulting
// www.gilbertconsulting.com
// blog.gilbertconsulting.com

// Assumes any document bleed is the same on all 4 sides of the page
// All pages in a spread are the same height

Main();

function Main() {
  // Check to see whether any InDesign documents are open.
  // If no documents are open, display an error message.
  if (app.documents.length > 0) {
    var myDoc = app.activeDocument;
    // Set the measurement system to points and the origin to page
    userHoriz = myDoc.viewPreferences.horizontalMeasurementUnits;
    userVert = myDoc.viewPreferences.verticalMeasurementUnits;
    userOrigin = myDoc.viewPreferences.rulerOrigin;
    myDoc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.points;
    myDoc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.points;
    myDoc.viewPreferences.rulerOrigin = RulerOrigin.PAGE_ORIGIN;
    myDoc.zeroPoint = [0, 0];
    // Prompt the user where to save the file
    var myFilePath = File.saveDialog(
      "Choose a name and location for the file(s)."
    );
    if (myFilePath) {
      // User did not click Cancel
      var myString = myFilePath.toString();
      var myLastSlash = myString.lastIndexOf("/");
      var myPath = myString.slice(0, myLastSlash + 1);
      var myLastPeriod = myString.lastIndexOf(".");
      if (myLastPeriod == -1) {
        var myFileName = myString.slice(myLastSlash + 1);
      } else {
        var myFileName = myString.slice(myLastSlash + 1, myLastPeriod);
      }
      var myResultsArray = new Array();
      var myResultsArray = myInput();
      if (myResultsArray) {
        // User did not click Cancel
        // Gather the settings that are common to all exports
        var myWidth = myResultsArray[0];
        var myHeight = myResultsArray[1];
        switch (myResultsArray[4]) { // Quality
          case "Maximum":
            app.jpegExportPreferences.jpegQuality = JPEGOptionsQuality.MAXIMUM;
            break;
          case "High":
            app.jpegExportPreferences.jpegQuality = JPEGOptionsQuality.HIGH;
            break;
          case "Medium":
            app.jpegExportPreferences.jpegQuality = JPEGOptionsQuality.MEDIUM;
            break;
          case "Low":
            app.jpegExportPreferences.jpegQuality = JPEGOptionsQuality.LOW;
            break;
          default:
            break;
        }
        switch (myResultsArray[5]) { // Format method
          case "Progressive":
            app.jpegExportPreferences.jpegRenderingStyle =
              JPEGOptionsFormat.PROGRESSIVE_ENCODING;
            break;
          case "Baseline":
            app.jpegExportPreferences.jpegRenderingStyle =
              JPEGOptionsFormat.BASELINE_ENCODING;
            break;
          default:
            break;
        }
        switch (myResultsArray[6]) { // Colorspace
          case "RGB":
            app.jpegExportPreferences.jpegColorSpace = JpegColorSpaceEnum.RGB;
            break;
          case "CMYK":
            app.jpegExportPreferences.jpegColorSpace = JpegColorSpaceEnum.CMYK;
            break;
          case "Gray":
            app.jpegExportPreferences.jpegColorSpace = JpegColorSpaceEnum.GRAY;
            break;
          default:
            break;
        }
        app.jpegExportPreferences.embedColorProfile = myResultsArray[7]; // Color profile
        app.jpegExportPreferences.antiAlias = myResultsArray[8]; // Anti alias
        app.jpegExportPreferences.simulateOverprint = myResultsArray[10]; // Simulate overprint
        var myStartPosition = myDoc.pages.firstItem().documentOffset;
        var myEndPosition = myDoc.pages.lastItem().documentOffset;
        if (myResultsArray[2]) {
          // Export Pages
          app.jpegExportPreferences.exportingSpread = false;
          for (
            var myCounter = myStartPosition;
            myCounter <= myEndPosition;
            myCounter++
          ) {
            var myPage = myDoc.pages.item(myCounter);
            var myPageName = myDoc.pages.item(myCounter).name;
            if (myResultsArray[9]) {
              // Export bleeds
              app.jpegExportPreferences.useDocumentBleeds = true;
              var myBleedAmount =
                myDoc.documentPreferences.documentBleedTopOffset;
            } else {
              // Don't export bleeds
              app.jpegExportPreferences.useDocumentBleeds = false;
              var myBleedAmount = 0;
            }
            // Calculate the dimensions of the current page (each page of the document might be a different size)
            var myCurrentWidth =
              myPage.bounds[3] - myPage.bounds[1] + 2 * myBleedAmount;
            var myCurrentHeight =
              myPage.bounds[2] - myPage.bounds[0] + 2 * myBleedAmount;
            if (myWidth > 0) {
              // Calculate the scale percentage
              var myResizePercentage = myWidth / myCurrentWidth;
              var myExportRes = myResizePercentage * 72;
            } else {
              // Calculate the scale percentage
              var myResizePercentage = myHeight / myCurrentHeight;
              var myExportRes = myResizePercentage * 72;
            }
            app.jpegExportPreferences.exportResolution = myExportRes;
            app.jpegExportPreferences.jpegExportRange =
              ExportRangeOrAllPages.EXPORT_RANGE;
            app.jpegExportPreferences.pageString = myPageName;
            //The name of the exported files will be the base name + the
            //page name + ".jpg". If the page name contains a colon (as it will
            //if the document contains sections), then remove the colon.
            var myRegExp = /:/gi;
            myPageName = myPageName.replace(myRegExp, "_");
            // Pad the page number with leading zeros
            if (myPageName < 100) {
              myPageName = "0" + myPageName;
            }
            if (myPageName < 10) {
              myPageName = "0" + myPageName;
            }
            myDoc.exportFile(
              ExportFormat.JPG,
              File(myPath + myFileName + "_" + myPageName + ".jpg"),
              false
            );
          }
        } else {
          // Export Spreads
          app.jpegExportPreferences.exportingSpread = true;
          for (
            var myCounter = myStartPosition;
            myCounter <= myEndPosition;
            myCounter++
          ) {
            var myPage = myDoc.pages.item(myCounter);
            var myPageName = myDoc.pages.item(myCounter).name;
            var mySpread = myPage.parent;
            if (mySpread != myOldSpread) {
              if (myResultsArray[11]) {
                // Export bleeds
                app.jpegExportPreferences.useDocumentBleeds = true;
                var myBleedAmount =
                  myDoc.documentPreferences.documentBleedTopOffset;
              } else {
                // Don't export bleeds
                app.jpegExportPreferences.useDocumentBleeds = false;
                var myBleedAmount = 0;
              }
              // Calculate the dimensions of the current spread (each page of the document might be a different width, and spreads may be more than 2 pages)
              var myCurrentWidth = 0;
              var myCurrentHeight =
                mySpread.pages.lastItem().bounds[2] -
                mySpread.pages.firstItem().bounds[0] +
                2 * myBleedAmount;
              for (j = 0; j < mySpread.pages.length; j++) {
                myCurrentWidth =
                  myCurrentWidth +
                  (mySpread.pages[j].bounds[3] - mySpread.pages[j].bounds[1]);
              }
              myCurrentWidth = myCurrentWidth + 2 * myBleedAmount;
              if (myWidth > 0) {
                // Calculate the scale percentage
                var myResizePercentage = myWidth / myCurrentWidth;
                var myExportRes = myResizePercentage * 72;
              } else {
                // Calculate the scale percentage
                var myResizePercentage = myHeight / myCurrentHeight;
                var myExportRes = myResizePercentage * 72;
              }
              app.jpegExportPreferences.exportResolution = myExportRes;
              app.jpegExportPreferences.jpegExportRange =
                ExportRangeOrAllPages.EXPORT_RANGE;
              app.jpegExportPreferences.pageString = myPageName;
              //The name of the exported files will be the base name + the
              //page name + ".jpg". If the page name contains a colon (as it will
              //if the document contains sections), then remove the colon.
              var myRegExp = /:/gi;
              myPageName = myPageName.replace(myRegExp, "_");
              // Pad the page number with leading zeros
              if (myPageName < 100) {
                myPageName = "0" + myPageName;
              }
              if (myPageName < 10) {
                myPageName = "0" + myPageName;
              }
              myDoc.exportFile(
                ExportFormat.JPG,
                File(myPath + myFileName + "_" + myPageName + ".jpg"),
                false
              );
              var myOldSpread = mySpread;
            }
          }
        }
      }
    }
    // Return the measurement system and origin to the way it was
    myDoc.viewPreferences.horizontalMeasurementUnits = userHoriz;
    myDoc.viewPreferences.verticalMeasurementUnits = userVert;
    myDoc.viewPreferences.rulerOrigin = userOrigin;
  } else {
    // No documents are open, so display an error message.
    alert(
      "No InDesign documents are open. Please open a document and try again."
    );
  }
}

// Prompt the user for JPG export values
function myInput() {
  var myWindow = new Window("dialog", "Export to JPG - all pages");
  myWindow.preferredSize = [372, 418];
  myWindow.alignChildren = "right";
  var mySizePanel = myWindow.add(
    "panel",
    undefined,
    "Enter the desired export size in pixels"
  );
  mySizePanel.alignChildren = "left";
  mySizePanel.margins = 20;
  mySizePanel.preferredSize = [340, 75];
  var mySizeGroup = mySizePanel.add("group", undefined);
  mySizeGroup.add("statictext", undefined, "Width:");
  var myWidthField = mySizeGroup.add("edittext", undefined, ""); // width
  myWidthField.characters = 6;
  myWidthField.active = true;
  mySizeGroup.add(
    "statictext",
    undefined,
    "\u00A0\u00A0\u00A0OR\u00A0\u00A0\u00A0"
  );
  mySizeGroup.add("statictext", undefined, "Height:");
  var myHeightField = mySizeGroup.add("edittext", undefined, ""); // height
  myHeightField.characters = 6;
  var myExportPanel = myWindow.add("panel", undefined, "Export");
  myExportPanel.alignChildren = "left";
  myExportPanel.margins = 20;
  myExportPanel.preferredSize = [340, 75];
  var mySpreadsGroup = myExportPanel.add("group", undefined);
  mySpreadsGroup.alignChildren = "left";
  mySpreadsGroup.orientation = "column";
  mySpreadsGroup.add("radiobutton", undefined, "Pages"); // pages
  mySpreadsGroup.add("radiobutton", undefined, "Spreads"); // spreads
  mySpreadsGroup.children[0].value = true;
  var myImagePanel = myWindow.add("panel", undefined, "Image");
  myImagePanel.orientation = "column";
  myImagePanel.alignChildren = "right";
  myImagePanel.margins = 20;
  myImagePanel.preferredSize = [340, 106];
  var myQualityGroup = myImagePanel.add("group", undefined);
  myQualityGroup.orientation = "row";
  myQualityGroup.add("statictext", undefined, "Quality:");
  var myQualityField = myQualityGroup.add("dropdownlist", undefined, [
    "Maximum",
    "High",
    "Medium",
    "Low"
  ]); // quality
  myQualityField.selection = 2;
  myQualityField.preferredSize = [200, 21];
  var myFormatMethodGroup = myImagePanel.add("group", undefined);
  myFormatMethodGroup.orientation = "row";
  myFormatMethodGroup.add("statictext", undefined, "Format Method:");
  var myFormatMethodField = myFormatMethodGroup.add("dropdownlist", undefined, [
    "Progressive",
    "Baseline"
  ]); // format
  myFormatMethodField.selection = 1;
  myFormatMethodField.preferredSize = [200, 21];
  var myColorSpaceGroup = myImagePanel.add("group", undefined);
  myColorSpaceGroup.orientation = "row";
  myColorSpaceGroup.add("statictext", undefined, "Color Space:");
  var myColorSpaceField = myColorSpaceGroup.add("dropdownlist", undefined, [
    "RGB",
    "CMYK",
    "Gray"
  ]); // color space
  myColorSpaceField.selection = 0;
  myColorSpaceField.preferredSize = [200, 21];
  var myOptionsPanel = myWindow.add("panel", undefined, "Options");
  myOptionsPanel.orientation = "column";
  myOptionsPanel.alignChildren = "left";
  myOptionsPanel.margins = 20;
  myOptionsPanel.preferredSize = [340, 127];
  var myColorProfileField = myOptionsPanel.add(
    "checkbox",
    undefined,
    "\u00A0Embed Color Profile"
  ); // color profile
  myColorProfileField.value = false;
  var myAliasField = myOptionsPanel.add(
    "checkbox",
    undefined,
    "\u00A0Anti-alias"
  ); // anti-alias
  myAliasField.value = true;
  var myBleedField = myOptionsPanel.add(
    "checkbox",
    undefined,
    "\u00A0Use Document Bleed Settings"
  ); // bleed
  var myOverprintField = myOptionsPanel.add(
    "checkbox",
    undefined,
    "\u00A0Simulate Overprint"
  ); // overprint
  var myButtonGroup = myWindow.add("group");
  var myCancelBtn = myButtonGroup.add("button", undefined, "Cancel");
  var myExportBtn = myButtonGroup.add("button", undefined, "Export", {
    name: "ok"
  });
  myExportBtn.onClick = function() {
    // User clicked the OK button
    if (
      (myWidthField.text == "" && myHeightField.text == "") ||
      (myWidthField.text != "" && myHeightField.text != "")
    ) {
      alert("Please enter an export width OR height in pixels"); // User left both width and height blank, or entered both a width and height
    } else {
      if (isNaN(myWidthField.text) || isNaN(myHeightField.text)) {
        alert("Only numbers are allowed in the Width and Height fields"); // User entered a non-number in the width or height fields
      } else {
        exit(); // This onClick function
      }
    }
  };
  if (myWindow.show() == 1) {
    // User didn't click the cancel button
    return [
      myWidthField.text,
      myHeightField.text,
      mySpreadsGroup.children[0].value,
      mySpreadsGroup.children[1].value,
      myQualityField.selection.text,
      myFormatMethodField.selection.text,
      myColorSpaceField.selection.text,
      myColorProfileField.value,
      myAliasField.value,
      myBleedField.value,
      myOverprintField.value
    ];
  } else {
    return; // This dialog function
  }
}

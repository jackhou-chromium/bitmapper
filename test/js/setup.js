/**
 * @license Copyright 2013 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */

/**
 * File holds functions that tests need global access to.
 */


/**
 * How long an async test will run for before it times out and fails.
 */
QUnit.config.testTimeout = 1000;


/**
 * Names div with current test name and appends to debug div.
 * @param {function()} test
 */
QUnit.testStart = function(test) {
  bitmapper_test.currentTestName = test.module + '.' + test.name;
  var testDiv = document.createElement('div');
  testDiv.id = bitmapper_test.currentTestName;
  document.getElementById('debug').appendChild(testDiv);
  var titleDiv = document.createElement('div');
  titleDiv.innerHTML = bitmapper_test.currentTestName;
  testDiv.appendChild(titleDiv);
};


/**
 * Creates canvas for testing and appends to current test div.
 * @return {HTMLElement} testCanvas
 */
bitmapper_test.createCanvas = function() {
  var testCanvas = document.createElement('canvas');
  document.getElementById(bitmapper_test.currentTestName).
      appendChild(testCanvas);
  testCanvas.style.border = 'black solid 1px';
  return testCanvas;
};


/**
 * Initialises color palette and appends to selected test debug div.
 * @param {function()} callback
 * @return {Object}
 */
bitmapper_test.initialiseTestPalette = function(callback) {
  // Create color palette element in debug section.
  var currentTestDiv = document.getElementById(
      bitmapper_test.currentTestName);
  var colorPalette = new bitmapper.ColorPalette(currentTestDiv, callback);
  var initialColors = ['#ff0000', '#ffff00', '#0000ff', '#ff00ff',
    '#cc00ff', '#9900ff', '#ff6600', '#0099ff'];
  colorPalette.generatePalette(initialColors);
  // Allow palette to be seen for visual debugging.
  for (var i = 0; i < initialColors.length; i++) {
    colorPalette.colorDivs[i].style.height = '30px';
    colorPalette.colorDivs[i].style.width = '30px';
  }
  return colorPalette;
};


/**
 * Looks for a file in the app bundle and calls the callback passing in the
 * FileEntry.
 * @param {string} fileName
 * @param {function(FileEntry)} callback
 */
bitmapper_test.getLocalFileEntry = function(fileName, callback) {
  var endsWith = function(string, suffix) {
    return string.indexOf(suffix, string.length - suffix.length) !== -1;
  };

  chrome.runtime.getPackageDirectoryEntry(function(entry) {
    var dirReader = entry.createReader();
    var readEntries = function() {
      dirReader.readEntries(
          function(results) {
            if (!results.length) {
              return;
            }
            var found = false;
            results.forEach(function(fileEntry) {
              if (endsWith(fileEntry.fullPath, fileName)) {
                found = true;
                callback(fileEntry);
              }
            });
            if (!found) {
              readEntries();
            }
          });
    };
    readEntries();
  });
};



/**
 * Mock zoom manager that holds zoom factor.
 * @constructor
 * @struct
 */
bitmapper_test.MockZoomManager = function() {
  this.zoomFactor = 1;
};


/**
 * Get zoom factor method called by selection canvas manager.
 * @return {number}
 */
bitmapper_test.MockZoomManager.prototype.getZoomFactor = function() {
  return this.zoomFactor;
};

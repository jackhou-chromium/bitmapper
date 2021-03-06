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
 * Set up canvases and tools for testing.
 * @return {Object} testContext
 */
bitmapper_test.createCanvasTestContext = function() {
  var width = 100;
  var height = 50;
  var zoomManager = bitmapper_test.initializeZoomManager(width, height);
  var toolContext = bitmapper_test.initializeToolContext(zoomManager, null);
  var colorPalette = bitmapper_test.initializeColorPalette();

  var sizeSelector = {
    value: 1
  };

  var optionProviders =
      /** @struct */ {
        /** @type {ColorPalette} */
        colorPalette: colorPalette,
        /** @type {HTMLElement} */
        sizeSelector: sizeSelector
      };

  zoomManager.setOptionProviders(optionProviders);

  var expectedCanvas = bitmapper_test.createCanvas(width, height);

  var testContext = {
    zoomManager: zoomManager,
    toolContext: toolContext,
    colorPalette: zoomManager.optionProviders.colorPalette,
    expectedCanvas: expectedCanvas,
    checkEqualCanvas: function(reason) {
      var dataURL = toolContext.sourceCanvas.toDataURL();
      var expectedDataURL = expectedCanvas.toDataURL();

      equal(dataURL, expectedDataURL, 'Comparing canvases: ' + reason);
    }
  };



  return testContext;
};


/**
 * Creates canvas for testing and appends to current test div.
 * @param {number} width
 * @param {number} height
 * @return {HTMLElement} testCanvas
 */
bitmapper_test.createCanvas = function(width, height) {
  var testCanvas = document.createElement('canvas');
  document.getElementById(bitmapper_test.currentTestName).
      appendChild(testCanvas);
  testCanvas.width = width;
  testCanvas.height = height;
  testCanvas.style.border = 'black solid 1px';
  return testCanvas;
};


/**
 * Creates MouseCoordinates object with initial x and y coordinates.
 * @param {number} x
 * @param {number} y
 * @return {MouseCoordinates} mouseCoordinates
 */
bitmapper_test.createMouseCoordinates = function(x, y) {
  var mouseCoordinates = new MouseCoordinates();
  mouseCoordinates.sourceX = x;
  mouseCoordinates.sourceY = y;
  return mouseCoordinates;
};


/**
 * Initialises bitmapper tool context, using properties from zoomManager.
 * @param {Object} zoomManager
 * @param {HTMLElement} selectionCanvasManager
 * @return {Object}
 */
bitmapper_test.initializeToolContext = function(
    zoomManager, selectionCanvasManager) {
  var sourceCanvas = zoomManager.getSourceCanvas();
  var displayCanvas = zoomManager.getDisplayCanvas();
  var brushCanvas = zoomManager.getBrushCanvas();
  return new ToolContext(
      sourceCanvas,
      displayCanvas,
      brushCanvas,
      selectionCanvasManager,
      function() { zoomManager.drawDisplayCanvas() });
};


/**
 * Initializes bitmapper zoomManager object by creating appropriate canvases.
 * @param {number} width
 * @param {number} height
 * @return {object}
 */
bitmapper_test.initializeZoomManager = function(width, height) {
  var sourceCanvas = bitmapper_test.createCanvas(width, height);
  var displayCanvas = bitmapper_test.createCanvas(width, height);
  var brushCanvas = bitmapper_test.createCanvas(width, height);
  var canvasViewport = bitmapper_test.createCanvas(width, height);
  var canvasPlaceholder = bitmapper_test.createCanvas(width, height);
  return new bitmapper.ZoomManager(
      sourceCanvas,
      displayCanvas,
      brushCanvas,
      canvasPlaceholder,
      canvasViewport);
};


/**
 * Initializes bitmapper color palette.
 * @return {Object}
 */
bitmapper_test.initializeColorPalette = function() {
  // Create color palette element in debug section.
  var currentTestDiv = document.getElementById(
      bitmapper_test.currentTestName);
  var colorPalette = new bitmapper.ColorPalette();
  var palette = document.createElement('color-palette');
  currentTestDiv.appendChild(palette);
  var initialColors = [
    '#ff0000',
    '#ffff00',
    '#0000ff',
    '#ff00ff',
    '#cc00ff',
    '#9900ff',
    '#ff6600',
    '#0099ff'
  ];
  palette['colors'] = initialColors;
  // Check the background color of each of these and
  // ensure that they have the background color.
  colorPalette.setSelectedCell(currentTestDiv);
  return colorPalette;
};


/**
 * Initialize palette and add core-select event listener to palette.
 * @return {HTMLElement}
 */
bitmapper_test.createPalette = function() {
  var palette = document.createElement('color-palette');
  document.getElementById(
      bitmapper_test.currentTestName).appendChild(palette);
  var initialColors = [
    '#ff0000',
    '#ffff00',
    '#0000ff',
    '#ff00ff',
    '#cc00ff',
    '#9900ff',
    '#ff6600',
    '#0099ff'
  ];
  palette['colors'] = initialColors;
  return palette;
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

/**
 * @license Copyright 2013 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */

/**
 * Draws the image file to the canvas.
 */
bitmapper.setCanvasToImage = function() {
  var image = bitmapper.imageFile.image;
  bitmapper.sourceCanvas.width = image.width;
  bitmapper.sourceCanvas.height = image.height;
  var sourceContext = bitmapper.sourceCanvas.getContext('2d');
  sourceContext.drawImage(image, 0, 0);
  bitmapper.zoomManager.drawDisplayCanvas();
};

/**
 * Displays a file picker and loads the file.
 * Set file entry then load file.
 */
bitmapper.openFile = function() {
  chrome.fileSystem.chooseEntry(
      {
        'type': 'openWritableFile',
        'accepts': [{'description': '*.png', 'extensions': ['png']}]
      },
      function(entry) {
        if (!entry) {
          bitmapper.statusMessage('Nothing selected.');
        } else if (!bitmapper.imageFile) {
          bitmapper.imageFile = new bitmapper.ImageFile();
        } else {
          // Enable save button only if user opens file and doesn't cancel.
          document.getElementById('saveButton').disabled = false;
        }
        bitmapper.zoomManager.setZoomFactor(1);
        bitmapper.imageFile.loadFile(entry, bitmapper.setCanvasToImage);
        // TODO(dadisusila): Handle errors while loading.
        bitmapper.statusMessage(bitmapper.imageFile.fileEntry.name +
                                ' opened.');
      });
};

/**
 * Opens save dialog box and allows user to save image.
 * Set the file entry then save.
 */
bitmapper.saveAsFile = function() {
  chrome.fileSystem.chooseEntry(
      {'type': 'saveFile'},
      function(entry) {
        if (!entry) {
          bitmapper.statusMessage('Nothing selected.');
        } else {
          if (!bitmapper.imageFile)
            bitmapper.imageFile = new bitmapper.ImageFile();
          bitmapper.imageFile.setFileEntry(entry);
          bitmapper.saveFile();
          document.getElementById('saveButton').disabled = false;
        }
      });
};

/**
 * Saves to current file entry.
 */
bitmapper.saveFile = function() {
  // TODO(dadisusila): Handle error cases for saving.
  bitmapper.statusMessage(bitmapper.imageFile.fileEntry.name + ' saved.');
  bitmapper.imageFile.saveFile(bitmapper.sourceCanvas);
};

/**
 * Outputs status message.
 * @param {string} status
 */
bitmapper.statusMessage = function(status) {
  document.getElementById('output').textContent = status;
};

/**
 * Clears the canvas.
 */
bitmapper.clearCanvas = function() {
  var sourceContext = bitmapper.sourceCanvas.getContext('2d');
  sourceContext.clearRect(0, 0, bitmapper.sourceCanvas.width,
      bitmapper.sourceCanvas.height);
  bitmapper.zoomManager.drawDisplayCanvas();
};

/**
 * Scales to double.
 */
bitmapper.zoomIn = function() {
  if (!bitmapper.zoomManager.exceededZoomLimit()) {
    bitmapper.zoomManager.setZoomFactor(
        bitmapper.zoomManager.getZoomFactor() * 2);
    bitmapper.zoomManager.drawDisplayCanvas();
  }
};

/**
 * Scales to half.
 */
bitmapper.zoomOut = function() {
  bitmapper.zoomManager.setZoomFactor(
      bitmapper.zoomManager.getZoomFactor() * 0.5);
  bitmapper.zoomManager.drawDisplayCanvas();
};

/**
 * Gets mouse co-ordinates for source canvas.
 * @param {Event} mouseEvent
 */
bitmapper.mouseMoveCoordinates = function(mouseEvent) {
  bitmapper.mousemove(
      bitmapper.zoomManager.getSourceCoordinate(mouseEvent.offsetX),
      bitmapper.zoomManager.getSourceCoordinate(mouseEvent.offsetY),
      bitmapper.colorPalette.getSelectedColor());
};

/**
 * Gets mouse co-ordinates for source canvas.
 * @param {Event} mouseEvent
 */
bitmapper.mouseDownCoordinates = function(mouseEvent) {
  bitmapper.mousedown(
      bitmapper.zoomManager.getSourceCoordinate(mouseEvent.offsetX),
      bitmapper.zoomManager.getSourceCoordinate(mouseEvent.offsetY),
      bitmapper.colorPalette.getSelectedColor());
};

/**
 * Set background color of selected color box to selected color.
 */
bitmapper.setSelectedColorBox = function() {
  document.getElementById('colorSelector').value =
      bitmapper.rgbToHex(bitmapper.colorPalette.getSelectedColor());
};

/**
 * Changes background of selected cell in palette to selected color.
 * @this {HTMLElement}
 */
bitmapper.updatePalette = function() {
  bitmapper.colorPalette.updateCellColor(
      this.value, bitmapper.colorPalette.getSelectedIndex());
};

/**
 * Entry point.
 */
bitmapper.start = function() {
  bitmapper.displayCanvas = document.getElementById('imageCanvas');
  bitmapper.sourceCanvas = document.getElementById('sourceCanvas');

  document.getElementById('clearButton').onclick = function() {
    bitmapper.clearCanvas();
  };

  var open = document.getElementById('openButton');
  open.addEventListener('click', bitmapper.openFile, false);

  // Create zoom manager at start.
  bitmapper.zoomManager = new bitmapper.ZoomManager(
      bitmapper.sourceCanvas, bitmapper.displayCanvas);

  bitmapper.displayCanvas.addEventListener('mousedown',
      bitmapper.mouseDownCoordinates, false);
  bitmapper.displayCanvas.addEventListener('mousemove',
      bitmapper.mouseMoveCoordinates, false);
  bitmapper.displayCanvas.addEventListener('mouseup',
      bitmapper.mouseup, false);
  bitmapper.displayCanvas.addEventListener('mouseleave',
      bitmapper.mouseup, false);

  var save = document.getElementById('saveButton');
  save.addEventListener('click', bitmapper.saveFile, false);

  var saveAs = document.getElementById('saveAsButton');
  saveAs.addEventListener('click', bitmapper.saveAsFile, false);

  document.getElementById('zoomInButton')
      .addEventListener('click', bitmapper.zoomIn, false);
  document.getElementById('zoomOutButton')
      .addEventListener('click', bitmapper.zoomOut, false);

  // Create color palette at start.
  // Callback sets the color selector box to the selected color.
  bitmapper.colorPalette = new bitmapper.ColorPalette(
      document.getElementById('paletteContainer'),
            bitmapper.setSelectedColorBox);
  var initialColors = ['#000000', '#ffff00', '#0000ff', '#ff00ff',
                      '#cc00ff', '#9900ff', '#ff6600', '#0099ff'];
  bitmapper.colorPalette.generatePalette(initialColors);
  // Set color selector as first color in palette.
  bitmapper.setSelectedColorBox();

  document.getElementById('colorSelector')
     .addEventListener('change', bitmapper.updatePalette, false);
};

/** Closure called when the window finishes loading. */
window.onload = bitmapper.start;

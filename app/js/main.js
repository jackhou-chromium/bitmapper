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
        'accepts': [{'extensions': ['png']}]
      },
      function(entry) {
        if (!bitmapper.imageFile)
          bitmapper.imageFile = new bitmapper.ImageFile();
        bitmapper.zoomManager.setZoomFactor(1);
        bitmapper.imageFile.loadFile(entry, bitmapper.setCanvasToImage);
      });
  // TODO(dadisusila): Make saveButton attribute of bitmapper.
  document.getElementById('saveButton').disabled = false;
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
  bitmapper.imageFile.saveFile(bitmapper.sourceCanvas);
  bitmapper.statusMessage(bitmapper.imageFile.fileEntry.name + ' saved.');
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
  var currentZoomFactor = bitmapper.zoomManager.getZoomFactor();
  bitmapper.zoomManager.setZoomFactor(currentZoomFactor * 2);
  bitmapper.zoomManager.drawDisplayCanvas();
};

/**
 * Scales to half.
 */
bitmapper.zoomOut = function() {
  var currentZoomFactor = bitmapper.zoomManager.getZoomFactor();
  bitmapper.zoomManager.setZoomFactor(currentZoomFactor * 0.5);
  bitmapper.zoomManager.drawDisplayCanvas();
};

/**
 * Gets mouse co-ordinates for source canvas.
 * @param {Event} mouseEvent
 */
bitmapper.mouseMoveCoordinates = function(mouseEvent) {
  bitmapper.mousemove(
      bitmapper.zoomManager.getSourceCoordinate(mouseEvent.offsetX),
      bitmapper.zoomManager.getSourceCoordinate(mouseEvent.offsetY));
};

/**
 * Gets mouse co-ordinates for source canvas.
 * @param {Event} mouseEvent
 */
bitmapper.mouseDownCoordinates = function(mouseEvent) {
  bitmapper.mousedown(
      bitmapper.zoomManager.getSourceCoordinate(mouseEvent.offsetX),
      bitmapper.zoomManager.getSourceCoordinate(mouseEvent.offsetY));
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
};

/** Closure called when the window finishes loading. */
window.onload = bitmapper.start;

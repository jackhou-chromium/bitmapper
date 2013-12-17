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
  bitmapper.canvas.width = image.width;
  bitmapper.canvas.height = image.height;
  var context = bitmapper.canvas.getContext('2d');
  context.drawImage(image, 0, 0);
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
  bitmapper.imageFile.saveFile(bitmapper.canvas);
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
  var context = bitmapper.canvas.getContext('2d');
  context.clearRect(0, 0, bitmapper.canvas.width, bitmapper.canvas.height);
};

/**
 * Entry point.
 */
bitmapper.start = function() {
  document.getElementById('clearButton').onclick = function() {
    bitmapper.clearCanvas();
  };
  var open = document.getElementById('openButton');
  open.addEventListener('click', bitmapper.openFile, false);

  bitmapper.canvas = document.getElementById('imageCanvas');
  bitmapper.canvas.addEventListener('mousedown', bitmapper.mousedown, false);
  bitmapper.canvas.addEventListener('mousemove', bitmapper.mousemove, false);
  bitmapper.canvas.addEventListener('mouseup', bitmapper.mouseup, false);
  bitmapper.canvas.addEventListener('mouseleave', bitmapper.mouseup, false);

  var save = document.getElementById('saveButton');
  save.addEventListener('click', bitmapper.saveFile, false);

  var saveAs = document.getElementById('saveAsButton');
  saveAs.addEventListener('click', bitmapper.saveAsFile, false);
};

/** Closure called when the window finishes loading. */
window.onload = bitmapper.start;

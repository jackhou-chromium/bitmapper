/**
 * Copyright 2013 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */

(function() {

/**
 * Encapsulates data related to one image file.
 * @constructor
 */
function ImageFile() {
  /** @type {FileEntry} */
  this.fileEntry = null;

  /**
   * True if the image is already loaded.
   * @type {boolean}
   */
  this.loaded = false;

  /**
   * The image DOM element.
   * @type {HTMLElement}
   */
  this.image = new Image();
};

/**
 * Sets the current file entry to the given file entry.
 * @param {FileEntry} fileEntry
 */
ImageFile.prototype.setFileEntry = function(fileEntry) {
  this.fileEntry = fileEntry;
};

/**
 * Loads the chosen file entry to the canvas.
 * @param {FileEntry} fileEntry
 * @param {function()} callback
 */
ImageFile.prototype.loadFile = function(fileEntry, callback) {
  this.setFileEntry(fileEntry);

  this.loaded = false;
  var that = this;
  this.image.onload = function() {
    that.loaded = true;
    if (callback) {
      callback();
    }
  };

  this.fileEntry.file(function(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
      that.image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Converts canvas to binary and writes blob to file entry.
 * @param {HTMLElement} canvas
 */
ImageFile.prototype.saveFile = function(canvas) {
  var pngBlob = this.dataURItoBlob(canvas.toDataURL());
  this.fileEntry.createWriter(function(writer) {
    writer.seek(0);
    writer.write(pngBlob);
  });
};

/**
 * Converts URI (canvas image as base64 data) to binary.
 * @param {string} dataURI
 */
ImageFile.prototype.dataURItoBlob = function(dataURI) {
  // Convert base64 to binary. The bytes are represented with Unicode code
  // points from 0x00 to 0xFF.
  var byteString = atob(dataURI.split(',')[1]);
  // Separate out the mime component (e.g., image/png).
  var mimeType = dataURI.split(';')[0].split(':')[1];
  var intArray = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++)
    intArray[i] = byteString.charCodeAt(i);
  // Write array to blob.
  var blob = new Blob([intArray], {'type': mimeType});
  return blob;
};

bitmapper.ImageFile = ImageFile;
})();

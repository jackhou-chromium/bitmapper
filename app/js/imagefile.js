/**
 * @license Copyright 2013 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */



/**
 * @constructor
 * @struct
 */
function ImageFile() {}

(function() {

  /**
   * Encapsulates data related to one image file.
   * @constructor
   * @struct
   */
  function ImageFile() {
    /**
     * Initially set to null and set upon loading a file.
     * @type {FileEntry}
     */
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
    // If user presses Cancel do nothing.
    if (!fileEntry)
      return;

    this.setFileEntry(fileEntry);
    this.loaded = false;
    // Refresh image src so the image loads and triggers the callback.
    this.image.src = '';
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
    // Method toDataURL accepts 'image/png', 'image/jpeg' and 'image/webp'.
    var blob = this.dataURItoBlob(
        canvas.toDataURL(getFileType(this.fileEntry.fullPath)));
    this.fileEntry.createWriter(function(writer) {
      writer.seek(0);
      writer.write(blob);
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

  /**
   * Gets the mime type based on the file extension.
   * Returns "image/jpeg" for .jpg/.jpeg, "image/webp" for .webp and
   * "image/png" in any other case.
   * @return {string}
   */
  function getFileType(filePath) {
    var index = filePath.lastIndexOf('.');
    // If none, default to png.
    var fileType = 'image/png';
    if (index != -1) {
      // Get the filename extension.
      var suffix = filePath.substr(index + 1);
      // Method toDataURL does not recognise 'jpg'.
      if (suffix == 'jpg' || suffix == 'jpeg') {
        fileType = 'image/jpeg';
      } else if (suffix == 'webp') {
        fileType = 'image/webp';
      }
    }
    return fileType;
  }

  bitmapper.getFileType = getFileType;
  bitmapper.ImageFile = ImageFile;
})();

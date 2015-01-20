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
   * Max number of snapshots held in snapshot stack.
   * @const
   */
  ImageFile.MAX_SNAPSHOTS = 10;

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
     * @type {HTMLImageElement}
     */
    this.image = new Image();

    /**
     * Holds current position in snapshot stack.
     * @type {number}
     */
    this.snapshotIndex = -1;

    /**
     * Holds snapshots.
     * @type {Array.<string>}
     */
    this.snapshotStack = [];
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
    var that = this;

    this.fileEntry.file(function(file) {
      var reader = new FileReader();
      reader.onload = function(e) {
        that.image.src = reader.result;
        that.loaded = true;
        // Set image source to png dataURL to deal with internally.
        if (getFileType(fileEntry.fullPath) != 'image/png') {
          var tempCanvas = CreateCanvasElement();
          tempCanvas.width = that.image.width;
          tempCanvas.height = that.image.height;
          Canvas2DContext(tempCanvas).drawImage(that.image, 0, 0);
          that.image.src = tempCanvas.toDataURL();
        }
        if (callback) {
          callback();
        }
      };
      reader.readAsDataURL(file);
    });
  };

  /**
   * Converts canvas to binary and writes blob to file entry.
   * @param {HTMLCanvasElement} canvas
   */
  ImageFile.prototype.saveFile = function(canvas) {
    // The image source holds the saved canvas URI.
    this.image.src = canvas.toDataURL();
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
   * @return {!Blob}
   */
  ImageFile.prototype.dataURItoBlob = function(dataURI) {
    // Convert base64 to binary. The bytes are represented with Unicode code
    // points from 0x00 to 0xFF.
    var byteString = window.atob(dataURI.split(',')[1]);
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
   * @param {string} filePath
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

  /**
   * Returns name of file entry.
   * @return {string}
   */
  ImageFile.prototype.getFileName = function() {
    return this.fileEntry.name;
  };

  /**
   * Compares image source of file entry with given dataURI.
   * @param {HTMLCanvasElement} canvas
   * @return {boolean}
   */
  ImageFile.prototype.matchesOriginal = function(canvas) {
    return (this.image.src == canvas.toDataURL());
  };

  /**
   * Moves backward in stack but doesn't throw away any snapshots.
   * @return {?string}
   */
  ImageFile.prototype.popSnapshot = function() {
    // Snapshot stack is empty.
    if (this.snapshotIndex <= 0)
      return null;

    this.snapshotIndex--;
    return this.snapshotStack[this.snapshotIndex];
  };

  /**
   * Moves forward in stack.
   * @return {?string}
   */
  ImageFile.prototype.unpopSnapshot = function() {
    // No snapshots after current snapshot.
    if (this.snapshotIndex == this.snapshotStack.length - 1)
      return null;

    this.snapshotIndex++;
    return this.snapshotStack[this.snapshotIndex];
  };

  /**
   * Clears snapshots after current index and pushes snapshot to stack.
   * @param {string} dataURI
   */
  ImageFile.prototype.pushSnapshot = function(dataURI) {
    // Return if the canvas has not been dirtied.
    if (dataURI == this.topSnapshot())
      return;

    // If index not at top of stack, overwrite snapshots after current index.
    if (this.snapshotIndex < this.snapshotStack.length - 1) {
      this.snapshotStack.splice(
          this.snapshotIndex + 1, this.snapshotStack.length);
    }

    this.snapshotStack.push(dataURI);

    // Cut off beginning of the stack to limit to max stack size.
    if (this.snapshotStack.length == ImageFile.MAX_SNAPSHOTS + 1) {
      this.snapshotStack.shift();
    } else {
      this.snapshotIndex++;
    }
  };

  /**
   * Returns the top snapshot.
   * @return {?string}
   */
  ImageFile.prototype.topSnapshot = function() {
    return this.snapshotStack[this.snapshotIndex] || null;
  };

  bitmapper.getFileType = getFileType;
  bitmapper.ImageFile = ImageFile;
})();

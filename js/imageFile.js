/**
 * @license Copyright 2013 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */

(function() {

/**
 * Encapsulates data related to one image file.
 * @constructor
 * @param {FileEntry} fileEntry
 * @param {function(FileEntry)} callback
 */
function ImageFile(fileEntry, callback) {
  /** @type {FileEntry} */
  this.fileEntry = fileEntry;

  /**
   * Called when the image is loaded.
   * @type {function()}
   */
  this.callback = callback;

  /**
   * True if the image is already loaded (and callback has already been called).
   * @type {boolean}
   */
  this.loaded = false;

  /**
   * The image DOM element.
   * @type {HTMLElement}
   */
  this.image = new Image();

  // NOTE(jackhou): Anonymous functions capture all variables in the current
  // scope, but 'this' is a keyword, so it will not point to the same thing when
  // the function is executed. A standard workaround is to capture 'this' as a
  // variable.
  // TODO(jackhou): Remove the above comment.
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

bitmapper.ImageFile = ImageFile;
})();

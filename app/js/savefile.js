/**
 * @license Copyright 2013 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */

/**
 * Saving canvas as png.
 */
(function() {
/**
 * Converts URI (canvas image as base64 data) to binary.
 * @param {string} dataURI
 */
function dataURItoBlob(dataURI) {
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
 * Writes blob (png stored as binary) to file entry (.png file).
 * @param {HTMLElement} canvas
 * @param {Entry=} entry
 */
function writeFileEntry(canvas, entry) {
    // Converts canvas to binary
    var pngUri = canvas.toDataURL();
    var pngBlob = dataURItoBlob(pngUri);
    entry.createWriter(function(writer) {
      writer.seek(0);
      writer.write(pngBlob);
    });
}

bitmapper.writeFileEntry = writeFileEntry;
})();

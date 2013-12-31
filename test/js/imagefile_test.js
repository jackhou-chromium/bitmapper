/**
 * @license Copyright 2013 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */

/**
 * Tests loading, opening and saving imageFile.
 */
(function() {

module('ImageFile');

asyncTest('openFile', function() {
  expect(6);
  bitmapper_test.getLocalFileEntry('test-image.png', function(entry) {
    ok(true, 'Got test-image.png FileEntry');
    var imageFile = new bitmapper.ImageFile();
    var callback = function() {
      ok(true, 'Loading image');
      equal(imageFile.loaded, true, 'Successfully loaded');
      ok(imageFile.image.src, 'Image source valid');
      start();
    };
    imageFile.loadFile(entry, callback);
    equal(imageFile.fileEntry, entry,
       'Chosen file entry and global entry equal');
    ok(!imageFile.image.src, 'Starts with no image');
  });
});

test('saveFile', function() {
  var blob1 = bitmapper.ImageFile.prototype.dataURItoBlob(
      'data:image/png;base64,iV');
  equal(blob1.size, 1, 'Blob correct size');
  equal(blob1.type, 'image/png', 'Blob correct type (image/png)');
  var blob2 = bitmapper.ImageFile.prototype.dataURItoBlob(
      'data:image/png;base64,iVbe');
  equal(blob2.size, 3, 'Blob correct size');
  equal(blob2.type, 'image/png', 'Blob correct type (image/png)');
});
})();

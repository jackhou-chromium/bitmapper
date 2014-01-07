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
    imageFile.loadFile(entry, function() {
      // Testing initial loading.
      ok(true, 'Loading image');
      equal(imageFile.loaded, true, 'Successfully loaded');
      ok(imageFile.image.src, 'Image source valid');
      equal(imageFile.fileEntry, entry,
            'Chosen file entry and global entry equal');
      // Load same image again.
      imageFile.loadFile(entry, function() {
        ok(true, 'Callback called again');
        start();
      });
    });
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

/**
 * Check cancel does not run the callback and has not changed anything.
 */
asyncTest('cancelFile', function() {
  expect(4);

  // Load image to canvas
  var canvas = bitmapper_test.createCanvas();
  var context = canvas.getContext('2d');
  bitmapper_test.getLocalFileEntry('test-image.png', function(entry) {
    var imageFile = new bitmapper.ImageFile();

    imageFile.loadFile(entry, function() {
      var srcBeforeCancel = imageFile.image.src;
      // Simulate pressing cancel.
      imageFile.loadFile(undefined, function() {
        ok(false, 'This callback should never run');
      });
      ok(true, 'Passing in undefined entry');
      equal(srcBeforeCancel, imageFile.image.src,
            'Image file sources unchanged');
      ok(imageFile.loaded);
      equal(imageFile.fileEntry, entry, 'File entry is previously loaded file');
      start();
    });
  });
});
})();

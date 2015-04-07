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

    // Load image to canvas.
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
        equal(imageFile.fileEntry, entry,
            'File entry is previously loaded file');
        start();
      });
    });
  });

  test('imageFileType', function() {
    equal(bitmapper.getFileType('/file.png'), 'image/png',
        'Recognises png');
    equal(bitmapper.getFileType('/hello.world.png'), 'image/png',
        'Recognises png');
    equal(bitmapper.getFileType('/file.jpg'), 'image/jpeg',
        'Recognises jpeg');
    equal(bitmapper.getFileType('/file.jpeg'), 'image/jpeg',
        'Recognises jpeg');
    equal(bitmapper.getFileType('/nosuffix'), 'image/png',
        'Defaults to png');
    equal(bitmapper.getFileType('/file.bmp'), 'image/png',
        'Defaults to png');
    equal(bitmapper.getFileType('/file.gif'), 'image/png',
        'Defaults to png');
  });

  /**
   * Check awareness of modified canvas.
   */
  asyncTest('matchesOriginal', function() {
    expect(2);
    // Load jpg image to canvas.
    bitmapper_test.getLocalFileEntry('test-jpg-image.jpg', function(entry) {
      var imageFile = new bitmapper.ImageFile();

      imageFile.loadFile(entry, function() {
        var image = imageFile.image;
        var sourceCanvas =
            bitmapper_test.createCanvas(image.width, image.height);
        sourceCanvas.width = image.width;
        sourceCanvas.height = image.height;
        var sourceContext = sourceCanvas.getContext('2d');
        sourceContext.drawImage(image, 0, 0);

        equal(imageFile.matchesOriginal(sourceCanvas), true);

        // Now draw on canvas and check that it does not match original.
        sourceContext.fillStyle = 'blue';
        sourceContext.fillRect(0, 0, 1, 1);
        equal(imageFile.matchesOriginal(sourceCanvas), false);
        start();
      });
    });
  });

  /**
   * Undo/Redo functionality.
   */
  test('Pop, unpop, push, top snapshot', function() {
    var imageFile = new bitmapper.ImageFile();

    // Initial empty stack.
    equal(imageFile.topSnapshot(), null, 'Top returns null on empty stack');
    equal(imageFile.popSnapshot(), null, 'Pop returns null on empty stack');

    // Undo/Redo sequence.
    imageFile.pushSnapshot('a');
    imageFile.pushSnapshot('b');
    imageFile.pushSnapshot('c');
    equal(imageFile.topSnapshot(), 'c', 'a b [c]');
    equal(imageFile.unpopSnapshot(), null, 'a b [c]');
    equal(imageFile.popSnapshot(), 'b', 'a [b] c');
    equal(imageFile.topSnapshot(), 'b', 'a [b] c');
    equal(imageFile.unpopSnapshot(), 'c', 'a b [c]');
    equal(imageFile.pushSnapshot('d'));
    equal(imageFile.popSnapshot(), 'c', 'a b [c] d');
    equal(imageFile.popSnapshot(), 'b', 'a [b] c d');
    equal(imageFile.pushSnapshot('e'));
    equal(imageFile.topSnapshot(), 'e', 'a b [e]');
    equal(imageFile.unpopSnapshot(), null, 'a b [e]');
    equal(imageFile.popSnapshot(), 'b', 'a [b] e');
    equal(imageFile.popSnapshot(), 'a', '[a] b e');
    equal(imageFile.popSnapshot(), null, '[a] b e');
    equal(imageFile.topSnapshot(), 'a', '[a] b c');
    equal(imageFile.unpopSnapshot(), 'b', 'a [b] c');
  });
})();

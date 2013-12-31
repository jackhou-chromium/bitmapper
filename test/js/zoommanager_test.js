/**
 * @license Copyright 2013 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */

/**
 * Tests zoom.
 */
(function() {

module('ZoomManager');

test('zoomRectangle', function() {
  // Initialise source and display canvases.
  var sourceCanvas = bitmapper_test.createCanvas();
  sourceCanvas.width = 100;
  sourceCanvas.height = 50;

  var displayCanvas = bitmapper_test.createCanvas();
  displayCanvas.width = 100;
  displayCanvas.height = 50;

  // Draw on source canvas.
  var sourceContext = sourceCanvas.getContext('2d');
  sourceContext.fillStyle = 'red';
  sourceContext.fillRect(1, 1, 10, 10);

  // No zoom.
  var zoomManager = new bitmapper.ZoomManager(sourceCanvas, displayCanvas);
  equal(zoomManager.getZoomFactor(), 1, 'Zoom Factor 1');
  equal(displayCanvas.width, 100, 'Display canvas has correct width');
  equal(displayCanvas.height, 50, 'Display canvas has correct height');
  zoomManager.drawDisplayCanvas();
  equal(sourceCanvas.toDataURL(), displayCanvas.toDataURL(),
      'Redraws correctly');

  // Zoom Factor 2.
  var currentZoomFactor = zoomManager.getZoomFactor();
  zoomManager.setZoomFactor(currentZoomFactor * 2);
  equal(zoomManager.getZoomFactor(), 2, 'Zoom Factor 2');
  zoomManager.drawDisplayCanvas();
  equal(displayCanvas.width, 200,
      'Display canvas has correct width');
  equal(displayCanvas.height, 100,
      'Display canvas has correct height');

  // Compare expected canvas with display canvas.
  var expectedCanvas = bitmapper_test.createCanvas();
  expectedCanvas.width = 200;
  expectedCanvas.height = 100;
  var expectedContext = expectedCanvas.getContext('2d');
  expectedContext.fillStyle = 'red';
  expectedContext.fillRect(2, 2, 20, 20);
  equal(expectedCanvas.toDataURL(), displayCanvas.toDataURL(),
      'Zoomed successfully');
});


test('mouseCoordinates', function() {
  var sourceCanvas = bitmapper_test.createCanvas();
  sourceCanvas.width = 100;
  sourceCanvas.height = 50;
  var displayCanvas = bitmapper_test.createCanvas();

  var zoomManager = new bitmapper.ZoomManager(sourceCanvas, displayCanvas);

  // No Zoom.
  ok(true, 'No zoom');
  equal(13, zoomManager.getSourceCoordinate(13), 'Correct X coordinate');
  equal(13, zoomManager.getSourceCoordinate(13), 'Correct Y coordinate');

  // Zoom Factor 8.
  zoomManager.setZoomFactor(8);
  ok(true, 'Zoom Factor 8');
  equal(5, zoomManager.getSourceCoordinate(40), 'Correct X coordinate');
  equal(32, zoomManager.getSourceCoordinate(256), 'Correct Y coordinate');

  // Zoom Factor 0.5
  zoomManager.setZoomFactor(0.5);
  ok(true, 'Zoom Factor 0.5');
  equal(40, zoomManager.getSourceCoordinate(20), 'Correct X coordinate');
  equal(60, zoomManager.getSourceCoordinate(30), 'Correct Y coordinate');
});


test('transparentRectangles', function() {
  var sourceCanvas = bitmapper_test.createCanvas();
  sourceCanvas.width = 100;
  sourceCanvas.height = 100;
  var sourceContext = sourceCanvas.getContext('2d');
  sourceContext.fillStyle = 'rgb(2,132,130)';
  sourceContext.fillRect(10, 10, 50, 50);
  sourceContext.fillStyle = 'rgba(0, 0, 200, 0.5)';
  sourceContext.fillRect(30, 30, 50, 50);
  sourceContext.fillStyle = 'rgba(255, 0, 0, 0.4)';
  sourceContext.fillRect(40, 40, 50, 50);

  var displayCanvas = bitmapper_test.createCanvas();

  // Zoom in.
  var zoomManager = new bitmapper.ZoomManager(sourceCanvas, displayCanvas);
  zoomManager.setZoomFactor(2);
  zoomManager.drawDisplayCanvas();

  // Compare expected canvas with display canvas.
  var expectedCanvas = bitmapper_test.createCanvas();
  expectedCanvas.width = 200;
  expectedCanvas.height = 200;
  var expectedContext = expectedCanvas.getContext('2d');
  expectedContext.fillStyle = 'rgb(2,132,130)';
  expectedContext.fillRect(20, 20, 100, 100);
  expectedContext.fillStyle = 'rgba(0, 0, 200, 0.5)';
  expectedContext.fillRect(60, 60, 100, 100);
  expectedContext.fillStyle = 'rgba(255, 0, 0, 0.4)';
  expectedContext.fillRect(80, 80, 100, 100);

  equal(expectedCanvas.toDataURL(), displayCanvas.toDataURL(),
      'Zoomed transparency successfully');
});


asyncTest('testImage', function() {
  expect(1);
  var sourceCanvas = bitmapper_test.createCanvas();
  var displayCanvas = bitmapper_test.createCanvas();
  var expectedCanvas = bitmapper_test.createCanvas();

  var zoomManager = new bitmapper.ZoomManager(sourceCanvas, displayCanvas);
  zoomManager.setZoomFactor(2);

  // Locate test image and draw onto canvas.
  bitmapper_test.getLocalFileEntry('test-image.png', function(entry) {
    var imageFile = new bitmapper.ImageFile();
    var callback = function() {
      var image = imageFile.image;
      var sourceContext = sourceCanvas.getContext('2d');
      sourceCanvas.width = image.width;
      sourceCanvas.height = image.height;
      sourceContext.drawImage(image, 0, 0);
      zoomManager.drawDisplayCanvas();

      // Load expected image onto expected canvas to compare.
      bitmapper_test.getLocalFileEntry(
          'test-image-zoom.png',
          function(expectedEntry) {
            var expectedImageFile = new bitmapper.ImageFile();
            var expectedCallback = function() {
              var expectedImage = expectedImageFile.image;
              var expectedContext = expectedCanvas.getContext('2d');
              expectedCanvas.width = expectedImage.width;
              expectedCanvas.height = expectedImage.height;
              expectedContext.drawImage(expectedImage, 0, 0);
              start();
            };
            expectedImageFile.loadFile(expectedEntry, expectedCallback);
          });
    };
    imageFile.loadFile(entry, callback);
  });
  equal(expectedCanvas.toDataURL(), displayCanvas.toDataURL(),
      'Zoomed image successfully');
});

test('clearCanvas', function() {
  // Initialise source and display canvases.
  var sourceCanvas = bitmapper_test.createCanvas();
  sourceCanvas.width = 100;
  sourceCanvas.height = 50;
  var sourceContext = sourceCanvas.getContext('2d');
  sourceContext.fillStyle = 'red';
  sourceContext.fillRect(1, 1, 10, 10);

  var displayCanvas = bitmapper_test.createCanvas();

  var zoomManager = new bitmapper.ZoomManager(sourceCanvas, displayCanvas);
  zoomManager.drawDisplayCanvas();

  // Clear source canvas.
  sourceContext.clearRect(0, 0, sourceCanvas.width,
      sourceCanvas.height);
  zoomManager.drawDisplayCanvas();

  var expectedCanvas = bitmapper_test.createCanvas();
  expectedCanvas.width = 100;
  expectedCanvas.height = 50;

  equal(expectedCanvas.toDataURL(), displayCanvas.toDataURL(),
    'Clear successful');

  // Draw after clear to make sure the cleared drawings doesn't get redrawn.
  sourceContext.fillStyle = 'red';
  sourceContext.fillRect(1, 1, 10, 10);
  zoomManager.drawDisplayCanvas();

  var expectedCanvas2 = bitmapper_test.createCanvas();
  expectedCanvas2.width = 100;
  expectedCanvas2.height = 50;
  var expectedCanvas2Context = expectedCanvas2.getContext('2d');
  expectedCanvas2Context.fillStyle = 'red';
  expectedCanvas2Context.fillRect(1, 1, 10, 10);

  equal(expectedCanvas2.toDataURL(), displayCanvas.toDataURL(),
    'Redraw after clear successful');
});
})();

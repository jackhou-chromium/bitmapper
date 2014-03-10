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

  function MockCanvasViewport(clientWidth, clientHeight) {
    this.clientWidth = clientWidth;
    this.clientHeight = clientHeight;
    this.scrollLeft = 0;
    this.scrollTop = 0;
    this.addEventListener = function() {};
  }

  test('zoomRectangle', function() {
    // Initialise source and display canvases.
    var sourceCanvas = bitmapper_test.createCanvas();
    sourceCanvas.width = 100;
    sourceCanvas.height = 50;

    var displayCanvas = bitmapper_test.createCanvas();

    // Draw on source canvas.
    var sourceContext = sourceCanvas.getContext('2d');
    sourceContext.fillStyle = 'red';
    sourceContext.fillRect(1, 1, 10, 10);

    var imagePlaceholder = document.createElement('div');
    var canvasViewport = new MockCanvasViewport(300, 200);

    // No zoom.
    var zoomManager = new bitmapper.ZoomManager(sourceCanvas, displayCanvas,
        imagePlaceholder, canvasViewport);
    equal(zoomManager.getZoomFactor(), 1, 'Zoom Factor 1');
    equal(imagePlaceholder.style.width, '100px',
        'Display canvas has correct width');
    equal(imagePlaceholder.style.height, '50px',
        'Display canvas has correct height');
    zoomManager.drawDisplayCanvas();

    // Compare expected canvas with display canvas.
    var expectedCanvas = bitmapper_test.createCanvas();
    expectedCanvas.width = 300;
    expectedCanvas.height = 200;
    var expectedContext = expectedCanvas.getContext('2d');
    expectedContext.fillStyle = 'red';
    expectedContext.fillRect(1, 1, 10, 10);
    equal(expectedCanvas.toDataURL(), displayCanvas.toDataURL(),
        'Zoomed successfully');

    // Zoom Factor 2.
    zoomManager.setZoomFactor(2, 0, 0);
    equal(zoomManager.getZoomFactor(), 2, 'Zoom Factor 2');
    zoomManager.drawDisplayCanvas();
    equal(imagePlaceholder.style.width, '200px',
        'Display canvas has correct width');
    equal(imagePlaceholder.style.height, '100px',
        'Display canvas has correct height');

    // Compare expected canvas with display canvas.
    expectedCanvas = document.createElement('canvas');
    expectedCanvas.width = 300;
    expectedCanvas.height = 200;
    expectedContext = expectedCanvas.getContext('2d');
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

    var imagePlaceholder = document.createElement('div');
    var canvasViewport = new MockCanvasViewport(300, 200);

    var zoomManager = new bitmapper.ZoomManager(sourceCanvas, displayCanvas,
        imagePlaceholder, canvasViewport);

    // No Zoom.
    ok(true, 'No zoom');
    equal(13, zoomManager.getSourceCoordinate(13), 'Correct X coordinate');
    equal(13, zoomManager.getSourceCoordinate(13), 'Correct Y coordinate');

    // Zoom Factor 8.
    zoomManager.setZoomFactor(8, 0, 0);
    ok(true, 'Zoom Factor 8');
    equal(5, zoomManager.getSourceCoordinate(40), 'Correct X coordinate');
    equal(32, zoomManager.getSourceCoordinate(256), 'Correct Y coordinate');

    // Zoom Factor 0.5
    zoomManager.setZoomFactor(0.5, 0, 0);
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

    var imagePlaceholder = document.createElement('div');
    var canvasViewport = new MockCanvasViewport(200, 200);

    var zoomManager = new bitmapper.ZoomManager(sourceCanvas, displayCanvas,
        imagePlaceholder, canvasViewport);

    // Zoom in.
    zoomManager.setZoomFactor(2, 0, 0);
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


  test('clippedDrawing', function() {
    var sourceCanvas = bitmapper_test.createCanvas();
    sourceCanvas.width = 100;
    sourceCanvas.height = 100;
    var sourceContext = sourceCanvas.getContext('2d');
    sourceContext.fillRect(40, 40, 20, 20);

    var displayCanvas = bitmapper_test.createCanvas();

    var imagePlaceholder = document.createElement('div');
    var canvasViewport = new MockCanvasViewport(100, 100);

    var zoomManager = new bitmapper.ZoomManager(sourceCanvas, displayCanvas,
        imagePlaceholder, canvasViewport);

    // Compare expected canvas with display canvas.
    var expectedCanvas = bitmapper_test.createCanvas();
    expectedCanvas.width = 100;
    expectedCanvas.height = 100;
    var expectedContext = expectedCanvas.getContext('2d');
    expectedContext.fillRect(40, 40, 20, 20);

    equal(expectedCanvas.toDataURL(), displayCanvas.toDataURL(),
          'Square in center');

    // Zoom 2x.
    zoomManager.setZoomFactor(2, 0, 0);
    zoomManager.drawDisplayCanvas();

    expectedCanvas = bitmapper_test.createCanvas();
    expectedCanvas.width = 100;
    expectedCanvas.height = 100;
    expectedContext = expectedCanvas.getContext('2d');
    expectedContext.fillRect(80, 80, 20, 20);

    equal(expectedCanvas.toDataURL(), displayCanvas.toDataURL(),
          'Square in bottom right');

    // Scroll to right.
    canvasViewport.scrollLeft = 100;
    expectedCanvas = bitmapper_test.createCanvas();
    expectedCanvas.width = 100;
    expectedCanvas.height = 100;
    expectedContext = expectedCanvas.getContext('2d');
    expectedContext.fillRect(0, 80, 20, 20);
    zoomManager.drawDisplayCanvas();

    equal(expectedCanvas.toDataURL(), displayCanvas.toDataURL(),
          'Square in bottom left');

    // Scroll to bottom right.
    canvasViewport.scrollLeft = 100;
    canvasViewport.scrollTop = 100;
    expectedCanvas = bitmapper_test.createCanvas();
    expectedCanvas.width = 100;
    expectedCanvas.height = 100;
    expectedContext = expectedCanvas.getContext('2d');
    expectedContext.fillRect(0, 0, 20, 20);
    zoomManager.drawDisplayCanvas();

    equal(expectedCanvas.toDataURL(), displayCanvas.toDataURL(),
          'Square in top left');
  });


  asyncTest('testImage', function() {
    expect(1);
    var sourceCanvas = bitmapper_test.createCanvas();
    var displayCanvas = bitmapper_test.createCanvas();
    var expectedCanvas = bitmapper_test.createCanvas();

    var imagePlaceholder = document.createElement('div');
    var canvasViewport = new MockCanvasViewport(200, 200);

    var zoomManager = new bitmapper.ZoomManager(sourceCanvas, displayCanvas,
        imagePlaceholder, canvasViewport);
    zoomManager.setZoomFactor(2, 0, 0);

    // Locate test image and draw onto canvas.
    bitmapper_test.getLocalFileEntry('test-image.png', function(entry) {
      var imageFile = new bitmapper.ImageFile();
      var callback = function() {
        var image = imageFile.image;
        var sourceContext = sourceCanvas.getContext('2d');
        sourceCanvas.width = image.width;
        sourceCanvas.height = image.height;
        sourceContext.drawImage(image, 0, 0);

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

                canvasViewport.clientWidth = expectedImage.width;
                canvasViewport.clientHeight = expectedImage.height;

                zoomManager.drawDisplayCanvas();
                equal(expectedCanvas.toDataURL(), displayCanvas.toDataURL(),
                    'Zoomed image successfully');
                start();
              };
              expectedImageFile.loadFile(expectedEntry, expectedCallback);
            });
      };
      imageFile.loadFile(entry, callback);
    });
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

    var imagePlaceholder = document.createElement('div');
    var canvasViewport = new MockCanvasViewport(100, 50);

    var zoomManager = new bitmapper.ZoomManager(sourceCanvas, displayCanvas,
        imagePlaceholder, canvasViewport);
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

  test('zoomWithAnchor', function() {
    var sourceCanvas = bitmapper_test.createCanvas();
    sourceCanvas.width = 100;
    sourceCanvas.height = 100;
    var sourceContext = sourceCanvas.getContext('2d');
    sourceContext.fillRect(40, 40, 20, 20);

    var displayCanvas = bitmapper_test.createCanvas();

    var imagePlaceholder = document.createElement('div');
    var canvasViewport = new MockCanvasViewport(100, 100);

    var zoomManager = new bitmapper.ZoomManager(sourceCanvas, displayCanvas,
        imagePlaceholder, canvasViewport);

    // Zoom 2x with center as anchor.
    zoomManager.setZoomFactor(2, 50, 50);
    zoomManager.drawDisplayCanvas();

    var expectedCanvas = bitmapper_test.createCanvas();
    var expectedContext = expectedCanvas.getContext('2d');
    expectedCanvas.width = 100;
    expectedCanvas.height = 100;
    expectedContext = expectedCanvas.getContext('2d');
    expectedContext.fillRect(30, 30, 40, 40);

    equal(expectedCanvas.toDataURL(), displayCanvas.toDataURL());

    // Zoom 2x more with top right as anchor.
    zoomManager.setZoomFactor(4, 150, 50);
    zoomManager.drawDisplayCanvas();

    expectedCanvas = bitmapper_test.createCanvas();
    expectedCanvas.width = 100;
    expectedCanvas.height = 100;
    expectedContext = expectedCanvas.getContext('2d');
    expectedContext.fillRect(0, 60, 40, 40);

    equal(expectedCanvas.toDataURL(), displayCanvas.toDataURL());

    // Zoom back 2x with top left as anchor.
    zoomManager.setZoomFactor(2, 300, 100);
    zoomManager.drawDisplayCanvas();

    expectedCanvas = bitmapper_test.createCanvas();
    expectedCanvas.width = 100;
    expectedCanvas.height = 100;
    expectedContext = expectedCanvas.getContext('2d');
    expectedContext.fillRect(30, 30, 40, 40);

    equal(expectedCanvas.toDataURL(), displayCanvas.toDataURL());
  });
})();

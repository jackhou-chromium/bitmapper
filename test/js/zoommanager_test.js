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

  function FakeCanvasViewport(clientWidth, clientHeight) {
    this.clientWidth = clientWidth;
    this.clientHeight = clientHeight;
    this.scrollLeft = 0;
    this.scrollTop = 0;
    this.addEventListener = function() {};
  }

  test('zoomRectangle', function() {
    // Initialize zoomManager with canvases of initial width 100, height 50.
    var zoomManager = bitmapper_test.initializeZoomManager(100, 50);

    // Set canvasViewport for testing zoom functionality.
    zoomManager.setCanvasViewport(new FakeCanvasViewport(300, 200));

    // Draw onto sourceCanvas.
    var sourceContext = Canvas2DContext(zoomManager.getSourceCanvas());
    // Draw red (#ff0000) rectangle of size 10px by 10px, from coords (1,1).
    sourceContext.fillStyle = 'red';
    sourceContext.fillRect(1, 1, 10, 10);

    // Ensure canvasPlaceholder has correct size.
    var canvasPlaceholder = zoomManager.getCanvasPlaceholder();
    equal(zoomManager.getZoomFactor(), 1, 'Zoom Factor 1');
    equal(canvasPlaceholder.style.width, '100px',
        'Display canvas has correct width');
    equal(canvasPlaceholder.style.height, '50px',
        'Display canvas has correct height');
    zoomManager.drawDisplayCanvas();

    // Compare expected canvas with display canvas.
    var displayCanvas = zoomManager.getDisplayCanvas();
    var expectedCanvas = bitmapper_test.createCanvas(300, 200);
    var expectedContext = Canvas2DContext(expectedCanvas);
    // Expect red (#ff0000) rectangle of size 10px by 10px, from coords (1,1).
    expectedContext.fillStyle = 'red';
    expectedContext.fillRect(1, 1, 10, 10);
    equal(expectedCanvas.toDataURL(), displayCanvas.toDataURL(),
        'Zoomed successfully');

    // Zoom Factor 2.
    zoomManager.setZoomFactor(2, 0, 0);
    equal(zoomManager.getZoomFactor(), 2, 'Zoom Factor 2');
    zoomManager.drawDisplayCanvas();
    // After doubling zoom ('zooming-in'), expect size of canvasPlaceholder
    // to be double of initial values.
    // Initial width = 100px, height = 50px.
    equal(canvasPlaceholder.style.width, '200px',
        'Display canvas has correct width');
    equal(canvasPlaceholder.style.height, '100px',
        'Display canvas has correct height');

    // Compare expected canvas with display canvas.
    expectedCanvas = bitmapper_test.createCanvas(300, 200);
    expectedContext = Canvas2DContext(expectedCanvas);
    // After zoom increase; Expect red (#ff0000) rectangle of size 20px by 20px
    // from coords (2,2).
    expectedContext.fillStyle = 'red';
    expectedContext.fillRect(2, 2, 20, 20);
    equal(expectedCanvas.toDataURL(), displayCanvas.toDataURL(),
        'Zoomed successfully');
  });


  test('mouseCoordinates', function() {
    // Initialise zoomManager with canvases of intial width 100, height 50.
    var zoomManager = bitmapper_test.initializeZoomManager(100, 50);
    // Set canvasViewport for testing zoom functionality.
    zoomManager.setCanvasViewport(new FakeCanvasViewport(300, 200));

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
    // Initialise zoomManager with canvases of intial width 100, height 100.
    var zoomManager = bitmapper_test.initializeZoomManager(100, 100);
    // Set canvasViewport for testing zoom functionality.
    zoomManager.setCanvasViewport(new FakeCanvasViewport(200, 200));

    var displayCanvas = zoomManager.getDisplayCanvas();
    var sourceContext = Canvas2DContext(zoomManager.getSourceCanvas());
    // Draw #028482 rectangle of size 50px by 50px, from coords (10, 10).
    sourceContext.fillStyle = 'rgb(2,132,130)';
    sourceContext.fillRect(10, 10, 50, 50);
    // Draw #000000c8 rectangle of size 50px by 50px, from coords (30, 30).
    sourceContext.fillStyle = 'rgba(0, 0, 200, 0.5)';
    sourceContext.fillRect(30, 30, 50, 50);
    // Draw #ff000066 rectangle of size 50px by 50px, from coords (40, 40).
    sourceContext.fillStyle = 'rgba(255, 0, 0, 0.4)';
    sourceContext.fillRect(40, 40, 50, 50);
    // Zoom in.
    zoomManager.setZoomFactor(2, 0, 0);
    zoomManager.drawDisplayCanvas();

    // Compare expected canvas with display canvas.
    var expectedCanvas = bitmapper_test.createCanvas(200, 200);
    var expectedContext = Canvas2DContext(expectedCanvas);
    // Expect #028482 rectangle of size 100px by 100, from coords (20, 20).
    expectedContext.fillStyle = 'rgb(2,132,130)';
    expectedContext.fillRect(20, 20, 100, 100);
    // Expect #000000c8 rectangle of size 60px by 60px, from coords (60, 60).
    expectedContext.fillStyle = 'rgba(0, 0, 200, 0.5)';
    expectedContext.fillRect(60, 60, 100, 100);
    // Expect #ff000066 rectangle of size 80px by 80px, from coords (80, 80).
    expectedContext.fillStyle = 'rgba(255, 0, 0, 0.4)';
    expectedContext.fillRect(80, 80, 100, 100);

    equal(expectedCanvas.toDataURL(), displayCanvas.toDataURL(),
        'Zoomed transparency successfully');
  });


  test('clippedDrawing', function() {
    // Initialise zoomManager with canvases of intial width 100, height 100.
    var zoomManager = bitmapper_test.initializeZoomManager(100, 100);
    // Set canvasViewport for testing zoom functionality.
    zoomManager.setCanvasViewport(new FakeCanvasViewport(100, 100));
    var canvasViewport = zoomManager.getCanvasViewport();
    var displayCanvas = zoomManager.getDisplayCanvas();
    var sourceContext = Canvas2DContext(zoomManager.getSourceCanvas());
    // Draw #000000 rectangle of size 20px by 20px, from coords (40, 40).
    sourceContext.fillRect(40, 40, 20, 20);
    zoomManager.drawDisplayCanvas();

    // Compare expected canvas with display canvas.
    var expectedCanvas = bitmapper_test.createCanvas(100, 100);
    var expectedContext = Canvas2DContext(expectedCanvas);
    // Expect #000000 rectangle of size 20px by 20px, from coords (40, 40).
    expectedContext.fillRect(40, 40, 20, 20);

    equal(expectedCanvas.toDataURL(), displayCanvas.toDataURL(),
          'Square in center');

    // Zoom 2x.
    zoomManager.setZoomFactor(2, 0, 0);
    zoomManager.drawDisplayCanvas();

    expectedCanvas = bitmapper_test.createCanvas(100, 100);
    expectedContext = Canvas2DContext(expectedCanvas);
    // Expect #000000 rectangle of size 20px by 20px, from coords (80, 80).
    expectedContext.fillRect(80, 80, 20, 20);

    equal(expectedCanvas.toDataURL(), displayCanvas.toDataURL(),
          'Square in bottom right');

    // Scroll to right.
    expectedCanvas = bitmapper_test.createCanvas(100, 100);
    canvasViewport.scrollLeft = 100;
    expectedContext = Canvas2DContext(expectedCanvas);
    // Expect #000000 rectangle of size 20px by 20px, from coords (0, 80).
    expectedContext.fillRect(0, 80, 20, 20);
    zoomManager.drawDisplayCanvas();

    equal(expectedCanvas.toDataURL(), displayCanvas.toDataURL(),
          'Square in bottom left');

    // Scroll to bottom right.
    canvasViewport.scrollLeft = 100;
    canvasViewport.scrollTop = 100;
    expectedCanvas = bitmapper_test.createCanvas(100, 100);
    expectedContext = Canvas2DContext(expectedCanvas);
    // Draw #000000 rectangle of size 20px by 20px, from coords (0, 0).
    expectedContext.fillRect(0, 0, 20, 20);
    zoomManager.drawDisplayCanvas();

    equal(expectedCanvas.toDataURL(), displayCanvas.toDataURL(),
          'Square in top left');
  });


  asyncTest('testImage', function() {
    expect(1);
    // Initialise zoomManager with canvases of intial width 0, height 0.
    var zoomManager = bitmapper_test.initializeZoomManager(0, 0);
    // Set canvasViewport for testing zoom functionality.
    zoomManager.setCanvasViewport(new FakeCanvasViewport(200, 200));
    var expectedCanvas = bitmapper_test.createCanvas(0, 0);
    var canvasViewport = zoomManager.getCanvasViewport();
    var sourceCanvas = zoomManager.getSourceCanvas();
    var displayCanvas = zoomManager.getDisplayCanvas();
    zoomManager.setZoomFactor(2, 0, 0);

    // Locate test image and draw onto canvas.
    bitmapper_test.getLocalFileEntry('test-image.png', function(entry) {
      var imageFile = new bitmapper.ImageFile();
      var callback = function() {
        var image = imageFile.image;
        var sourceContext = Canvas2DContext(sourceCanvas);
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
                var expectedContext = Canvas2DContext(expectedCanvas);
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
    // Initialise zoomManager with canvases of intial width 100, height 50.
    var zoomManager = bitmapper_test.initializeZoomManager(100, 50);
    // Set canvasViewport for testing zoom functionality.
    zoomManager.setCanvasViewport(new FakeCanvasViewport(100, 50));
    var sourceContext = Canvas2DContext(zoomManager.getSourceCanvas());
    // Draw #ff0000 rectangle of size 10px by 10px, from coords (1, 1).
    sourceContext.fillStyle = 'red';
    sourceContext.fillRect(1, 1, 10, 10);

    var displayCanvas = zoomManager.getDisplayCanvas();
    zoomManager.drawDisplayCanvas();

    // Clear source canvas.
    sourceContext.clearRect(0, 0, displayCanvas.width,
        displayCanvas.height);
    zoomManager.drawDisplayCanvas();

    // Expect empty canvas.
    var expectedCanvas = bitmapper_test.createCanvas(100, 50);

    equal(expectedCanvas.toDataURL(), displayCanvas.toDataURL(),
        'Clear successful');

    // Draw after clear to make sure the cleared drawings doesn't get redrawn.
    // Draw #ff0000 rectangle of size 10px by 10px, from coords (1, 1).
    sourceContext.fillStyle = 'red';
    sourceContext.fillRect(1, 1, 10, 10);
    zoomManager.drawDisplayCanvas();

    var expectedCanvas2 = bitmapper_test.createCanvas(100, 50);
    var expectedCanvas2Context = Canvas2DContext(expectedCanvas2);
    // Expect #ff0000 rectangle of size 10px by 10px, from coords (1, 1).
    expectedCanvas2Context.fillStyle = 'red';
    expectedCanvas2Context.fillRect(1, 1, 10, 10);

    equal(expectedCanvas2.toDataURL(), displayCanvas.toDataURL(),
        'Redraw after clear successful');
  });

  test('zoomWithAnchor', function() {
    // Initialise zoomManager with canvases of intial width 100, height 100.
    var zoomManager = bitmapper_test.initializeZoomManager(100, 100);
    // Set canvasViewport for testing zoom functionality.
    zoomManager.setCanvasViewport(new FakeCanvasViewport(100, 100));

    var sourceContext = Canvas2DContext(zoomManager.getSourceCanvas());
    // Draw #000000 rectangle of size 20px by 20px, from coords (40, 40).
    sourceContext.fillRect(40, 40, 20, 20);
    var displayCanvas = zoomManager.getDisplayCanvas();
    // Zoom 2x with center as anchor.
    zoomManager.setZoomFactor(2, 50, 50);
    zoomManager.drawDisplayCanvas();

    var expectedCanvas = bitmapper_test.createCanvas(100, 100);
    var expectedContext = Canvas2DContext(expectedCanvas);
    // Expect #000000 rectangle of size 40px by 40px, from coords (30, 30).
    expectedContext.fillRect(30, 30, 40, 40);

    equal(expectedCanvas.toDataURL(), displayCanvas.toDataURL());

    // Zoom 2x more with top right as anchor.
    zoomManager.setZoomFactor(4, 150, 50);
    zoomManager.drawDisplayCanvas();

    expectedCanvas = bitmapper_test.createCanvas(100, 100);
    expectedContext = Canvas2DContext(expectedCanvas);
    // Expect #000000 rectangle of size 40px by 40px, from coords (0, 60).
    expectedContext.fillRect(0, 60, 40, 40);

    equal(expectedCanvas.toDataURL(), displayCanvas.toDataURL());

    // Zoom back 2x with top left as anchor.
    zoomManager.setZoomFactor(2, 300, 100);
    zoomManager.drawDisplayCanvas();

    expectedCanvas = bitmapper_test.createCanvas(100, 100);
    expectedContext = Canvas2DContext(expectedCanvas);
    // Expect #000000 rectangle of size 40px by 40px, from coords (30, 30).
    expectedContext.fillRect(30, 30, 40, 40);

    equal(expectedCanvas.toDataURL(), displayCanvas.toDataURL());
  });
})();

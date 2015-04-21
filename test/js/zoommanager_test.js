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
    equal(displayCanvas.toDataURL(), expectedCanvas.toDataURL(),
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
    // After zoom increase; the canvas must have a smaller pixel size to fit in
    // the viewport. The red (#ff0000) rectangle should be drawn the same size
    // since we use CSS to scale the displayCanvas.
    expectedCanvas = bitmapper_test.createCanvas(150, 100);
    expectedContext = Canvas2DContext(expectedCanvas);
    expectedContext.fillStyle = 'red';
    expectedContext.fillRect(1, 1, 10, 10);
    equal(displayCanvas.toDataURL(), expectedCanvas.toDataURL(),
        'Zoomed successfully');
  });


  test('mouseCoordinates', function() {
    // Initialise zoomManager with canvases of intial width 100, height 50.
    var zoomManager = bitmapper_test.initializeZoomManager(100, 50);
    // Set canvasViewport for testing zoom functionality.
    zoomManager.setCanvasViewport(new FakeCanvasViewport(300, 200));

    // No Zoom.
    ok(true, 'No zoom');
    equal(zoomManager.getSourceCoordinate(13), 13, 'Correct X coordinate');
    equal(zoomManager.getSourceCoordinate(13), 13, 'Correct Y coordinate');

    // Zoom Factor 8.
    zoomManager.setZoomFactor(8, 0, 0);
    ok(true, 'Zoom Factor 8');
    equal(zoomManager.getSourceCoordinate(40), 5, 'Correct X coordinate');
    equal(zoomManager.getSourceCoordinate(256), 32, 'Correct Y coordinate');

    // Zoom Factor 0.5
    zoomManager.setZoomFactor(0.5, 0, 0);
    ok(true, 'Zoom Factor 0.5');
    equal(zoomManager.getSourceCoordinate(20), 40, 'Correct X coordinate');
    equal(zoomManager.getSourceCoordinate(30), 60, 'Correct Y coordinate');
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

    equal(displayCanvas.toDataURL(), expectedCanvas.toDataURL(),
          'Square in center');

    // Zoom 2x.
    zoomManager.setZoomFactor(2, 0, 0);
    zoomManager.drawDisplayCanvas();

    // The canvas must be smaller at this zoom to fit in the viewport.
    expectedCanvas = bitmapper_test.createCanvas(50, 50);
    expectedContext = Canvas2DContext(expectedCanvas);
    // Expect #000000 rectangle of size 20px by 20px, from coords (40, 40).
    expectedContext.fillRect(40, 40, 20, 20);

    equal(displayCanvas.toDataURL(), expectedCanvas.toDataURL(),
          'Square in bottom right');

    // Scroll to right.
    expectedCanvas = bitmapper_test.createCanvas(50, 50);
    canvasViewport.scrollLeft = 100;
    expectedContext = Canvas2DContext(expectedCanvas);
    // Expect #000000 rectangle of size 10px by 20px, from coords (0, 40).
    expectedContext.fillRect(0, 40, 10, 20);
    zoomManager.drawDisplayCanvas();

    equal(displayCanvas.toDataURL(), expectedCanvas.toDataURL(),
          'Square in bottom left');

    // Scroll to bottom right.
    canvasViewport.scrollLeft = 100;
    canvasViewport.scrollTop = 100;
    expectedCanvas = bitmapper_test.createCanvas(50, 50);
    expectedContext = Canvas2DContext(expectedCanvas);
    // Draw #000000 rectangle of size 10px by 10px, from coords (0, 0).
    expectedContext.fillRect(0, 0, 10, 10);
    zoomManager.drawDisplayCanvas();

    equal(displayCanvas.toDataURL(), expectedCanvas.toDataURL(),
          'Square in top left');
  });


  asyncTest('testImage', function() {
    expect(1);
    // Initialise zoomManager with canvases of intial width 0, height 0.
    var zoomManager = bitmapper_test.initializeZoomManager(0, 0);
    // Set canvasViewport for testing zoom functionality.
    zoomManager.setCanvasViewport(new FakeCanvasViewport(200, 200));
    var expectedCanvas = bitmapper_test.createCanvas(0, 0);
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

        // Since it's zoomed in, only the top left quarter of the image is
        // visible.
        var expectedContext = Canvas2DContext(expectedCanvas);
        expectedCanvas.width = image.width / 2;
        expectedCanvas.height = image.height / 2;
        expectedContext.drawImage(image, 0, 0);

        zoomManager.drawDisplayCanvas();
        equal(displayCanvas.toDataURL(), expectedCanvas.toDataURL(),
            'Zoomed image successfully');
        start();
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

    equal(displayCanvas.toDataURL(), expectedCanvas.toDataURL(),
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

    equal(displayCanvas.toDataURL(), expectedCanvas2.toDataURL(),
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

    // The canvas must be smaller at this zoom to fit in the viewport.
    var expectedCanvas = bitmapper_test.createCanvas(50, 50);
    var expectedContext = Canvas2DContext(expectedCanvas);
    // Expect #000000 rectangle of size 20px by 20px, from coords (15, 15).
    expectedContext.fillRect(15, 15, 20, 20);

    equal(displayCanvas.toDataURL(), expectedCanvas.toDataURL());

    // Zoom 2x more with top right as anchor.
    zoomManager.setZoomFactor(4, 150, 50);
    zoomManager.drawDisplayCanvas();

    expectedCanvas = bitmapper_test.createCanvas(25, 25);
    expectedContext = Canvas2DContext(expectedCanvas);
    // Expect #000000 rectangle of size 10px by 10px, from coords (0, 15).
    expectedContext.fillRect(0, 15, 10, 10);

    equal(displayCanvas.toDataURL(), expectedCanvas.toDataURL());

    // Zoom back 2x with top left as anchor.
    zoomManager.setZoomFactor(2, 300, 100);
    zoomManager.drawDisplayCanvas();

    expectedCanvas = bitmapper_test.createCanvas(50, 50);
    expectedContext = Canvas2DContext(expectedCanvas);
    // Expect #000000 rectangle of size 20px by 20px, from coords (15, 15).
    expectedContext.fillRect(15, 15, 20, 20);

    equal(displayCanvas.toDataURL(), expectedCanvas.toDataURL());
  });
})();

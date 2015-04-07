/**
 * @license Copyright 2015 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */


/**
 * Tests eraser.
 */
(function() {

  module('EraserTool');

  // Test default settings of eraser, opacity at 100%, size is 1.
  test('defaultEraser', function() {
    var zoomManager = bitmapper_test.initializeZoomManager(300, 150);
    var toolContext = bitmapper_test.initializeToolContext(zoomManager, null);
    var colorPalette = bitmapper_test.initializeColorPalette();

    // Set initial color as black (#000000).
    colorPalette.updateCellColor('#000000');

    // Draw at 100% opacity.
    colorPalette.setOpacity(1);
    var sizeSelector = {
      value: 1
    };

    var optionProviders =
        /** @struct */ {
          /** @type {ColorPalette} */
          colorPalette: colorPalette,
          /** @type {HTMLElement} */
          sizeSelector: sizeSelector
        };
    zoomManager.setOptionProviders(optionProviders);

    // Intialize pencil and eraser tools.
    var pencil = new bitmapper.PencilTool(toolContext, optionProviders,
        bitmapper.PencilTool.ToolType.PENCIL);
    var eraser = new bitmapper.PencilTool(toolContext, optionProviders,
        bitmapper.PencilTool.ToolType.ERASER);

    // Use sourceCanvas and sourceContext to draw, and to check against
    // expectedCanvas.
    var sourceCanvas = zoomManager.getSourceCanvas();
    var sourceContext = Canvas2DContext(sourceCanvas);

    // Draw eraser at 100% opacity onto blank canvas.
    var coordinates = new MouseCoordinates();
    coordinates.sourceX = 1;
    coordinates.sourceY = 1;
    eraser.mouseDown(coordinates);
    coordinates.sourceX = 10;
    coordinates.sourceY = 20;
    eraser.mouseMove(coordinates);
    eraser.mouseUp(coordinates);
    // Expect empty canvas.
    var expectedCanvas = bitmapper_test.createCanvas(300, 150);
    equal(expectedCanvas.toDataURL(), sourceCanvas.toDataURL(),
          'Eraser successfully used on blank canvas');

    // Draw horizontal black (#000000) line of length 10 onto sourceCanvas.
    coordinates.sourceX = 1;
    coordinates.sourceY = 1;
    pencil.mouseDown(coordinates);
    coordinates.sourceX = 10;
    pencil.mouseMove(coordinates);
    pencil.mouseUp(coordinates);

    // Expect horizontal black (#000000) line of length 10.
    var expectedData = new Uint8ClampedArray([0, 0, 0, 255]);
    var displayData;
    var sourceContext = Canvas2DContext(zoomManager.getSourceCanvas());
    for (var i = 0; i < 10; i++) {
      displayData = sourceContext.getImageData(i, 0, 1, 1).data;
      deepEqual(displayData, expectedData, 'Line point drawn');
    }
    // NOTE: mouseCoordinates begin at index 1, getImageData begins at index 0.
    var erasedData = new Uint8ClampedArray([0, 0, 0, 0]);
    var currentData;
    var initialData = new Uint8ClampedArray([0, 0, 0, 255]);
    coordinates.sourceX = 1;
    coordinates.sourceY = 1;
    // Erase the horizontal black line drawn from (1, 1) to (10, 1).
    for (var i = 1; i < 11; i++) {
      // Before erasing, check that current pixel is not affected by any
      // previous operations.
      currentData = sourceContext.getImageData(i - 1, 0, 1, 1).data;
      deepEqual(currentData, initialData, 'Line is unchanged');
      eraser.mouseDown(coordinates);
      coordinates.sourceX = i;
      coordinates.sourceY = 1;
      eraser.mouseMove(coordinates);
      eraser.mouseUp(coordinates);
      currentData = sourceContext.getImageData(i - 1, 0, 1, 1).data;
      deepEqual(currentData, erasedData, 'Pixel erased');
    }

    // Expect line to be erased completely (sourceCanvas is blank).
    var expectedContext = Canvas2DContext(expectedCanvas);
    expectedContext.clearRect(0, 0, 300, 150);
    equal(expectedCanvas.toDataURL(), sourceCanvas.toDataURL(),
        'Successfully erased canvas');
  });

  // Use eraser with opacity, test alpha-blending functionality of eraser.
  test('eraseWithOpacity', function() {
    var zoomManager = bitmapper_test.initializeZoomManager(300, 150);
    var toolContext = bitmapper_test.initializeToolContext(zoomManager, null);
    var colorPalette = bitmapper_test.initializeColorPalette();

    // Set initial color as black (#000000).
    colorPalette.updateCellColor('#000000');

    // Draw at 100% opacity.
    colorPalette.setOpacity(1);
    var sizeSelector = {
      value: 1
    };

    var optionProviders =
        /** @struct */ {
          /** @type {ColorPalette} */
          colorPalette: colorPalette,
          /** @type {HTMLElement} */
          sizeSelector: sizeSelector
        };
    zoomManager.setOptionProviders(optionProviders);

    // Intialize pencil and eraser tools.
    var pencil = new bitmapper.PencilTool(toolContext, optionProviders,
        bitmapper.PencilTool.ToolType.PENCIL);
    var eraser = new bitmapper.PencilTool(toolContext, optionProviders,
        bitmapper.PencilTool.ToolType.ERASER);

    // Use sourceCanvas and sourceContext to draw, and to check against
    // expectedCanvas.
    var sourceCanvas = zoomManager.getSourceCanvas();
    var sourceContext = Canvas2DContext(sourceCanvas);

    // Draw horizontal black (#000000) line at 100% opacity.
    var coordinates = new MouseCoordinates();
    coordinates.sourceX = 1;
    coordinates.sourceY = 1;
    pencil.mouseDown(coordinates);
    // Draw line of length 10
    coordinates.sourceX = 10;
    pencil.mouseMove(coordinates);
    pencil.mouseUp(coordinates);

    // Set eraser at 50% opacity.
    colorPalette.setOpacity(0.5);

    // Reset to initial coordinates.
    coordinates.sourceX = 1;
    coordinates.sourceY = 1;
    eraser.mouseDown(coordinates);
    eraser.mouseUp(coordinates);

    var expectedData = new Uint8ClampedArray([0, 0, 0, 127]);
    var currentData = sourceContext.getImageData(0, 0, 1, 1).data;
    // Expect first point to be at 50% opacity, #00000080.
    deepEqual(currentData, expectedData, 'Erased first point with opacity');

    // Draw on first point at 50% opacity.
    eraser.mouseDown(coordinates);
    eraser.mouseUp(coordinates);
    // Increment coordinates:
    coordinates.sourceX = 2;
    coordinates.sourceY = 1;

    // Expect first point to be at 25% opacity, #0000003F.
    expectedData = new Uint8ClampedArray([0, 0, 0, 63]);
    currentData = sourceContext.getImageData(0, 0, 1, 1).data;
    deepEqual(currentData, expectedData, 'Erased over first point again');

    // Erase over remaining component of line, with opacity 0.25
    colorPalette.setOpacity(0.25);
    // Represent erased line at 25% opacity.
    var erasedData = new Uint8ClampedArray([0, 0, 0, 191]);

    // Draw eraser at 25% opacity over remaining component of line.
    eraser.mouseDown(coordinates);
    coordinates.sourceX = 11;
    eraser.mouseMove(coordinates);
    eraser.mouseUp(coordinates);
    for (var i = 3; i < 10; i++) {
      // Expect pixel to be #000000BF.
      currentData = sourceContext.getImageData(i, 0, 1, 1).data;
      deepEqual(currentData, erasedData, 'Pixel erased with opacity');
    }

    // Use eraser on last remaining point.
    eraser.mouseDown(coordinates);
    eraser.mouseUp(coordinates);

    var expectedCanvas = bitmapper_test.createCanvas(300, 150);
    var expectedContext = Canvas2DContext(expectedCanvas);
    // Expected initial point, black point with opacity 25%.
    expectedContext.globalAlpha = '0.25';
    expectedContext.fillStyle = '#000000';
    expectedContext.fillRect(0, 0, 1, 1);

    // Expected remaining portion of line, blank line with opacity 75.
    // Corresponding to globalAlpha value of 0.749.
    expectedContext.globalAlpha = '0.749';
    expectedContext.fillStyle = '#000000';
    expectedContext.fillRect(1, 0, 9, 1);

    equal(expectedCanvas.toDataURL(), sourceCanvas.toDataURL(),
        'Eraser successfully used with opacity on canvas');
  });

  // Use eraser on a point other than the edges of the canvas.
  // ie. near the center of the canvas.
  test('eraseCenter', function() {
    var zoomManager = bitmapper_test.initializeZoomManager(300, 150);
    var toolContext = bitmapper_test.initializeToolContext(zoomManager, null);
    var colorPalette = bitmapper_test.initializeColorPalette();

    // Set initial color as red (#ff0000).
    colorPalette.updateCellColor('#ff0000');

    // Draw at 100% opacity.
    colorPalette.setOpacity(1);
    var sizeSelector = {
      value: 1
    };

    var optionProviders =
        /** @struct */ {
          /** @type {ColorPalette} */
          colorPalette: colorPalette,
          /** @type {HTMLElement} */
          sizeSelector: sizeSelector
        };
    zoomManager.setOptionProviders(optionProviders);

    // Intialize pencil and eraser tools.
    var pencil = new bitmapper.PencilTool(toolContext, optionProviders,
        bitmapper.PencilTool.ToolType.PENCIL);
    var eraser = new bitmapper.PencilTool(toolContext, optionProviders,
        bitmapper.PencilTool.ToolType.ERASER);

    // Draw a diagonal line near center of canvas.
    var coordinates = new MouseCoordinates();
    coordinates.sourceX = 50;
    coordinates.sourceY = 70;
    pencil.mouseDown(coordinates);
    coordinates.sourceX = 59;
    coordinates.sourceY = 79;
    pencil.mouseMove(coordinates);
    pencil.mouseUp(coordinates);

    var sourceContext = Canvas2DContext(zoomManager.getSourceCanvas());
    var imageData;
    // Expect diagonal red (#ff0000) line from point (50, 70).
    var expectedData = new Uint8ClampedArray([255, 0, 0, 255]);
    for (var i = 50; i < 59; i++) {
      imageData = sourceContext.getImageData(i, i + 20, 1, 1).data;
      deepEqual(imageData, expectedData, 'Red pixel successfully drawn');
    }

    // Draw eraser at 100% opacity from point (59,79) to (55, 75).
    eraser.mouseDown(coordinates);
    eraser.mouseUp(coordinates);
    imageData = sourceContext.getImageData(58, 78, 1, 1).data;
    expectedData = new Uint8ClampedArray([0, 0, 0, 0]);
    deepEqual(imageData, expectedData, 'Bottom right pixel erased');

    // Expect remainder of line not to be changed.
    var expectedData = new Uint8ClampedArray([255, 0, 0, 255]);
    for (var i = 50; i < 58; i++) {
      imageData = sourceContext.getImageData(i, i + 20, 1, 1).data;
      deepEqual(imageData, expectedData, 'Red pixel remains unchanged');
    }

    coordinates.sourceX = 50;
    coordinates.sourceY = 70;
    eraser.mouseDown(coordinates);
    coordinates.sourceX = 59;
    coordinates.sourceY = 79;
    eraser.mouseMove(coordinates);
    eraser.mouseUp(coordinates);
    var sourceCanvas = zoomManager.getSourceCanvas();
    // Expect canvas to be empty.
    var expectedCanvas = bitmapper_test.createCanvas(300, 150);
    deepEqual(expectedCanvas.toDataURL(), sourceCanvas.toDataURL(),
        'Eraser tool successfully used in center of canvas');
  });


  // Testing eraser on a filled canvas.
  test('eraseFilledRectangle', function() {
    var zoomManager = bitmapper_test.initializeZoomManager(300, 150);
    var toolContext = bitmapper_test.initializeToolContext(zoomManager, null);
    var colorPalette = bitmapper_test.initializeColorPalette();

    // Set initial color as red (#ff0000).
    colorPalette.updateCellColor('#ff0000');

    // Draw at 100% opacity.
    colorPalette.setOpacity(1);
    var sizeSelector = {
      value: 1
    };

    var optionProviders =
        /** @struct */ {
          /** @type {ColorPalette} */
          colorPalette: colorPalette,
          /** @type {HTMLElement} */
          sizeSelector: sizeSelector
        };
    zoomManager.setOptionProviders(optionProviders);

    var eraser = new bitmapper.PencilTool(toolContext, optionProviders,
        bitmapper.PencilTool.ToolType.ERASER);
    var sourceCanvas = zoomManager.getSourceCanvas();
    var sourceContext = Canvas2DContext(sourceCanvas);

    // Fill canvas (W: 300, H: 150) with red (#ff0000) at 100% opacity.
    sourceContext.fillStyle = 'rgba(255, 0, 0, 1)';
    sourceContext.fillRect(0, 0, 300, 150);

    // Use eraser from top left edge to bottom left edge.
    var coordinates = new MouseCoordinates();
    coordinates.sourceX = 1;
    coordinates.sourceY = 1;
    eraser.mouseDown(coordinates);
    coordinates.sourceY = 150;
    eraser.mouseMove(coordinates);
    eraser.mouseUp(coordinates);

    // Expect red (#ff0000) rectangle with left edge cut off.
    // Rectangle with W:299, H:150 starting from the point (1, 0).
    var expectedCanvas = bitmapper_test.createCanvas(300, 150);
    var expectedContext = Canvas2DContext(expectedCanvas);
    expectedContext.fillStyle = 'rgba(255, 0, 0, 1)';
    expectedContext.fillRect(1, 0, 299, 150);
    deepEqual(sourceCanvas.toDataURL(), expectedCanvas.toDataURL(),
        'Eraser successfully used on filled canvas');

    // Testing eraser with opacity on a filled canvas.
    colorPalette.setOpacity(0.5);
    coordinates.sourceX = 3;
    coordinates.sourceY = 1;
    eraser.mouseDown(coordinates);
    coordinates.sourceY = 150;
    eraser.mouseMove(coordinates);
    eraser.mouseUp(coordinates);

    // Expect red (#ff000080) at opacity 0.5 of column width 1
    // from point (2, 0).
    var expectedCanvas = bitmapper_test.createCanvas(300, 150);
    expectedContext = Canvas2DContext(expectedCanvas);
    expectedContext.fillStyle = 'rgba(255, 0, 0, 1)';
    expectedContext.fillRect(1, 0, 1, 150);
    expectedContext.fillStyle = 'rgba(255, 0, 0, 0.5)';
    expectedContext.fillRect(2, 0, 1, 150);
    expectedContext.fillStyle = 'rgba(255, 0, 0, 1)';
    expectedContext.fillRect(3, 0, 297, 150);
    deepEqual(sourceCanvas.toDataURL(), expectedCanvas.toDataURL(),
        'eraser with opacity successfully used on eraser tool');

    // Fill canvas (W: 300, H: 150) to with red (#ff0000) at
    // 100% opacity.
    sourceContext.fillStyle = 'rgba(255, 0, 0, 1)';
    sourceContext.fillRect(0, 0, 300, 150);

    // Test eraser using size 5 and default opacity value.
    colorPalette.setOpacity(1);
    eraser.setSize(5);
    coordinates.sourceX = 1;
    // Start drawing eraser at sourceY == 3, as penciltool sets initial value
    // of y coordinate as: Math.floor(y0 - sizeSelector.value/2).
    coordinates.sourceY = 3;

    // Erase horizontally across top of canvas, with eraser size 5.
    eraser.mouseDown(coordinates);
    coordinates.sourceX = 300;
    eraser.mouseMove(coordinates);
    eraser.mouseUp(coordinates);

    // Expect red (#ff0000) canvas with W:300, H:150, from point (0, 5).
    expectedCanvas = bitmapper_test.createCanvas(300, 150);
    expectedContext = Canvas2DContext(expectedCanvas);
    expectedContext.fillStyle = 'rgba(255, 0, 0, 1)';
    expectedContext.fillRect(0, 5, 300, 145);
    sourceCanvas = zoomManager.getSourceCanvas();
    deepEqual(sourceCanvas.toDataURL(), expectedCanvas.toDataURL(),
        'Successfully used eraser with size');
  });
})();

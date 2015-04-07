/**
 * @license Copyright 2014 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */


/**
 * Tests pencil.
 */
(function() {

  module('PencilTool');

  test('pixelTransparency', function() {
    var width = 100;
    var height = 50;
    var zoomManager = bitmapper_test.initializeZoomManager(width, height);
    var toolContext = bitmapper_test.initializeToolContext(zoomManager, null);
    var colorPalette = bitmapper_test.initializeColorPalette();
    var initialOpacity = 0.5;
    var colors = [
      '#ff0000',
      '#ffff00',
      '#0000ff',
      '#ff00ff',
      '#cc00ff',
      '#9900ff',
      '#ff6600',
      '#0099ff'
    ];
    colorPalette.updateCellColor(colors[0]);
    colorPalette.setOpacity(initialOpacity);

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
    var pencil = new bitmapper.PencilTool(toolContext, optionProviders,
        bitmapper.PencilTool.ToolType.PENCIL);
    var coordinates = new MouseCoordinates();
    coordinates.sourceX = 1;
    coordinates.sourceY = 1;

    // Canvas background is fully transparent (#00000000).
    // Drawing red at opacity 0.5 (#ff000080).
    // Expect red at opacity 0.5 (#ff000080).
    var expectedOpacity = 128;
    var expectedData = new Uint8ClampedArray([255, 0, 0, expectedOpacity]);

    // Drawing a single point on the canvas.
    pencil.mouseDown(coordinates);
    var displayCanvas = zoomManager.getDisplayCanvas();
    var ctx = displayCanvas.getContext('2d');
    var imageData = ctx.getImageData(0, 0, 1, 1).data;
    deepEqual(imageData, expectedData, 'Pixel drawn');

    pencil.mouseUp();
    imageData = ctx.getImageData(0, 0, 1, 1).data;
    deepEqual(imageData, expectedData, 'Pixel drawn');

    // Draw on the same point on the canvas.
    // Check that the transparency is changed.
    pencil.mouseDown(coordinates);
    // Canvas background is red at opacity 0.5 (#ff000080).
    // Drawing red at opacity 0.5 (#ff000080).
    // Expect red at opacity 0.75 (#ff0000c0).
    expectedData = new Uint8ClampedArray([255, 0, 0, 192]);
    imageData = ctx.getImageData(0, 0, 1, 1).data;
    deepEqual(imageData, expectedData, 'Transparency retained');

    pencil.mouseUp(coordinates);
    imageData = ctx.getImageData(0, 0, 1, 1).data;
    deepEqual(imageData, expectedData, 'Transparency retained');
  });

  test('diagonalLine', function() {
    var width = 100;
    var height = 50;
    var zoomManager = bitmapper_test.initializeZoomManager(width, height);
    var toolContext = bitmapper_test.initializeToolContext(zoomManager, null);
    var colorPalette = bitmapper_test.initializeColorPalette();
    var colors = [
      '#ff0000',
      '#ffff00',
      '#0000ff',
      '#ff00ff',
      '#cc00ff',
      '#9900ff',
      '#ff6600',
      '#0099ff'
    ];
    colorPalette.updateCellColor(colors[0]);
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

    var pencil =
        new bitmapper.PencilTool(
        toolContext,
        optionProviders,
        bitmapper.PencilTool.ToolType.PENCIL);

    var coordinates = new MouseCoordinates();
    coordinates.sourceX = 10;
    coordinates.sourceY = 10;

    // Draw a diagonal line
    pencil.mouseDown(coordinates);
    coordinates.sourceX = 20;
    coordinates.sourceY = 20;
    pencil.mouseMove(coordinates);
    pencil.mouseUp(coordinates);
    var sourceCanvas = zoomManager.getSourceCanvas();
    var ctx = sourceCanvas.getContext('2d');
    var imageData;
    var expectedData = new Uint8ClampedArray([255, 0, 0, 255]);
    var transparentPixel = new Uint8ClampedArray([0, 0, 0, 0]);
    // Checks that each pixel in the line is filled.
    // Checks that the neighbouring pixels are untouched.
    for (var i = 10; i < 20; i++) {
      imageData = ctx.getImageData(i, i, 1, 1).data;
      deepEqual(imageData, expectedData, 'Pixel filled');
      imageData = ctx.getImageData(i - 1, i, 1, 1).data;
      deepEqual(imageData, transparentPixel, 'Transparent pixel');
      imageData = ctx.getImageData(i + 1, i, 1, 1).data;
      deepEqual(imageData, transparentPixel, 'Transparent pixel');
    }
  });

  test('size', function() {
    var width = 100;
    var height = 50;
    var zoomManager = bitmapper_test.initializeZoomManager(width, height);
    var toolContext = bitmapper_test.initializeToolContext(zoomManager, null);
    var colorPalette = bitmapper_test.initializeColorPalette();
    var colors = [
      '#ff0000',
      '#ffff00',
      '#0000ff',
      '#ff00ff',
      '#cc00ff',
      '#9900ff',
      '#ff6600',
      '#0099ff'
    ];
    colorPalette.updateCellColor(colors[0]);
    var sizeSelector = {
      value: 5
    };

    var optionProviders =
        /** @struct */ {
          /** @type {ColorPalette} */
          colorPalette: colorPalette,
          /** @type {HTMLElement} */
          sizeSelector: sizeSelector
        };
    zoomManager.setOptionProviders(optionProviders);

    var pencil = new bitmapper.PencilTool(toolContext, optionProviders,
        bitmapper.PencilTool.ToolType.PENCIL);

    var coordinates = new MouseCoordinates();
    coordinates.sourceX = 10;
    coordinates.sourceY = 10;

    // Draw a point with height and width of 5 px.
    pencil.mouseDown(coordinates);
    pencil.mouseUp(coordinates);

    var sourceCanvas = zoomManager.getSourceCanvas();
    var ctx = sourceCanvas.getContext('2d');
    var imageData;
    var expectedData = new Uint8ClampedArray([255, 0, 0, 255]);
    var transparentPixel = new Uint8ClampedArray([0, 0, 0, 0]);
    // Checks that the right number of pixels are filled.
    for (var i = 7; i < 12; i++) {
      for (var j = 7; j < 12; j++) {
        imageData = ctx.getImageData(i, j, 1, 1).data;
        deepEqual(imageData, expectedData, 'Pixel filled');
      }
    }
    // Checks that the neighbouring pixels are untouched.
    for (var i = 6; i < 13; i++) {
      imageData = ctx.getImageData(i, 6, 1, 1).data;
      deepEqual(imageData, transparentPixel, 'Transparent Pixel');
      imageData = ctx.getImageData(i, 13, 1, 1).data;
      deepEqual(imageData, transparentPixel, 'Transparent Pixel');
      imageData = ctx.getImageData(6, i, 1, 1).data;
      deepEqual(imageData, transparentPixel, 'Transparent Pixel');
      imageData = ctx.getImageData(13, i, 1, 1).data;
      deepEqual(imageData, transparentPixel, 'Transparent Pixel');
    }
  });

})();

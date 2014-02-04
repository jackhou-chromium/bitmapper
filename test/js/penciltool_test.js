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
    var canvas = bitmapper_test.createCanvas();
    canvas.width = 100;
    canvas.height = 50;

    var toolContext = new ToolContext(canvas, null, function() {});
    var colorPalette = bitmapper_test.initialiseTestPalette(function() {});
    colorPalette.setSelectedIndex(0);
    colorPalette.setOpacity(0.5);

    var optionProviders =
        /** @struct */ {
          /** @type {ColorPalette} */
          colorPalette: colorPalette
        };

    var pencil = new bitmapper.PencilTool(toolContext, optionProviders);

    var coordinates = new MouseCoordinates();
    coordinates.sourceX = 0;
    coordinates.sourceY = 0;

    var expectedData = new Uint8ClampedArray([255, 0, 0, 127]);

    // Drawing a single point on the canvas.
    pencil.mouseDown(coordinates);
    var ctx = canvas.getContext('2d');
    var imageData = ctx.getImageData(0, 0, 1, 1).data;
    deepEqual(imageData, expectedData, 'Pixel drawn');

    pencil.mouseUp();
    imageData = ctx.getImageData(0, 0, 1, 1).data;
    deepEqual(imageData, expectedData, 'Pixel drawn');

    // Draw on the same point on the canvas.
    // Check that the transparency is overwritten.
    pencil.mouseDown(coordinates);
    imageData = ctx.getImageData(0, 0, 1, 1).data;
    deepEqual(imageData, expectedData, 'Transparency retained');

    pencil.mouseUp(coordinates);
    imageData = ctx.getImageData(0, 0, 1, 1).data;
    deepEqual(imageData, expectedData, 'Transparency retained');
  });

  test('diagonalLine', function() {
    var canvas = bitmapper_test.createCanvas();
    canvas.width = 100;
    canvas.height = 50;

    var toolContext = new ToolContext(canvas, null, function() {});
    var colorPalette = bitmapper_test.initialiseTestPalette(function() {});

    var optionProviders =
        /** @struct */ {
          /** @type {ColorPalette} */
          colorPalette: colorPalette
        };

    var pencil = new bitmapper.PencilTool(toolContext, optionProviders);

    var coordinates = new MouseCoordinates();
    coordinates.sourceX = 10;
    coordinates.sourceY = 10;

    // Draw a diagonal line
    pencil.mouseDown(coordinates);
    coordinates.sourceX = 20;
    coordinates.sourceY = 20;
    pencil.mouseMove(coordinates);
    pencil.mouseUp(coordinates);

    var ctx = canvas.getContext('2d');
    var imageData;
    var expectedData = new Uint8ClampedArray([255, 0, 0, 255]);
    var transparentPixel = new Uint8ClampedArray([0, 0, 0, 0]);
    // Checks that each pixel in the line is filled.
    // Checks that the neighbouring pixels are untouched.
    for (var i = 10; i <= 20; i++) {
      imageData = ctx.getImageData(i, i, 1, 1).data;
      deepEqual(imageData, expectedData, 'Pixel filled');
      imageData = ctx.getImageData(i - 1, i, 1, 1).data;
      deepEqual(imageData, transparentPixel, 'Transparent pixel');
      imageData = ctx.getImageData(i + 1, i, 1, 1).data;
      deepEqual(imageData, transparentPixel, 'Transparent pixel');
    }
  });

})();

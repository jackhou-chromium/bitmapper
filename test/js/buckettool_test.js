/**
 * @license Copyright 2014 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */


/**
 * Tests bucket.
 */
(function() {

  module('BucketTool');

  test('bucketFill', function() {
    var canvas = bitmapper_test.createCanvas();

    // Draw a complex shape.
    var context = canvas.getContext('2d');
    context.fillStyle = 'black';
    context.fillRect(2, 2, 20, 20);
    context.fillRect(22, 10, 50, 5);
    context.fillRect(40, 15, 5, 50);

    var toolContext = new ToolContext(canvas, null, null, function() {});
    var colorPalette = bitmapper_test.initialiseTestPalette(function() {});
    colorPalette.setSelectedIndex(0);
    colorPalette.setOpacity(0.5);

    var optionProviders =
        /** @struct */ {
          /** @type {ColorPalette} */
          colorPalette: colorPalette
        };

    var bucket = new bitmapper.BucketTool(toolContext, optionProviders);

    var coordinates = new MouseCoordinates();
    coordinates.sourceX = 5;
    coordinates.sourceY = 5;

    // Fill the rectangle.
    bucket.mouseDown(coordinates);

    // Filling the same color.
    bucket.mouseDown(coordinates);

    var expectedCanvas = bitmapper_test.createCanvas();
    var expectedContext = expectedCanvas.getContext('2d');
    expectedContext.fillStyle = 'rgba(255, 0, 0, 0.5)';
    expectedContext.fillRect(2, 2, 20, 20);
    expectedContext.fillRect(22, 10, 50, 5);
    expectedContext.fillRect(40, 15, 5, 50);

    deepEqual(canvas.toDataURL(), expectedCanvas.toDataURL(), 'Bucket fill');
  });

})();

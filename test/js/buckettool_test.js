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
    var testContext = bitmapper_test.createCanvasTestContext();

    testContext.colorPalette.updateCellColor('#ff0000');
    testContext.colorPalette.setOpacity(0.5);

    var bucket = new bitmapper.BucketTool(testContext.toolContext,
        testContext.zoomManager.optionProviders);

    var coordinates = bitmapper_test.createMouseCoordinates(2, 2);

    // Fill the rectangle.
    bucket.mouseDown(coordinates);

    var ctx = Canvas2DContext(testContext.expectedCanvas);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fillRect(0, 0, 100, 50);

    testContext.checkEqualCanvas('Bucket fill');
  });

  test('shapeFill', function() {
    var testContext = bitmapper_test.createCanvasTestContext();

    testContext.colorPalette.updateCellColor('#ff0000');

    var bucket = new bitmapper.BucketTool(testContext.toolContext,
        testContext.zoomManager.optionProviders);

    var sourceCtx = Canvas2DContext(testContext.zoomManager.sourceCanvas);
    sourceCtx.fillStyle = 'black';
    sourceCtx.fillRect(2, 2, 20, 20);
    sourceCtx.fillRect(22, 10, 50, 5);
    sourceCtx.fillRect(40, 15, 5, 50);

    // Fill the rectangle.
    bucket.mouseDown(bitmapper_test.createMouseCoordinates(5, 5));

    var ctx = Canvas2DContext(testContext.expectedCanvas);
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(2, 2, 20, 20);
    ctx.fillRect(22, 10, 50, 5);
    ctx.fillRect(40, 15, 5, 50);

    testContext.checkEqualCanvas('Bucket fill');
  });

})();

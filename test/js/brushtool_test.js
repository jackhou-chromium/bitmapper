/**
 * @license Copyright 2014 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */


/**
 * Tests brush.
 */
(function() {

  module('BrushTool');

  test('drawLinesOnCanvas', function() {
    var testContext = bitmapper_test.createCanvasTestContext();

    var brush = new bitmapper.PencilTool(testContext.toolContext,
        testContext.zoomManager.optionProviders,
        bitmapper.PencilTool.ToolType.BRUSH);

    // Set initial color to red (#ff0000).
    testContext.colorPalette.updateCellColor('#ff0000');

    var ctx = Canvas2DContext(testContext.expectedCanvas);
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 1;

    var startPoint = bitmapper_test.createMouseCoordinates(0, 0);
    var midPoint = bitmapper_test.createMouseCoordinates(20, 25);
    var endPoint = bitmapper_test.createMouseCoordinates(10, 15);

    // Draw first line on canvases.
    brush.mouseDown(startPoint);
    brush.mouseMove(midPoint);
    brush.mouseUp(midPoint);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(20, 25);
    ctx.stroke();

    testContext.checkEqualCanvas('One line');

    // Draw second line on canvases.
    brush.mouseDown(midPoint);
    brush.mouseMove(endPoint);
    brush.mouseUp(endPoint);

    ctx.beginPath();
    ctx.moveTo(20, 25);
    ctx.lineTo(10, 15);
    ctx.stroke();

    testContext.checkEqualCanvas('Two lines');

  });

  test('noClick', function() {
    var testContext = bitmapper_test.createCanvasTestContext();

    var brush = new bitmapper.PencilTool(testContext.toolContext,
        testContext.zoomManager.optionProviders,
        bitmapper.PencilTool.ToolType.BRUSH);

    // Move without clicking.
    brush.mouseMove(bitmapper_test.createMouseCoordinates(30, 30));

    testContext.checkEqualCanvas('Mouse move');
  });

  test('drawLineTwice', function() {
    var testContext = bitmapper_test.createCanvasTestContext();

    var brush = new bitmapper.PencilTool(testContext.toolContext,
        testContext.zoomManager.optionProviders,
        bitmapper.PencilTool.ToolType.BRUSH);

    // Set initial color to blue (#0000ff).
    testContext.colorPalette.updateCellColor('#0000ff');

    var ctx = Canvas2DContext(testContext.expectedCanvas);
    ctx.strokeStyle = '#0000ff';
    ctx.lineWidth = 1;

    var startPoint = bitmapper_test.createMouseCoordinates(0, 50);
    var endPoint = bitmapper_test.createMouseCoordinates(50, 50);

    // Draw line from startPoint to endPoint twice.
    brush.mouseDown(startPoint);
    brush.mouseMove(endPoint);
    brush.mouseUp(endPoint);

    brush.mouseDown(startPoint);
    brush.mouseMove(endPoint);
    brush.mouseUp(endPoint);

    // Draw two lines from (0, 50) to (50, 50).
    // Expect one line from (0, 50) to (50, 50).
    ctx.beginPath();
    ctx.moveTo(0, 50);
    ctx.lineTo(50, 50);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 50);
    ctx.lineTo(50, 50);
    ctx.stroke();

    testContext.checkEqualCanvas('Same line twice');
  });

})();

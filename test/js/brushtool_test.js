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

    var ctx = Canvas2DContext(testContext.expectedCanvas);
    ctx.lineCap = 'round';  // Brush.

    // Set initial color to red (#ff0000).
    testContext.colorPalette.updateCellColor('#ff0000');
    ctx.fillStyle = '#ff0000';
    ctx.strokeStyle = '#ff0000';

    // Set brush size.
    var brushSize = 2;
    brush.setSize(brushSize);
    ctx.lineWidth = brushSize;

    var startPoint = bitmapper_test.createMouseCoordinates(10, 5);
    var midPoint = bitmapper_test.createMouseCoordinates(25, 20);
    var endPoint = bitmapper_test.createMouseCoordinates(10, 15);

    // Draw first line on canvases.
    brush.mouseDown(startPoint);
    brush.mouseMove(midPoint);
    brush.mouseUp(midPoint);

    // Simulate mouseDown.
    ctx.moveTo(10, 5);
    ctx.arc(10, 5, brushSize / 2, 0, 2 * Math.PI, false);
    ctx.fill();
    // Simulate mouseMove.
    ctx.beginPath();
    ctx.moveTo(10, 5);
    ctx.lineTo(25, 20);
    ctx.stroke();

    testContext.checkEqualCanvas('One line');

    // Draw second line on canvases.
    brush.mouseDown(midPoint);
    brush.mouseMove(endPoint);
    brush.mouseUp(endPoint);

    // Simulate mouseDown.
    ctx.moveTo(25, 20);
    ctx.arc(25, 20, brushSize / 2, 0, 2 * Math.PI, false);
    ctx.fill();
    // Simulate mouseMove.
    ctx.beginPath();
    ctx.moveTo(25, 20);
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

    var ctx = Canvas2DContext(testContext.expectedCanvas);

    // Set initial color to blue (#0000ff).
    testContext.colorPalette.updateCellColor('#0000ff');
    ctx.fillStyle = '#0000ff';
    ctx.strokeStyle = '#0000ff';

    // Set brush size.
    var brushSize = 1;
    brush.setSize(brushSize);
    ctx.lineWidth = brushSize;

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
    // Simulate mouseDown.
    ctx.moveTo(0, 50);
    ctx.arc(0, 50, brushSize / 2, 0, 2 * Math.PI, false);
    ctx.fill();
    // Simulate mouseMove.
    ctx.beginPath();
    ctx.moveTo(0, 50);
    ctx.lineTo(50, 50);
    ctx.stroke();

    // Simulate mouseDown.
    ctx.moveTo(0, 50);
    ctx.arc(0, 50, brushSize / 2, 0, 2 * Math.PI, false);
    ctx.fill();
    // Simulate mouseMove.
    ctx.beginPath();
    ctx.moveTo(0, 50);
    ctx.lineTo(50, 50);
    ctx.stroke();

    testContext.checkEqualCanvas('Same line twice');
  });

})();

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

  test('drawOnCanvas', function() {
    // Draw using brush tool.
    var canvas = bitmapper_test.createCanvas();
    canvas.width = 100;
    canvas.height = 50;

    var toolContext = new ToolContext(canvas, null, null, function() {});
    var colorPalette = bitmapper_test.initialiseTestPalette(function() {});
    colorPalette.setSelectedIndex(0);

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

    var brush = new bitmapper.BrushTool(toolContext, optionProviders);

    var coordinates = new MouseCoordinates();
    coordinates.sourceX = 0;
    coordinates.sourceY = 0;
    brush.mouseDown(coordinates);

    coordinates.sourceX = 20;
    coordinates.sourceY = 25;
    brush.mouseMove(coordinates);

    coordinates.sourceX = 10;
    coordinates.sourceY = 15;
    brush.mouseMove(coordinates);
    brush.mouseUp(coordinates);

    // Mousedown and then mouseup on the same point.
    coordinates.sourceX = 30;
    coordinates.sourceY = 30;
    brush.mouseDown(coordinates);
    brush.mouseUp(coordinates);

    // Mousemove without mousedown.
    // Nothing should be drawn.
    coordinates.sourceX = 30;
    coordinates.sourceY = 30;
    brush.mouseDown(coordinates);

    // Mousedown then mousemove twice without mouseup.
    // Something should be drawn.
    coordinates.sourceX = 50;
    coordinates.sourceY = 50;
    brush.mouseDown(coordinates);

    coordinates.sourceX = 60;
    coordinates.sourceY = 55;
    brush.mouseMove(coordinates);

    coordinates.sourceX = 65;
    coordinates.sourceY = 55;
    brush.mouseMove(coordinates);

    // Draw on expected canvas.
    var expectedCanvas = bitmapper_test.createCanvas();
    expectedCanvas.width = 100;
    expectedCanvas.height = 50;

    var ctx = expectedCanvas.getContext('2d');
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(20, 25);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(20, 25);
    ctx.lineTo(10, 15);
    ctx.stroke();

    // Drawing single point.
    ctx.beginPath();
    ctx.moveTo(30, 30);
    ctx.lineTo(30, 30);
    ctx.stroke();

    // Drawing mousemoves without mouseup.
    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.lineTo(50, 50);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.lineTo(60, 55);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(60, 55);
    ctx.lineTo(65, 55);
    ctx.stroke();

    var dataUrl = canvas.toDataURL();
    var expectedDataURL = expectedCanvas.toDataURL();

    equal(dataUrl, expectedDataURL, 'Comparing canvases');
  });

})();

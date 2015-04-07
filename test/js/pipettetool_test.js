/**
 * @license Copyright 2014 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */


/**
 * Tests pipette.
 */
(function() {

  module('Pipette');

  test('getColor', function() {
    expect(10);
    var canvas = bitmapper_test.createCanvas();
    canvas.width = 100;
    canvas.height = 50;

    var toolContext = new ToolContext(canvas, null, null);

    // Draw on source canvas.
    var context = canvas.getContext('2d');
    context.fillStyle = 'red';
    context.fillRect(1, 1, 10, 10);
    context.fillStyle = 'white';
    context.fillRect(0, 0, 5, 5);
    context.fillStyle = 'rgba(0, 0, 255, 0.4)';
    context.fillRect(20, 20, 5, 5);

    var expectedResult = ['rgb(255, 255, 255)', 1, false];

    var pipette = new bitmapper.PipetteTool(toolContext,
        function(color, opacity, done) {
          equal(color, expectedResult[0], 'Checking color');
          equal(opacity, expectedResult[1], 'Checking opacity');
        });

    var coordinates = new MouseCoordinates();
    // Simulate mousedown.
    coordinates.sourceX = 0;
    coordinates.sourceY = 0;

    pipette.mouseDown(coordinates);

    // Mousemove to another point on the canvas.
    coordinates.sourceX = 6;
    coordinates.sourceY = 6;

    expectedResult = ['rgb(255, 0, 0)', 1, false];
    pipette.mouseMove(coordinates);

    // Mouse move to another point where the color is transparent.
    coordinates.sourceX = 20;
    coordinates.sourceY = 20;

    expectedResult = ['rgb(0, 0, 255)', 0.4, false];
    pipette.mouseMove(coordinates);

    // Mousemove to another point and mouseup.
    coordinates.sourceX = 15;
    coordinates.sourceY = 15;

    expectedResult = ['rgb(0, 0, 0)', 0, false];
    pipette.mouseMove(coordinates);
    expectedResult = ['rgb(0, 0, 0)', 0, true];
    pipette.mouseUp();

  });

})();

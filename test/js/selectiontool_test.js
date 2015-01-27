/**
 * @license Copyright 2014 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */


/**
 * Tests selection canvas manager.
 */
(function() {


  module('SelectionTool');

  test('mouseEvents_tearDownToBlit', function() {
    // Create and draw onto source canvas.
    var sourceCanvas = bitmapper_test.createCanvas();
    sourceCanvas.width = 100;
    sourceCanvas.height = 100;

    var sourceContext = sourceCanvas.getContext('2d');
    sourceContext.fillStyle = 'red';
    sourceContext.fillRect(20, 20, 20, 20);

    // Selection canvas manager.
    var testCanvas = bitmapper_test.createCanvas();
    var mockZoomManager = new bitmapper_test.MockZoomManager;
    /** @type {SelectionCanvasManager} **/
    var selectionCanvasManager =
        new bitmapper.SelectionCanvasManager(testCanvas, mockZoomManager);

    var toolContext = new ToolContext(
        sourceCanvas, null, null, selectionCanvasManager, function() {});
    var selectionTool = new bitmapper.SelectionTool(toolContext);

    // Mouse Coordinates.
    var mouseDownCoords = new MouseCoordinates;
    mouseDownCoords.sourceX = 30;
    mouseDownCoords.sourceY = 10;
    // Not dragging.
    equal(selectionTool.dragging, false, 'Not dragging selection box');

    // Mouse down.
    selectionTool.mouseDown(mouseDownCoords);
    equal(selectionTool.dragging, true, 'Dragging selection box');
    equal(selectionTool.isSelected, false, 'Dragging selection box');
    equal(selectionTool.selectionCanvasManager.selectionCanvas.style.left,
          '30px', 'Start position');
    equal(selectionTool.selectionCanvasManager.selectionCanvas.style.top,
          '10px', 'Start position');

    // Mouse move. Clamp to edges of canvas.
    // First clamp on bottom right.
    var mouseMoveCoords = new MouseCoordinates;
    mouseMoveCoords.sourceX = 101;
    mouseMoveCoords.sourceY = 101;
    selectionTool.mouseMove(mouseMoveCoords);
    equal(selectionTool.dragging, true, 'Still dragging');
    // Retain position.
    equal(selectionTool.selectionCanvasManager.selectionSourceCanvas.width, 70,
          'Dragging beyond canvas clamps to canvas width');
    equal(selectionTool.selectionCanvasManager.selectionSourceCanvas.height, 90,
          'Dragging beyond canvas clamps to canvas height');
    equal(selectionTool.selectionCanvasManager.selectionCanvas.style.left,
          '30px', 'Retains same position');
    equal(selectionTool.selectionCanvasManager.selectionCanvas.style.top,
          '10px', 'Retains same position');

    // Now clamp to top left.
    mouseMoveCoords.sourceX = -10;
    mouseMoveCoords.sourceY = -10;
    selectionTool.mouseMove(mouseMoveCoords);
    equal(selectionTool.dragging, true, 'Still dragging');
    // Retain position.
    equal(selectionTool.selectionCanvasManager.selectionSourceCanvas.width, 30,
          'Dragging beyond canvas clamps to canvas width');
    equal(selectionTool.selectionCanvasManager.selectionSourceCanvas.height, 10,
          'Dragging beyond canvas clamps to canvas height');
    equal(selectionTool.selectionCanvasManager.selectionCanvas.style.left,
          '0px', 'Position is at top left');
    equal(selectionTool.selectionCanvasManager.selectionCanvas.style.top,
          '0px', 'Position is at top left');

    // Mouse move. Check selection source canvas has correct size and position.
    mouseMoveCoords.sourceX = 60;
    mouseMoveCoords.sourceY = 40;
    selectionTool.mouseMove(mouseMoveCoords);
    equal(selectionTool.dragging, true, 'Still dragging');
    equal(selectionTool.isSelected, false, 'Dragging selection box');
    equal(selectionTool.selectionCanvasManager.selectionSourceCanvas.width, 30,
          'Selection canvas correct width');
    equal(selectionTool.selectionCanvasManager.selectionSourceCanvas.height, 30,
          'Selection canvas correct height');
    equal(selectionTool.selectionCanvasManager.selectionCanvas.style.left,
          '30px', 'Retains same position');
    equal(selectionTool.selectionCanvasManager.selectionCanvas.style.top,
          '10px', 'Retains same position');

    // Mouse up. Retains same size and position.
    selectionTool.mouseUp(mouseMoveCoords);
    equal(selectionTool.dragging, false, 'Still dragging');
    equal(selectionTool.isSelected, true, 'Dragging selection box');
    equal(selectionTool.selectionCanvasManager.selectionSourceCanvas.width, 30,
          'Selection canvas correct width');
    equal(selectionTool.selectionCanvasManager.selectionSourceCanvas.height, 30,
          'Selection canvas correct height');
    equal(selectionTool.selectionCanvasManager.selectionCanvas.style.left,
          '30px', 'Retains same position');
    equal(selectionTool.selectionCanvasManager.selectionCanvas.style.top,
          '10px', 'Retains same position');

    // Check selection with expected selection canvas.
    var expectedCanvas = bitmapper_test.createCanvas();
    expectedCanvas.width = 30;
    expectedCanvas.height = 30;

    var expectedContext = expectedCanvas.getContext('2d');
    expectedContext.fillStyle = 'red';
    expectedContext.fillRect(0, 10, 10, 20);

    equal(expectedCanvas.toDataURL(),
        selectionTool.selectionCanvasManager.selectionSourceCanvas.toDataURL(),
        'Selection matches expected selection');

    // Rect behind selection cleared on source canvas.
    var expectedSourceCanvas = bitmapper_test.createCanvas();
    expectedSourceCanvas.width = 100;
    expectedSourceCanvas.height = 100;

    var expectedSourceContext = expectedSourceCanvas.getContext('2d');
    expectedSourceContext.fillStyle = 'red';
    expectedSourceContext.fillRect(20, 20, 20, 20);
    expectedSourceContext.clearRect(30, 10, 30, 30);
    equal(expectedSourceCanvas.toDataURL(), sourceCanvas.toDataURL(),
          'Rect behind selection cleared on source canvas');

    // Move selection to somewhere on source canvas and check source canvas has
    // not changed.
    selectionTool.selectionCanvasManager.setPosition(5, 5);
    equal(expectedSourceCanvas.toDataURL(), sourceCanvas.toDataURL(),
          'Source canvas has not been altered after setting position');

    // Tear down to blit.
    selectionTool.tearDown();
    equal(selectionTool.dragging, false, 'Dragging selection box');
    equal(selectionTool.isSelected, false, 'Dragging selection box');

    // Check source canvas after blitting selection.
    var expectedAfterBlitCanvas = expectedSourceCanvas;
    var expectedAfterBlitContext = expectedAfterBlitCanvas.getContext('2d');
    expectedAfterBlitContext.fillStyle = 'red';
    expectedAfterBlitContext.fillRect(5, 15, 10, 20);
    equal(expectedAfterBlitCanvas.toDataURL(), sourceCanvas.toDataURL(),
          'Correctly blitted image');
  });


  test('mouseEvents_mouseDownToBlit', function() {
    // Create and draw onto source canvas.
    var sourceCanvas = bitmapper_test.createCanvas();
    sourceCanvas.width = 100;
    sourceCanvas.height = 100;

    var sourceContext = sourceCanvas.getContext('2d');
    sourceContext.fillStyle = 'red';
    sourceContext.fillRect(20, 20, 20, 20);

    // Selection canvas manager.
    var testCanvas = bitmapper_test.createCanvas();
    var mockZoomManager = new bitmapper_test.MockZoomManager;
    /** @type {SelectionCanvasManager} **/
    var selectionCanvasManager =
        new bitmapper.SelectionCanvasManager(testCanvas, mockZoomManager);

    var toolContext = new ToolContext(
        sourceCanvas, null, null, selectionCanvasManager, function() {});
    var selectionTool = new bitmapper.SelectionTool(toolContext);

    // Mouse Coordinates.
    var mouseDownCoords = new MouseCoordinates;
    mouseDownCoords.sourceX = 30;
    mouseDownCoords.sourceY = 10;

    // Mouse down.
    selectionTool.mouseDown(mouseDownCoords);

    // Mouse move. Clamp to edges of canvas.
    var mouseMoveCoords = new MouseCoordinates;
    mouseMoveCoords.sourceX = 101;
    mouseMoveCoords.sourceY = 101;
    selectionTool.mouseMove(mouseMoveCoords);

    // Mouse move. Check selection source canvas has correct size and position.
    mouseMoveCoords.sourceX = 60;
    mouseMoveCoords.sourceY = 40;
    selectionTool.mouseMove(mouseMoveCoords);

    // Mouse up. Retains same size and position.
    selectionTool.mouseUp(mouseMoveCoords);

    // Check selection with expected selection canvas.
    var expectedCanvas = bitmapper_test.createCanvas();
    expectedCanvas.width = 30;
    expectedCanvas.height = 30;

    var expectedContext = expectedCanvas.getContext('2d');
    expectedContext.fillStyle = 'red';
    expectedContext.fillRect(0, 10, 10, 20);

    // Rect behind selection cleared on source canvas.
    var expectedSourceCanvas = bitmapper_test.createCanvas();
    expectedSourceCanvas.width = 100;
    expectedSourceCanvas.height = 100;

    var expectedSourceContext = expectedSourceCanvas.getContext('2d');
    expectedSourceContext.fillStyle = 'red';
    expectedSourceContext.fillRect(20, 20, 20, 20);
    expectedSourceContext.clearRect(30, 10, 30, 30);

    // Move selection to somewhere on source canvas and check source canvas has
    // not changed.
    selectionTool.selectionCanvasManager.setPosition(5, 5);

    // Different to previous test:
    // Mouse down on canvas. Since selection has been selected, it should blit
    // to source canvas.
    var mouseDownToBlitCoords = new MouseCoordinates;
    mouseDownToBlitCoords.sourceX = 80;
    mouseDownToBlitCoords.sourceY = 80;
    selectionTool.mouseDown(mouseDownToBlitCoords);

    // Check source canvas after blitting selection.
    var expectedAfterBlitCanvas = expectedSourceCanvas;
    var expectedAfterBlitContext = expectedAfterBlitCanvas.getContext('2d');
    expectedAfterBlitContext.fillStyle = 'red';
    expectedAfterBlitContext.fillRect(5, 15, 10, 20);
    equal(expectedAfterBlitCanvas.toDataURL(), sourceCanvas.toDataURL(),
          'Correctly blitted image');

    // Tear Down.
    selectionTool.tearDown();
    equal(selectionTool.dragging, false, 'Dragging selection box');
    equal(selectionTool.isSelected, false, 'Dragging selection box');
  });

})();

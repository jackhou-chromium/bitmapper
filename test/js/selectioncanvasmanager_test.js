/**
 * @license Copyright 2014 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */


/**
 * Tests selection canvas manager.
 */
(function() {

  /**
   * Set up selection canvas manager and zoom manager to be used in each test.
   */
  function setUpSelectionCanvasManager() {
    var testCanvas = bitmapper_test.createCanvas();

    var mockZoomManager = new bitmapper_test.MockZoomManager;
    /** @type {SelectionCanvasManager} **/
    var selectionCanvasManager =
        new bitmapper.SelectionCanvasManager(testCanvas, mockZoomManager);
    selectionCanvasManager.setVisible(true);

    var testContext = {
      selectionCanvasManager: selectionCanvasManager,
      mockZoomManager: mockZoomManager
    };

    return testContext;
  };


  module('SelectionCanvasManager');

  // Position of selection canvas and accounting for zoom.
  test('position', function() {
    var testContext = setUpSelectionCanvasManager();
    var selectionCanvasManager = testContext.selectionCanvasManager;
    var mockZoomManager = testContext.mockZoomManager;

    selectionCanvasManager.setPosition(1, 2);
    equal(selectionCanvasManager.getX(), 1, 'Correct X');
    equal(selectionCanvasManager.getY(), 2, 'Correct Y');

    selectionCanvasManager.setPosition(5.12, 10.98);
    equal(selectionCanvasManager.getX(), 5, 'Rounds X for pixel aligment');
    equal(selectionCanvasManager.getY(), 11, 'Rounds Y for pixel alignment');

    // No zoom.
    selectionCanvasManager.setPosition(2, 4);
    selectionCanvasManager.drawSelectionCanvas();
    equal(selectionCanvasManager.selectionCanvas.style.left, '2px',
          'Correct zoomed position');
    equal(selectionCanvasManager.selectionCanvas.style.top, '4px',
          'Correct zoomed position');

    // Zoom level 2.
    mockZoomManager.zoomFactor = 2;
    selectionCanvasManager.drawSelectionCanvas();
    equal(selectionCanvasManager.selectionCanvas.style.left, '4px',
        'Correct zoomed position');
    equal(selectionCanvasManager.selectionCanvas.style.top, '8px',
        'Correct zoomed position');
  });


  // Size of selection canvas and accounting for zoom.
  test('size', function() {
    var testContext = setUpSelectionCanvasManager();
    var selectionCanvasManager = testContext.selectionCanvasManager;
    var mockZoomManager = testContext.mockZoomManager;

    selectionCanvasManager.setSize(0, 0);
    equal(selectionCanvasManager.selectionSourceCanvas.width, 1,
        'Prevents width of 0px');
    equal(selectionCanvasManager.selectionSourceCanvas.height, 1,
        'Prevents width of 0px');
    selectionCanvasManager.setSize(10, 15);
    equal(selectionCanvasManager.selectionSourceCanvas.width, 10,
        'Sets correct width');
    equal(selectionCanvasManager.selectionSourceCanvas.height, 15,
        'Sets correct height');

    selectionCanvasManager.setSize(8.1, 0);
    equal(selectionCanvasManager.selectionSourceCanvas.width, 8,
        'Sets correct width');
    equal(selectionCanvasManager.selectionSourceCanvas.height, 1,
          'Sets correct height');

    // No zoom.
    selectionCanvasManager.setSize(5, 3);
    selectionCanvasManager.drawSelectionCanvas();
    equal(selectionCanvasManager.selectionCanvas.width, 5,
          'Correct zoomed size');
    equal(selectionCanvasManager.selectionCanvas.height, 3,
        'Correct zoomed size');

    // Zoom level 2.
    mockZoomManager.zoomFactor = 2;
    selectionCanvasManager.drawSelectionCanvas();
    equal(selectionCanvasManager.selectionCanvas.width, 10,
        'Correct zoomed size');
    equal(selectionCanvasManager.selectionCanvas.height, 6,
        'Correct zoomed size');
  });


  // Hit test.
  test('hitTest', function() {
    var testContext = setUpSelectionCanvasManager();
    var selectionCanvasManager = testContext.selectionCanvasManager;

    selectionCanvasManager.setPosition(10, 10);
    selectionCanvasManager.setSize(5, 3);

    var mouseCoordinates = new MouseCoordinates;
    mouseCoordinates.sourceX = 11;
    mouseCoordinates.sourceY = 11;

    // Currently not visible.
    selectionCanvasManager.setVisible(false);
    equal(selectionCanvasManager.isInHitArea(mouseCoordinates), false,
        'Canvas not visible so do not do hit test');
    // Set visible.
    selectionCanvasManager.setVisible(true);

    // Hit test of whole selection canvas.
    for (var y = 10; y < 14; y++) {
      for (var x = 10; x < 16; x++) {
        mouseCoordinates.sourceX = x;
        mouseCoordinates.sourceY = y;
        if (y == 10 || y == 13 || x == 10 || x == 15) {
          equal(selectionCanvasManager.isInHitArea(mouseCoordinates), false,
              'Hits outside selection canvas' + x + y);
        } else {
          equal(selectionCanvasManager.isInHitArea(mouseCoordinates), true,
              'Canvas is visible and mouse hits canvas' + x + y);
        }
      }
    }
  });

  // Mouse events.
  test('mouseEvents', function() {
    var testContext = setUpSelectionCanvasManager();
    var selectionCanvasManager = testContext.selectionCanvasManager;

    // Mouse down on selection canvas.
    var mouseDownCoords = new MouseCoordinates;
    mouseDownCoords.sourceX = 5;
    mouseDownCoords.sourceY = 3;
    selectionCanvasManager.mouseDown(mouseDownCoords);
    equal(selectionCanvasManager.isDragging(), true, 'Dragging commenced');

    // Move the selection canvas somewhere.
    var mouseMoveCoords = new MouseCoordinates;
    mouseMoveCoords.sourceX = 10;
    mouseMoveCoords.sourceY = 6;
    selectionCanvasManager.mouseMove(mouseMoveCoords);
    equal(selectionCanvasManager.isDragging(), true, 'Still dragging');
    equal(selectionCanvasManager.selectionCanvas.style.left, '5px',
          'Canvas moved');
    equal(selectionCanvasManager.selectionCanvas.style.top, '3px',
        'Canvas moved');

    // Mouse up where the selection canvas was moved.
    selectionCanvasManager.mouseUp(mouseMoveCoords);
    equal(selectionCanvasManager.isDragging(), false, 'Finished dragging');
    equal(selectionCanvasManager.selectionCanvas.style.left, '5px',
          'Canvas moved');
    equal(selectionCanvasManager.selectionCanvas.style.top, '3px',
          'Canvas moved');

    // Mousemove whilst not dragging does nothing.
    var mouseMoveCoords = new MouseCoordinates;
    mouseMoveCoords.sourceX = 20;
    mouseMoveCoords.sourceY = 5;
    selectionCanvasManager.mouseMove(mouseMoveCoords);
    equal(selectionCanvasManager.isDragging(), false,
          'Not dragging so cannot move');
    equal(selectionCanvasManager.selectionCanvas.style.left, '5px',
          'Position remained the same');
    equal(selectionCanvasManager.selectionCanvas.style.top, '3px',
          'Position remained the same');
  });

  // Reset selection canvas.
  test('resetSelection', function() {
    var testContext = setUpSelectionCanvasManager();
    var selectionCanvasManager = testContext.selectionCanvasManager;

    selectionCanvasManager.resetSelection();
    equal(selectionCanvasManager.selectionSourceCanvas.width, 1,
          'Reset width to 1');
    equal(selectionCanvasManager.selectionSourceCanvas.height, 1,
          'Reset height to 1');
    equal(selectionCanvasManager.selectionSourceCanvas.style.left, '');
    equal(selectionCanvasManager.selectionSourceCanvas.style.top, '');
  });

})();

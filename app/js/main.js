/**
 * @license Copyright 2013 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */


/**
 * @const {number}
 */
bitmapper.MAX_RESIZE_CANVAS_WIDTH = 1500;


/**
 * @const {number}
 */
bitmapper.MAX_RESIZE_CANVAS_HEIGHT = 1500;


/**
 * Local storage key for colors in color palette.
 * @const
 */
bitmapper.COLOR_ARRAY_STORAGE_KEY = 'colorArray';


/**
 * Local storage key for saved canvas dataURL.
 * @const
 */
bitmapper.SAVED_CANVAS_STORAGE_KEY = 'savedCanvas';


/**
 * Allow for a margin of 5px when resizing via handles.
 * @const {number}
 */
bitmapper.RESIZE_BORDER_WIDTH = 5;


/**
 * Type of resize operation taking place.
 * @enum {number}
 */
bitmapper.ResizeOperation = {
  NONE: 0x0,
  WIDTH: 0x1,
  HEIGHT: 0x2,
  BOTH: 0x3
};


/**
 * @type {bitmapper.ResizeOperation}
 */
bitmapper.activeResizeOperation = bitmapper.ResizeOperation.NONE;


/**
 * @type {HTMLCanvasElement}
 */
bitmapper.sourceCanvas = null;


/**
 * @type {HTMLCanvasElement}
 */
bitmapper.displayCanvas = null;


/**
 * @type {HTMLCanvasElement}
 */
bitmapper.brushCanvas = null;


/**
 * @type {ImageFile}
 */
bitmapper.imageFile = null;


/**
 * @type {Tool}
 */
bitmapper.selectedTool = null;


/**
 * @type {ZoomManager}
 */
bitmapper.zoomManager = null;


/**
 * @type {SelectionCanvasManager}
 */
bitmapper.selectionCanvasManager = null;


/**
 * @type {OptionProviders}
 */
bitmapper.optionProviders = null;


/**
 * @type {CursorGuide}
 */
bitmapper.cursorGuide = null;


/**
 * @type {HTMLElement}
 */
bitmapper.toolbar = null;


/**
 * Draws the image file to the canvas and sets initial properties.
 * Pushes this state as first snapshot.
 */
bitmapper.setCanvasToImage = function() {
  var image = bitmapper.imageFile.image;
  bitmapper.drawImageToCanvas(image.src);

  // Set initial zoom properties.
  bitmapper.zoomCanvas(1.0);

  bitmapper.imageFile.pushSnapshot(bitmapper.sourceCanvas.toDataURL());
};


/**
 * Displays a file picker and loads the file.
 * Set file entry then load file.
 */
bitmapper.openFile = function() {
  // Tear down before loading new file.
  bitmapper.selectedTool.tearDown();
  chrome.fileSystem.chooseEntry(
      {
        'type': 'openWritableFile',
        'accepts': [
          {'description': 'All image files',
            'extensions': ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp']},
          {'description': 'PNG image', 'extensions': ['png']},
          {'description': 'JPG image', 'extensions': ['jpg']},
          {'description': 'BMP image', 'extensions': ['bmp']},
          {'description': 'GIF image', 'extensions': ['gif']},
          {'description': 'WEBP image', 'extensions': ['webp']}],
        'acceptsAllTypes': false
      },
      function(entry) {
        if (!entry) {
          bitmapper.statusMessage('Nothing selected.');
          return;
        }
        // Re-instantiate bitmapper.imageFile.
        bitmapper.imageFile = new bitmapper.ImageFile();
        // TODO(dadisusila): Handle errors while loading.
        bitmapper.imageFile.loadFile(/** @type {FileEntry} */(entry),
                                     bitmapper.setCanvasToImage);
        bitmapper.updateFileNameMessage();
      });
};


/**
 * Opens save dialog box and allows user to save image.
 * Set the file entry then save.
 */
bitmapper.saveAsFile = function() {
  chrome.fileSystem.chooseEntry(
      {
        'type': 'saveFile',
        'accepts': [
          {'description': 'PNG image', 'extensions': ['png']},
          {'description': 'JPG image', 'extensions': ['jpg']},
          {'description': 'WEBP image', 'extensions': ['webp']}],
        'acceptsAllTypes': false
      },
      function(entry) {
        if (!entry) {
          bitmapper.statusMessage('Nothing selected.');
        } else {
          bitmapper.imageFile.setFileEntry(
              /** @type {FileEntry} entry */(entry));
          bitmapper.saveFile();
        }
      });
};


/**
 * Saves to current file entry.
 */
bitmapper.saveFile = function() {
  // Save acts as Save As if there is no valid file entry.
  if (!bitmapper.imageFile || !bitmapper.imageFile.fileEntry) {
    bitmapper.saveAsFile();
  } else {
    // Tear down before saving file.
    bitmapper.selectedTool.tearDown();
    bitmapper.imageFile.saveFile(bitmapper.sourceCanvas);
  }
  bitmapper.updateFileNameMessage();
};


/**
 * Outputs status message.
 * @param {string} status
 */
bitmapper.statusMessage = function(status) {
  var toast = document.getElementById('bitmapperToast');
  toast['showToast'](status);
};


/**
 * Clears the canvas.
 */
bitmapper.clearCanvas = function() {
  var sourceContext = Canvas2DContext(bitmapper.sourceCanvas);
  sourceContext.clearRect(0, 0, bitmapper.sourceCanvas.width,
      bitmapper.sourceCanvas.height);
  bitmapper.zoomManager.drawDisplayCanvas();
};


/**
 * Scales the canvas to the value from the zoom input range element
 *
 * @param {number} zoomValue The zoom scale factor where 1.0 means actual size.
 */
bitmapper.zoomCanvas = function(zoomValue) {
  var canvasViewport = GetCanvasElement('canvasViewport');
  // Use the center of the viewport as the anchor point.
  bitmapper.zoomManager.setZoomFactor(
      zoomValue,
      canvasViewport.scrollLeft + bitmapper.displayCanvas.width / 2,
      canvasViewport.scrollTop + bitmapper.displayCanvas.height / 2);
  bitmapper.zoomManager.drawDisplayCanvas();
  bitmapper.selectionCanvasManager.drawSelectionCanvas();
};


/**
 * Set background color of selected color box to selected color.
 */
bitmapper.setSelectedColorBox = function() {
  document.getElementById('colorSelector')['colorValue'] =
      bitmapper.rgbToHex(
          bitmapper.optionProviders.colorPalette.getSelectedColor());
};


/**
 * Changes background of selected cell in palette to selected color.
 */
bitmapper.updatePalette = function() {
  var newColor = /** @type {string} */
      (document.getElementById('colorSelector')['colorValue']);
  bitmapper.optionProviders.colorPalette.updateCellColor(newColor);

  var storageEntry = {};
  var colors = /** @type {Array.<string>} */
      (document.getElementById('colorPalette')['colors']);
  storageEntry[bitmapper.COLOR_ARRAY_STORAGE_KEY] = colors;
  chrome.storage.local.set(storageEntry, function() {});
};


/**
 * Set selected tool.
 * @param {Tool} tool
 */
bitmapper.setSelectedTool = function(tool) {
  bitmapper.selectedTool.tearDown();
  bitmapper.selectedTool = tool;
  bitmapper.cursorGuide.setTool(tool);
};


/**
 * Add event listeners for mouse events hooked to canvas wrapper.
 */
bitmapper.registerMouseEvents = function() {
  var canvasWrapper = document.getElementById('canvasWrapper');
  var canvasViewport = document.getElementById('canvasViewport');

  canvasViewport.addEventListener('mousedown',
      function(mouseEvent) {
        // Determine which edge to perform resize on.
        var currentCursor = bitmapper.getCursorStyle();
        if (currentCursor == 'e-resize') {
          bitmapper.activeResizeOperation = bitmapper.ResizeOperation.WIDTH;
        } else if (currentCursor == 's-resize') {
          bitmapper.activeResizeOperation = bitmapper.ResizeOperation.HEIGHT;
        } else if (currentCursor == 'se-resize') {
          bitmapper.activeResizeOperation = bitmapper.ResizeOperation.BOTH;
        }
      }, false);
  canvasViewport.addEventListener('mouseup',
      function(mouseEvent) {
        if (bitmapper.activeResizeOperation == bitmapper.ResizeOperation.NONE)
          return;

        var coords = bitmapper.getMouseCoordinates(mouseEvent);
        var newWidth = Math.round((bitmapper.activeResizeOperation &
            bitmapper.ResizeOperation.WIDTH) ? coords.sourceX :
            bitmapper.sourceCanvas.width);
        var newHeight = Math.round((bitmapper.activeResizeOperation &
            bitmapper.ResizeOperation.HEIGHT) ? coords.sourceY :
            bitmapper.sourceCanvas.height);
        bitmapper.resizeCanvas(newWidth, newHeight);

        bitmapper.activeResizeOperation = bitmapper.ResizeOperation.NONE;

        // Change cursor icon to default on mouse up, regardless of
        // finishing position.
        document.getElementById('canvasViewport').style.cursor = 'initial';
        bitmapper.displayCanvas.style.removeProperty('-webkit-clip-path');

        bitmapper.hideCanvasSize();
      }, false);
  canvasViewport.addEventListener('mousemove',
      function(mouseEvent) {
        var canvasPlaceholder = document.getElementById('canvasPlaceholder');
        var coords = bitmapper.getMouseCoordinates(mouseEvent);
        var newWidth = bitmapper.displayCanvas.width;
        var newHeight = bitmapper.displayCanvas.height;
        var currentZoom = bitmapper.zoomManager.getZoomFactor();
        // Update mouse icon.
        bitmapper.resizeCursorIcon(coords);
        if (bitmapper.activeResizeOperation &
            bitmapper.ResizeOperation.HEIGHT) {
          newHeight = coords.sourceY * currentZoom;
          canvasPlaceholder.style.height = newHeight + 'px';
          bitmapper.showCanvasSize(newWidth, newHeight);
        }
        if (bitmapper.activeResizeOperation &
            bitmapper.ResizeOperation.WIDTH) {
          newWidth = coords.sourceX * currentZoom;
          canvasPlaceholder.style.width = newWidth + 'px';
          bitmapper.showCanvasSize(newWidth, newHeight);
        }
        var polygon = 'polygon(0px 0px, ' + newWidth + 'px 0px, ' +
            newWidth + 'px ' + newHeight + 'px, 0px ' + newHeight + 'px)';
        bitmapper.displayCanvas.style.webkitClipPath = polygon;
      }, false);

  // Mouse support.
  canvasWrapper.addEventListener('mousedown',
      function(mouseEvent) {
        if (mouseEvent.button != 0)
          return;
        // Stop event bubbling into canvasViewport's mouseDown event listener.
        mouseEvent.stopPropagation();

        // Hit test for selection canvas.
        if (bitmapper.selectionCanvasManager.isInHitArea(
            bitmapper.getMouseCoordinates(mouseEvent))) {
          bitmapper.selectionCanvasManager.mouseDown(
              bitmapper.getMouseCoordinates(mouseEvent));
        } else {
          bitmapper.selectedTool.mouseDown(
              bitmapper.getMouseCoordinates(mouseEvent),
              mouseEvent.shiftKey);
        }
      }, false);
  window.addEventListener('mouseup',
      function(mouseEvent) {
        if (mouseEvent.button != 0)
          return;

        bitmapper.updateFileNameMessage();
        bitmapper.selectedTool.mouseUp(
            bitmapper.getMouseCoordinates(mouseEvent));
        bitmapper.selectionCanvasManager.mouseUp(
            bitmapper.getMouseCoordinates(mouseEvent));
        bitmapper.saveStateToLocalStorage();
        // Snapshot pushed for undo/redo functionality.
        bitmapper.imageFile.pushSnapshot(bitmapper.sourceCanvas.toDataURL());
      }, false);
  window.addEventListener('mousemove',
      function(mouseEvent) {
        bitmapper.showCoordinates(
            bitmapper.getMouseCoordinates(mouseEvent));
        bitmapper.resizeCursorIcon(
            bitmapper.getMouseCoordinates(mouseEvent));
        // Check if selection canvas is being dragged.
        if (bitmapper.selectionCanvasManager.isDragging()) {
          bitmapper.selectionCanvasManager.mouseMove(
              bitmapper.getMouseCoordinates(mouseEvent));
        } else {
          bitmapper.selectedTool.mouseMove(
              bitmapper.getMouseCoordinates(mouseEvent));
        }
        bitmapper.cursorGuide.setPosition(
            bitmapper.getMouseCoordinates(mouseEvent));
      }, false);

  // Touch Support.
  canvasWrapper.addEventListener('touchstart',
      function(theEvent) {
        var touchEvent = /** @type {TouchEvent} */(theEvent);
        touchEvent.preventDefault();
        // Hit test for selection canvas.
        if (bitmapper.selectionCanvasManager.isInHitArea(
            bitmapper.getTouchCoordinates(touchEvent))) {
          bitmapper.selectionCanvasManager.mouseDown(
              bitmapper.getTouchCoordinates(touchEvent));
        } else {
          bitmapper.selectedTool.mouseDown(
              bitmapper.getTouchCoordinates(touchEvent));
        }
        bitmapper.cursorGuide.setPosition(
            bitmapper.getTouchCoordinates(touchEvent));
      }, false);
  canvasWrapper.addEventListener('touchend',
      function(theEvent) {
        var touchEvent = /** @type {TouchEvent} */(theEvent);
        bitmapper.updateFileNameMessage();
        touchEvent.preventDefault();
        bitmapper.selectedTool.mouseUp(
            bitmapper.getTouchCoordinates(touchEvent));
        bitmapper.selectionCanvasManager.mouseUp(
            bitmapper.getTouchCoordinates(touchEvent));
        bitmapper.saveStateToLocalStorage();
        // Snapshot pushed for undo/redo functionality.
        bitmapper.imageFile.pushSnapshot(bitmapper.sourceCanvas.toDataURL());
        bitmapper.cursorGuide.hide();
      }, false);
  canvasWrapper.addEventListener('touchmove',
      function(theEvent) {
        var touchEvent = /** @type {TouchEvent} */(theEvent);
        touchEvent.preventDefault();
        bitmapper.showCoordinates(
            bitmapper.getTouchCoordinates(touchEvent));
        // Check if selection canvas is being dragged.
        if (bitmapper.selectionCanvasManager.isDragging()) {
          bitmapper.selectionCanvasManager.mouseMove(
              bitmapper.getTouchCoordinates(touchEvent));
        } else {
          bitmapper.selectedTool.mouseMove(
              bitmapper.getTouchCoordinates(touchEvent));
        }
        bitmapper.cursorGuide.setPosition(
            bitmapper.getTouchCoordinates(touchEvent));
      }, false);
  canvasWrapper.addEventListener('touchleave',
      function(theEvent) {
        var touchEvent = /** @type {TouchEvent} */(theEvent);
        touchEvent.preventDefault();
        bitmapper.selectionCanvasManager.mouseLeave(
            bitmapper.getTouchCoordinates(touchEvent));
        bitmapper.selectedTool.mouseLeave(
            bitmapper.getTouchCoordinates(touchEvent));
        bitmapper.saveStateToLocalStorage();
        bitmapper.cursorGuide.hide();
      }, false);
};


/**
 * Handle keyboard shortcuts.
 * @param {Event} keyEvent
 */
bitmapper.handleKeyDown = function(keyEvent) {
  if (keyEvent.ctrlKey) {
    switch (keyEvent.keyCode) {
      case 79: // o
        // Open.
        bitmapper.openFile();
        break;
      case 83: // s
        // Save as and save.
        if (keyEvent.shiftKey)
          bitmapper.saveAsFile();
        else
          bitmapper.saveFile();
        break;
      case 89: // y
        // Redo.
        bitmapper.redo();
        break;
      case 90: // z
        // Undo.
        bitmapper.undo();
        break;
      case 187: // +
        // Zoom in.
        document.getElementById('zoomSelector').value =
            bitmapper.zoomManager.getZoomFactor() + 1;
        bitmapper.zoomCanvas(1.0);
        break;
      case 189: // -
        // Zoom out.
        document.getElementById('zoomSelector').value =
            bitmapper.zoomManager.getZoomFactor() - 1;
        bitmapper.zoomCanvas(1.0);
        break;
    }
  }
};


/**
 * Compare saved canvas with potentially dirtied source canvas and displays
 * file name message accordingly.
 */
bitmapper.updateFileNameMessage = function() {
  // App first launched or new file.
  if (!bitmapper.imageFile || !bitmapper.imageFile.fileEntry) {
    bitmapper.toolbar.fileName = 'untitled';
    return;
  }
  if (bitmapper.imageFile.matchesOriginal(bitmapper.sourceCanvas)) {
    bitmapper.toolbar.fileName = bitmapper.imageFile.getFileName();
  } else {
    bitmapper.toolbar.fileName = bitmapper.imageFile.getFileName() + '*';
  }
};


/**
 * Generate mouse coordinates object from a page offset.
 * @param {number} pageX
 * @param {number} pageY
 * @return {MouseCoordinates}
 */
bitmapper.generateMouseCoordinates = function(pageX, pageY) {
  var canvasRect =
      document.getElementById('canvasPlaceholder').getBoundingClientRect();
  var canvasOffsetX = pageX - canvasRect.left;
  var canvasOffsetY = pageY - canvasRect.top;
  var mouseCoordinates = new MouseCoordinates();
  mouseCoordinates.sourceX =
      bitmapper.zoomManager.getSourceCoordinate(canvasOffsetX);
  mouseCoordinates.sourceY =
      bitmapper.zoomManager.getSourceCoordinate(canvasOffsetY);

  var canvasViewRect =
      document.getElementById('canvasViewport').getBoundingClientRect();
  mouseCoordinates.inCanvas =
      (pageX >= canvasRect.left) && (pageX < canvasRect.right) &&
      (pageY >= canvasRect.top) && (pageY < canvasRect.bottom) &&
      (pageX >= canvasViewRect.left) && (pageX < canvasViewRect.right) &&
      (pageY >= canvasViewRect.top) && (pageY < canvasViewRect.bottom);

  return mouseCoordinates;
};


/**
 * Bundle touch mouse coordinates to pass to tools.
 * @param {TouchEvent} touchEvent
 * @return {MouseCoordinates}
 */
bitmapper.getTouchCoordinates = function(touchEvent) {
  return bitmapper.generateMouseCoordinates(
      touchEvent.targetTouches.item(0).pageX,
      touchEvent.targetTouches.item(0).pageY);
};


/**
 * Bundle mouse coordinates to pass to tools.
 * @param {Event} mouseEvent
 * @return {MouseCoordinates}
 */
bitmapper.getMouseCoordinates = function(mouseEvent) {
  return bitmapper.generateMouseCoordinates(mouseEvent.pageX,
                                            mouseEvent.pageY);
};


/**
 * Display source co-ordinates UI.
 * @param {MouseCoordinates} mouseCoordinates
 */
bitmapper.showCoordinates = function(mouseCoordinates) {
  if (mouseCoordinates.inCanvas) {
    document.getElementById('coordinates').style.visibility = 'visible';
    document.getElementById('xCoordinate').textContent =
        Math.round(mouseCoordinates.sourceX);
    document.getElementById('yCoordinate').textContent =
        Math.round(mouseCoordinates.sourceY);
    return;
  }
  document.getElementById('coordinates').style.visibility = 'hidden';
};


/**
 * Display canvas size while resize operation is taking place.
 * @param {number} width
 * @param {number} height
 */
bitmapper.showCanvasSize = function(width, height) {
  document.getElementById('canvasDimensions').style.visibility = 'visible';
  document.getElementById('canvasWidth').textContent = width;
  document.getElementById('canvasHeight').textContent = height;
  return;
};


/**
 * Hide canvas size.
 */
bitmapper.hideCanvasSize = function() {
  document.getElementById('canvasDimensions').style.visibility = 'hidden';
};


/**
 * Set cursor icon to allow canvas to be resized via handles.
 * @param {MouseCoordinates} mouseCoordinates
 */
bitmapper.resizeCursorIcon = function(mouseCoordinates) {
  if (!mouseCoordinates.inCanvas) {
    var resizeOperation = bitmapper.activeResizeOperation;
    var inWidth = bitmapper.resizeWidth(mouseCoordinates);
    var inHeight = bitmapper.resizeHeight(mouseCoordinates);
    if ((inHeight && inWidth) ||
        resizeOperation == bitmapper.ResizeOperation.BOTH) {
      document.getElementById('canvasViewport').style.cursor = 'se-resize';
    } else if (inHeight ||
        resizeOperation == bitmapper.ResizeOperation.HEIGHT) {
      document.getElementById('canvasViewport').style.cursor = 's-resize';
    } else if (inWidth ||
        resizeOperation == bitmapper.ResizeOperation.WIDTH) {
      document.getElementById('canvasViewport').style.cursor = 'e-resize';
    } else {
      // Restore initial cursor icon.
      document.getElementById('canvasViewport').style.cursor = 'initial';
    }
  } else {
    // Restore initial cursor icon.
    document.getElementById('canvasViewport').style.cursor = 'initial';
  }
};


/**
 * Check if mouse is in resize bounds.
 * @param {MouseCoordinates} mouseCoordinates
 * @return {boolean}
 */
bitmapper.inResizeBound = function(mouseCoordinates) {
  return bitmapper.checkCursorResize();
};


/**
 * Returns current cursor style.
 * @return {string}
 */
bitmapper.getCursorStyle = function() {
  return document.getElementById('canvasViewport').style.cursor;
};


/**
  * Check if cursor indicates if resize is taking place.
  * @return {boolean}
 */
bitmapper.checkCursorResize = function() {
  return bitmapper.getCursorStyle() == 'e-resize' ||
      bitmapper.getCursorStyle() == 's-resize' ||
      bitmapper.getCursorStyle() == 'se-resize';
};


/**
 * Check if width should be resized.
 * @param {MouseCoordinates} mouseCoordinates
 * @return {boolean}
 */
bitmapper.resizeWidth = function(mouseCoordinates) {
  var delta = mouseCoordinates.sourceX - bitmapper.sourceCanvas.width;
  var heightBorder = bitmapper.sourceCanvas.height +
      bitmapper.RESIZE_BORDER_WIDTH;
  return delta >= 0 && delta <= bitmapper.RESIZE_BORDER_WIDTH &&
      mouseCoordinates.sourceY <= heightBorder;
};


/**
 * Check if width should be resized.
 * @param {MouseCoordinates} mouseCoordinates
 * @return {boolean}
 */
bitmapper.resizeHeight = function(mouseCoordinates) {
  var delta = mouseCoordinates.sourceY - bitmapper.sourceCanvas.height;
  var widthBorder = bitmapper.sourceCanvas.width +
      bitmapper.RESIZE_BORDER_WIDTH;
  return delta >= 0 && delta <= bitmapper.RESIZE_BORDER_WIDTH &&
      mouseCoordinates.sourceX <= widthBorder;
};


/**
 * Set up optionProviders which is given to tools.
 * @param {Object} localStorageObject
 */
bitmapper.setUpOptionProviders = function(localStorageObject) {
  var colorPalette = new bitmapper.ColorPalette();

  var initialColors = /** @type {Array.<string>} */
      (localStorageObject[bitmapper.COLOR_ARRAY_STORAGE_KEY]);
  if (!initialColors) {
    initialColors = ['#000000', '#ffff00', '#0000ff', '#ff00ff',
                     '#cc00ff', '#9900ff', '#ff6600', '#0099ff'];
  }
  var palette = document.getElementById('colorPalette');
  palette['colors'] = initialColors;
  palette.addEventListener('core-select', function(e) {
    var selectEvent = /** @type {CoreEvent} */(e);
    // We need to ignore deselection.
    if (!selectEvent.detail.isSelected)
      return;
    colorPalette.setSelectedCell(selectEvent.detail.item);
    bitmapper.setSelectedColorBox();
  });
  // Now the event listener is added, set the initial selection.
  palette.$['paletteSelector'].selected = 0;

  var sizeSelector = document.getElementById('sliderInputs').$.sizeSelector;

  bitmapper.optionProviders = new OptionProviders(colorPalette, sizeSelector);
};


/**
 * Set up tools and handlers for UI tool elements.
 */
bitmapper.setUpTools = function() {
  var toolContext = new ToolContext(
      bitmapper.sourceCanvas,
      bitmapper.displayCanvas,
      bitmapper.brushCanvas,
      bitmapper.selectionCanvasManager,
      function() {
        bitmapper.zoomManager.drawDisplayCanvas();
      });

  // Initialize tools.
  var toolPanel = document.getElementById('toolButtonPanel');

  var pencilTool = new bitmapper.PencilTool(
      toolContext, bitmapper.optionProviders,
      bitmapper.PencilTool.ToolType.PENCIL);

  var eraserTool = new bitmapper.PencilTool(
      toolContext, bitmapper.optionProviders,
      bitmapper.PencilTool.ToolType.ERASER);

  bitmapper.tools = {
    'brushTool' :
        new bitmapper.PencilTool(
            toolContext, bitmapper.optionProviders,
            bitmapper.PencilTool.ToolType.BRUSH),
    'defaultTool' : pencilTool,
    'pencilTool' : pencilTool,
    'bucketTool' : new bitmapper.BucketTool(
        toolContext, bitmapper.optionProviders),
    'pipetteTool' : new bitmapper.PipetteTool(
        toolContext, function(color, opacity) {
          bitmapper.optionProviders.colorPalette.updateCellColor(color);
          bitmapper.setSelectedColorBox();
          document.getElementById('sliderInputs').
              $['opacitySelector']['value'] = Math.round(opacity * 100.0);
        }),
    'selectionTool' : new bitmapper.SelectionTool(toolContext),
    'eraserTool' : eraserTool
  };

  toolPanel['tools'] = bitmapper.tools;
  toolPanel.addEventListener('core-activate', function(e) {
    var activateEvent = /** @type {CoreEvent} */(e);
    toolPanel['activeTool'] =
        toolPanel['tools'][activateEvent.detail.item.getAttribute('name')];

    var cropToSelectionButton =
        document.getElementById('cropToSelectionButton');
    if (activateEvent.detail.item.getAttribute('name') ==
        'selectionTool') {
      // Show crop to selection button on selection of selectionTool.
      cropToSelectionButton['render'] = true;
      // Disable crop to selection button by default.
      cropToSelectionButton['disabled'] = true;
    } else {
      // Hide crop to selection button on selection of another tool.
      cropToSelectionButton['render'] = false;
    }
  });

  /**
   * Handler for tool buttons.
   * @param {Tool} oldTool
   * @param {Tool} newTool
   */
  toolPanel['activeToolChanged'] = function(oldTool, newTool) {
    if (oldTool)
      oldTool.tearDown();
    bitmapper.selectedTool = newTool;
    bitmapper.cursorGuide.setTool(newTool);
  };

  // Bind click event listener to cropToSelectionButton, to perform crop
  // operation once it has been clicked.
  var cropToSelectionButton = document.getElementById('cropToSelectionButton');
  cropToSelectionButton.addEventListener('click', function(e) {
    bitmapper.cropToSelection();
  });
};


/**
 * Crop canvas to selected area.
 */
bitmapper.cropToSelection = function() {
  // Get selection canvas, and dimensions of selected area.
  var selectionCanvas = GetCanvasElement('selectionCanvas');
  var currentZoom = bitmapper.zoomManager.getZoomFactor();
  var selectionWidth = selectionCanvas.width * (1 / currentZoom);
  var selectionHeight = selectionCanvas.height * (1 / currentZoom);
  // Clear current canvas.
  bitmapper.clearCanvas();
  // Set height and width of canvas to selection height and width.
  bitmapper.sourceCanvas.width = selectionWidth;
  bitmapper.sourceCanvas.height = selectionHeight;
  // Draw selected content.
  Canvas2DContext(bitmapper.sourceCanvas).drawImage(
      bitmapper.selectionCanvasManager.getCanvas(), 0, 0,
      selectionWidth, selectionHeight);
  // Snapshot pushed for undo/redo functionality.
  bitmapper.imageFile.pushSnapshot(bitmapper.sourceCanvas.toDataURL());
  // Draw display canvas.
  bitmapper.zoomManager.drawDisplayCanvas();
  // tearDown function will disable crop to selection button.
  bitmapper.selectedTool.tearDown();

  // Show canvas crop toast.
  bitmapper.statusMessage('Cropped to ' + selectionWidth +
                          'x' + selectionHeight + 'px.');
};


/**
 * Clears canvas and sets file entry to null.
 */
bitmapper.newFile = function() {
  bitmapper.imageFile = new bitmapper.ImageFile();
  bitmapper.clearCanvas();
  bitmapper.updateFileNameMessage();
};


/**
 * Save source canvas to local storage.
 */
bitmapper.saveStateToLocalStorage = function() {
  var storageEntry = {};
  storageEntry[bitmapper.SAVED_CANVAS_STORAGE_KEY] =
      bitmapper.sourceCanvas.toDataURL();
  chrome.storage.local.set(storageEntry, function() {});
};


/**
 * Resizes the canvas using input dimensions.
 * @param {number} newWidth
 * @param {number} newHeight
 */
bitmapper.resizeCanvas = function(newWidth, newHeight) {
  if (newWidth > bitmapper.MAX_RESIZE_CANVAS_WIDTH ||
      newHeight > bitmapper.MAX_RESIZE_CANVAS_HEIGHT) {
    bitmapper.statusMessage('Maximum is ' + bitmapper.MAX_RESIZE_CANVAS_WIDTH +
        'x' + bitmapper.MAX_RESIZE_CANVAS_HEIGHT + 'px.');
    return;
  }

  // Make copy of canvas stored temporarily.
  var tempCanvas = CreateCanvasElement();
  tempCanvas.width = bitmapper.sourceCanvas.width;
  tempCanvas.height = bitmapper.sourceCanvas.height;
  Canvas2DContext(tempCanvas).drawImage(bitmapper.sourceCanvas, 0, 0,
      bitmapper.sourceCanvas.width, bitmapper.sourceCanvas.height);
  // Clear source canvas.
  bitmapper.clearCanvas();
  // Resize source.
  bitmapper.sourceCanvas.width = newWidth;
  bitmapper.sourceCanvas.height = newHeight;
  // Resize brushCanvas.
  bitmapper.brushCanvas.width = newWidth;
  bitmapper.brushCanvas.height = newHeight;
  // Draw temp back on source.
  Canvas2DContext(bitmapper.sourceCanvas).drawImage(tempCanvas, 0, 0);
  // Snapshot pushed for undo/redo functionality.
  bitmapper.imageFile.pushSnapshot(bitmapper.sourceCanvas.toDataURL());
  // Draw display canvas.
  bitmapper.zoomManager.drawDisplayCanvas();
  bitmapper.statusMessage('Resized the canvas to ' + newWidth +
                          'x' + newHeight + 'px.');
  bitmapper.updateFileNameMessage();
};


/**
 * Draw image to canvas using given image source.
 * @param {string} imageSrc
 */
bitmapper.drawImageToCanvas = function(imageSrc) {
  var image = new Image();
  image.src = imageSrc;
  bitmapper.sourceCanvas.width = image.width;
  bitmapper.sourceCanvas.height = image.height;
  Canvas2DContext(bitmapper.sourceCanvas).drawImage(image, 0, 0);
  bitmapper.zoomManager.drawDisplayCanvas();
};


/**
 * Undo and draw snapshot to canvas.
 */
bitmapper.undo = function() {
  if (bitmapper.selectedTool == bitmapper.tools.selectionTool)
    return;
  var pencilTool = /** @type {PencilTool}*/(bitmapper.tools['pencilTool']);
  pencilTool.undo();

  var poppedSnapshot = bitmapper.imageFile.popSnapshot();
  if (poppedSnapshot) {
    bitmapper.drawImageToCanvas(poppedSnapshot);
    bitmapper.updateFileNameMessage();
  }
};


/**
 * Redo and draw snapshot to canvas.
 */
bitmapper.redo = function() {
  var pencilTool = /** @type {PencilTool}*/(bitmapper.tools['pencilTool']);
  pencilTool.redo();

  var unpoppedSnapshot = bitmapper.imageFile.unpopSnapshot();
  if (unpoppedSnapshot) {
    bitmapper.drawImageToCanvas(unpoppedSnapshot);
    bitmapper.updateFileNameMessage();
  }
};


/**
 * Attach event listeners to polymer elements.
 */
bitmapper.addEventListeners = function() {
  var toolbar = document.getElementById('bitmapperToolbar');
  var newFileButton = toolbar.shadowRoot.getElementById('newFileButton');
  var openFileButton = toolbar.shadowRoot.getElementById('openFileButton');
  var saveButton = toolbar.shadowRoot.getElementById('saveButton');
  var saveAsButton = toolbar.shadowRoot.getElementById('saveAsButton');
  var resizeDialogButton =
      toolbar.shadowRoot.getElementById('resizeDialogButton');
  var undoButton = toolbar.shadowRoot.getElementById('undoButton');
  var redoButton = toolbar.shadowRoot.getElementById('redoButton');

  newFileButton.addEventListener('click', bitmapper.newFile);
  openFileButton.addEventListener('click', bitmapper.openFile);
  saveButton.addEventListener('click', bitmapper.saveFile);
  saveAsButton.addEventListener('click', bitmapper.saveAsFile);
  resizeDialogButton.addEventListener('click', function(e) {
    document.getElementById('resizeDialog').$['dialog']['opened'] = true;
  });
  undoButton.addEventListener('click', bitmapper.undo);
  redoButton.addEventListener('click', bitmapper.redo);
};


/**
 * Entry point.
 * @param {Object} localStorageObject
 */
bitmapper.start = function(localStorageObject) {
  // Initialize canvases.
  bitmapper.displayCanvas = GetCanvasElement('imageCanvas');
  bitmapper.sourceCanvas = CreateCanvasElement();
  bitmapper.brushCanvas = CreateCanvasElement();

  var toolbar = document.getElementById('bitmapperToolbar');
  bitmapper.toolbar = toolbar;
  bitmapper.updateFileNameMessage();
  bitmapper.addEventListeners();
  // Initialize zoom functionality.
  bitmapper.zoomManager = new bitmapper.ZoomManager(
      bitmapper.sourceCanvas, bitmapper.displayCanvas,
      bitmapper.brushCanvas, document.getElementById('canvasPlaceholder'),
      document.getElementById('canvasViewport'));

  // Redraw display canvas on window resize.
  window.addEventListener(
      'resize',
      function() {
        bitmapper.zoomManager.drawDisplayCanvas();
      },
      false);

  // Handler for change in zoom and opacity
  Object.observe(
      document.getElementById('sliderInputs')['sliderModel'],
      function(changes) {
        var sliderModel = changes.slice(-1)[0].object;
        var zoom = /** @type {number} */(sliderModel['zoom']);
        var opacity = /** @type {number} */(sliderModel['opacity']);
        bitmapper.zoomCanvas(zoom);
        // setOpacity method takes opacity in the range 0-1
        bitmapper.optionProviders.colorPalette.setOpacity(opacity / 100.0);
      }
  );

  bitmapper.selectionCanvasManager = new bitmapper.SelectionCanvasManager(
      GetCanvasElement('selectionCanvas'),
      bitmapper.zoomManager);

  // Initialize cursor guide.
  bitmapper.cursorGuide = new bitmapper.CursorGuide(
      document.getElementById('canvasWrapper'), bitmapper.zoomManager);

  // Set up option providers and tools.
  bitmapper.setUpOptionProviders(localStorageObject);
  bitmapper.zoomManager.setOptionProviders(bitmapper.optionProviders);
  bitmapper.setUpTools();

  // Set up mouse event listeners.
  bitmapper.registerMouseEvents();

  // Other UI elements.
  var colorSelector = document.getElementById('colorSelector');
  colorSelector['colorValueChanged'] = function() {
    bitmapper.updatePalette();
  };

  document.getElementById('resizeDialog').addEventListener('dimension-changed',
                                                           function(e) {
        var newWidth = /** @type {number} */
            (document.getElementById('resizeDialog')['dimension']['width']);
        var newHeight = /** @type {number} */
            (document.getElementById('resizeDialog')['dimension']['height']);
        bitmapper.resizeCanvas(newWidth, newHeight);
      });

  document.getElementById('resizeDialog').addEventListener('dimension-error',
                                                           function(e) {
        bitmapper.statusMessage('Please enter valid dimensions.');
      });

  // Load canvas in local storage if there is one.
  if (localStorageObject[bitmapper.SAVED_CANVAS_STORAGE_KEY]) {
    bitmapper.drawImageToCanvas(
        localStorageObject[bitmapper.SAVED_CANVAS_STORAGE_KEY]);
  }

  // Keyboard shortcuts.
  document.addEventListener('keydown', bitmapper.handleKeyDown, false);

  // Undo and redo.
  bitmapper.imageFile = new bitmapper.ImageFile();
  // Push first snapshot.
  bitmapper.imageFile.pushSnapshot(bitmapper.sourceCanvas.toDataURL());
};


/**
 * Loads local storage if app restarted by Chrome.
 * Starts clean if user relaunched the app.
 * @param {boolean} isRestart
 * @expose
 */
window.runApp = function(isRestart) {
  if (isRestart) {
    chrome.storage.local.get(null, function(localStorageObject) {
      bitmapper.start(localStorageObject);
    });
  } else {
    // Pass in empty object.
    bitmapper.start({});
  }
};

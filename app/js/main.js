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
        bitmapper.imageFile.loadFile(entry, bitmapper.setCanvasToImage);
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
          bitmapper.imageFile.setFileEntry(entry);
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
  var sourceContext = bitmapper.sourceCanvas.getContext('2d');
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
  var canvasViewport = document.getElementById('canvasViewport');
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
  var newColor = document.getElementById('colorSelector')['colorValue'];
  bitmapper.optionProviders.colorPalette.updateCellColor(newColor);

  var storageEntry = {};
  var colors = document.getElementById('colorPalette').colors;
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

  // Mouse support.
  canvasWrapper.addEventListener('mousedown',
      function(mouseEvent) {
        if (mouseEvent.button != 0)
          return;

        // Hit test for selection canvas.
        if (bitmapper.selectionCanvasManager.isInHitArea(
            bitmapper.getMouseCoordinates(mouseEvent))) {
          bitmapper.selectionCanvasManager.mouseDown(
              bitmapper.getMouseCoordinates(mouseEvent));
        } else {
          bitmapper.selectedTool.mouseDown(
              bitmapper.getMouseCoordinates(mouseEvent));
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
      function(touchEvent) {
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
      function(touchEvent) {
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
      function(touchEvent) {
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
      function(touchEvent) {
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
 * @param {Event} touchEvent
 * @return {MouseCoordinates}
 */
bitmapper.getTouchCoordinates = function(touchEvent) {
  return bitmapper.generateMouseCoordinates(touchEvent.targetTouches[0].pageX,
                                            touchEvent.targetTouches[0].pageY);
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
 * Set up optionProviders which is given to tools.
 * @param {Object} localStorageObject
 */
bitmapper.setUpOptionProviders = function(localStorageObject) {
  var colorPalette = new bitmapper.ColorPalette();

  var initialColors = localStorageObject[bitmapper.COLOR_ARRAY_STORAGE_KEY];
  if (!initialColors) {
    initialColors = ['#000000', '#ffff00', '#0000ff', '#ff00ff',
                     '#cc00ff', '#9900ff', '#ff6600', '#0099ff'];
  }
  var palette = document.getElementById('colorPalette');
  palette.colors = initialColors;
  palette.addEventListener('core-select', function(e) {
    // We need to ignore deselection.
    if (!e.detail.isSelected)
      return;
    colorPalette.setSelectedCell(e.detail.item);
    bitmapper.setSelectedColorBox();
  });
  // Now the event listener is added, set the initial selection.
  palette.$['paletteSelector'].selected = 0;

  var sizeSelector = document.getElementById('sliderInputs').$.sizeSelector;
  // Option providers passed to Tools as an Object so there is no type safety.
  bitmapper.optionProviders =
      /** @struct */ {
        /** @type {ColorPalette} */
        colorPalette: colorPalette,
        /** @type {HTMLElement} */
        sizeSelector: sizeSelector
      };
};


/**
 * Set up tools and handlers for UI tool elements.
 */
bitmapper.setUpTools = function() {
  var toolContext = new ToolContext(
      bitmapper.sourceCanvas,
      bitmapper.displayCanvas,
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
        toolContext, function(color, opacity, done) {
          bitmapper.optionProviders.colorPalette.updateCellColor(color);
          bitmapper.setSelectedColorBox();
          document.getElementById('sliderInputs').$.sliderModel.opacity =
              Math.round(opacity * 100.0);
          if (done)
            bitmapper.setSelectedTool(toolPanel['tools']['pencilTool']);
        }),
    'selectionTool' : new bitmapper.SelectionTool(toolContext),
    'eraserTool' : eraserTool
  };

  toolPanel['tools'] = bitmapper.tools;
  toolPanel.addEventListener('core-activate', function(e) {
    toolPanel['activeTool'] =
        toolPanel['tools'][e.detail.item.getAttribute('name')];
  });

  // Handler for tool buttons.
  toolPanel['activeToolChanged'] = function(oldTool, newTool) {
    if (oldTool)
      oldTool.tearDown();
    bitmapper.selectedTool = newTool;
    bitmapper.cursorGuide.setTool(newTool);
  };
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
  // Error handling.
  var isNumber = (Number(newWidth) >= 1 && Number(newHeight) >= 1);
  var isInteger = (newWidth === parseInt(newWidth, 10) &&
                   newHeight === parseInt(newHeight, 10));
  if (!isNumber || !isInteger) {
    bitmapper.statusMessage('Please enter valid dimensions.');
    return;
  }
  if (newWidth > bitmapper.MAX_RESIZE_CANVAS_WIDTH ||
      newHeight > bitmapper.MAX_RESIZE_CANVAS_HEIGHT) {
    bitmapper.statusMessage('Maximum is ' + bitmapper.MAX_RESIZE_CANVAS_WIDTH +
        'x' + bitmapper.MAX_RESIZE_CANVAS_HEIGHT + 'px.');
    return;
  }

  // Make copy of canvas stored temporarily.
  var tempCanvas = document.createElement('canvas');
  tempCanvas.width = bitmapper.sourceCanvas.width;
  tempCanvas.height = bitmapper.sourceCanvas.height;
  tempCanvas.getContext('2d').drawImage(bitmapper.sourceCanvas, 0, 0,
      bitmapper.sourceCanvas.width, bitmapper.sourceCanvas.height);
  // Clear source canvas.
  bitmapper.clearCanvas();
  // Resize source.
  bitmapper.sourceCanvas.width = newWidth;
  bitmapper.sourceCanvas.height = newHeight;
  // Draw temp back on source.
  bitmapper.sourceCanvas.getContext('2d').drawImage(tempCanvas, 0, 0);
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
  bitmapper.sourceCanvas.getContext('2d').drawImage(image, 0, 0);
  bitmapper.zoomManager.drawDisplayCanvas();
};


/**
 * Undo and draw snapshot to canvas.
 */
bitmapper.undo = function() {
  if (bitmapper.selectedTool == bitmapper.tools.selectionTool)
    return;

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
  var unpoppedSnapshot = bitmapper.imageFile.unpopSnapshot();
  if (unpoppedSnapshot) {
    bitmapper.drawImageToCanvas(unpoppedSnapshot);
    bitmapper.updateFileNameMessage();
  }
};


/**
 * Entry point.
 * @param {Object} localStorageObject
 */
bitmapper.start = function(localStorageObject) {
  // Initialise canvases.
  bitmapper.displayCanvas = document.getElementById('imageCanvas');
  bitmapper.sourceCanvas = document.createElement('canvas');

  var toolbar = document.getElementById('bitmapperToolbar');
  bitmapper.toolbar = toolbar;
  bitmapper.updateFileNameMessage();

  // Initialise handlers for filesystem buttons.
  bitmapper.toolbar.newHandler = bitmapper.newFile;
  bitmapper.toolbar.openHandler = bitmapper.openFile;
  bitmapper.toolbar.saveHandler = bitmapper.saveFile;
  bitmapper.toolbar.saveAsHandler = bitmapper.saveAsFile;

  // Initialise zoom functionality.
  bitmapper.zoomManager = new bitmapper.ZoomManager(
      bitmapper.sourceCanvas, bitmapper.displayCanvas,
      document.getElementById('canvasPlaceholder'),
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
        if (sliderModel.zoom < -1) {
          // Invert zoom.
          bitmapper.zoomCanvas(1 / (Math.abs(sliderModel.zoom)));
        } else if (sliderModel.zoom <= 1) {
          // Set zoom level to initial value.
          bitmapper.zoomCanvas(1);
        } else {
          bitmapper.zoomCanvas(sliderModel.zoom);
        }
        // setOpacity method takes opacity in the range 0-1
        bitmapper.optionProviders.colorPalette.setOpacity(
            sliderModel.opacity / 100.0);
      }
  );

  bitmapper.selectionCanvasManager = new bitmapper.SelectionCanvasManager(
      document.getElementById('selectionCanvas'), bitmapper.zoomManager);

  // Initialise cursor guide.
  bitmapper.cursorGuide = new bitmapper.CursorGuide(
      document.getElementById('canvasWrapper'), bitmapper.zoomManager);

  // Set up option providers and tools.
  bitmapper.setUpOptionProviders(localStorageObject);
  bitmapper.setUpTools();

  // Set up mouse event listeners.
  bitmapper.registerMouseEvents();

  // Other UI elements.
  var colorSelector = document.getElementById('colorSelector');
  colorSelector['colorValueChanged'] = function() {
    bitmapper.updatePalette();
  };

  // Handler for change in dimension.
  bitmapper.toolbar.$.resizeInput['dimensionChanged'] = function(
      oldVal, newVal) {
    bitmapper.resizeCanvas(newVal.width, newVal.height);
  };

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
  bitmapper.toolbar.undoHandler = bitmapper.undo;
  bitmapper.toolbar.redoHandler = bitmapper.redo;
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

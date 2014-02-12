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
  var zoomSelector = document.getElementById('zoomSelector');
  zoomSelector.value = 1;
  zoomSelector.setAttribute('max', bitmapper.zoomManager.getMaxZoomFactor());
  bitmapper.zoomCanvas();

  bitmapper.imageFile.pushSnapshot(bitmapper.sourceCanvas.toDataURL());
  bitmapper.displayCanvasDimensions(image.width, image.height);
};


/**
 * Displays a file picker and loads the file.
 * Set file entry then load file.
 */
bitmapper.openFile = function() {
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
    bitmapper.imageFile.saveFile(bitmapper.sourceCanvas);
  }
  bitmapper.updateFileNameMessage();
};


/**
 * Outputs status message.
 * @param {string} status
 */
bitmapper.statusMessage = function(status) {
  document.getElementById('output').textContent = status;
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
 * Scales the canvas to the value from the zoom input range element.
 */
bitmapper.zoomCanvas = function() {
  var zoomValue = document.getElementById('zoomSelector').value;
  bitmapper.zoomManager.setZoomFactor(zoomValue);
  bitmapper.zoomManager.drawDisplayCanvas();
  document.getElementById('zoomValue').textContent = (zoomValue * 100) + '%';
};


/**
 * Set background color of selected color box to selected color.
 */
bitmapper.setSelectedColorBox = function() {
  document.getElementById('colorSelector').value =
      bitmapper.rgbToHex(
          bitmapper.optionProviders.colorPalette.getSelectedColor());
};


/**
 * Changes background of selected cell in palette to selected color.
 */
bitmapper.updatePalette = function() {
  bitmapper.optionProviders.colorPalette.updateCellColor(
      document.getElementById('colorSelector').value,
      bitmapper.optionProviders.colorPalette.getSelectedIndex());

  var storageEntry = {};
  storageEntry[bitmapper.COLOR_ARRAY_STORAGE_KEY] =
      bitmapper.optionProviders.colorPalette.getColorArray();
  chrome.storage.local.set(storageEntry, function() {});
};


/**
 * Set selected tool.
 * @param {Object} tool
 */
bitmapper.setSelectedTool = function(tool) {
  bitmapper.selectedTool = tool;
  bitmapper.cursorGuide.setTool(tool);
};


/**
 * Add event listeners for mouse events.
 */
bitmapper.registerMouseEvents = function() {
  // Mouse support.
  var canvasWrapper = document.getElementById('canvasWrapper');
  canvasWrapper.addEventListener('mousedown',
      function(mouseEvent) {
        bitmapper.selectedTool.mouseDown(
            bitmapper.getMouseCoordinates(mouseEvent));
      }, false);
  canvasWrapper.addEventListener('mouseup',
      function(mouseEvent) {
        bitmapper.updateFileNameMessage();
        bitmapper.selectedTool.mouseUp(
            bitmapper.getMouseCoordinates(mouseEvent));
        bitmapper.saveStateToLocalStorage();
        // Snapshot pushed for undo/redo functionality.
        bitmapper.imageFile.pushSnapshot(bitmapper.sourceCanvas.toDataURL());
      }, false);
  canvasWrapper.addEventListener('mousemove',
      function(mouseEvent) {
        bitmapper.showCoordinates(
            bitmapper.getMouseCoordinates(mouseEvent));
        bitmapper.selectedTool.mouseMove(
            bitmapper.getMouseCoordinates(mouseEvent));
        bitmapper.cursorGuide.setPosition(
            bitmapper.getMouseCoordinates(mouseEvent));
      }, false);
  canvasWrapper.addEventListener('mouseleave',
      function(mouseEvent) {
        bitmapper.selectedTool.mouseLeave(
            bitmapper.getMouseCoordinates(mouseEvent));
        bitmapper.saveStateToLocalStorage();
        bitmapper.cursorGuide.hide();
      }, false);

  // Touch Support.
  canvasWrapper.addEventListener('touchstart',
      function(touchEvent) {
        touchEvent.preventDefault();
        bitmapper.selectedTool.mouseDown(
            bitmapper.getTouchCoordinates(touchEvent));
        bitmapper.cursorGuide.setPosition(
            bitmapper.getTouchCoordinates(touchEvent));
      }, false);
  canvasWrapper.addEventListener('touchend',
      function(touchEvent) {
        bitmapper.updateFileNameMessage();
        touchEvent.preventDefault();
        bitmapper.selectedTool.mouseUp(
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
        bitmapper.selectedTool.mouseMove(
            bitmapper.getTouchCoordinates(touchEvent));
        bitmapper.cursorGuide.setPosition(
            bitmapper.getTouchCoordinates(touchEvent));
      }, false);
  canvasWrapper.addEventListener('touchleave',
      function(touchEvent) {
        touchEvent.preventDefault();
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
        bitmapper.zoomCanvas();
        break;
      case 189: // -
        // Zoom out.
        document.getElementById('zoomSelector').value =
            bitmapper.zoomManager.getZoomFactor() - 1;
        bitmapper.zoomCanvas();
        break;
    }
  } else {
    switch (keyEvent.keyCode) {
      case 49: // 1
        bitmapper.setSelectedTool(bitmapper.tools.pencilTool);
        break;
      case 50: // 2
        bitmapper.setSelectedTool(bitmapper.tools.brushTool);
        break;
      case 51: // 3
        bitmapper.setSelectedTool(bitmapper.tools.pipetteTool);
        break;
      case 52: // 4
        break;
      case 81: // q
        bitmapper.optionProviders.colorPalette.setSelectedIndex(0);
        break;
      case 87: // w
        bitmapper.optionProviders.colorPalette.setSelectedIndex(1);
        break;
      case 69: // e
        bitmapper.optionProviders.colorPalette.setSelectedIndex(2);
        break;
      case 82: // r
        bitmapper.optionProviders.colorPalette.setSelectedIndex(3);
        break;
      case 65: // a
        bitmapper.optionProviders.colorPalette.setSelectedIndex(4);
        break;
      case 83: // s
        bitmapper.optionProviders.colorPalette.setSelectedIndex(5);
        break;
      case 68: // d
        bitmapper.optionProviders.colorPalette.setSelectedIndex(6);
        break;
      case 70: // f
        bitmapper.optionProviders.colorPalette.setSelectedIndex(7);
        break;
    }
  }
};


/**
 * Compare saved canvas with potentially dirtied source canvas and displays
 * file name message accordingly.
 */
bitmapper.updateFileNameMessage = function() {
  var fileNameStatus = document.getElementById('fileName');
  // App first launched or new file.
  if (!bitmapper.imageFile || !bitmapper.imageFile.fileEntry) {
    fileNameStatus.textContent = 'Untitled_image.';
    return;
  }
  if (bitmapper.imageFile.matchesOriginal(bitmapper.sourceCanvas)) {
    fileNameStatus.textContent = bitmapper.imageFile.getFileName();
  } else {
    fileNameStatus.textContent = bitmapper.imageFile.getFileName() + '*';
  }
};


/**
 * Bundle touch mouse coordinates to pass to tools.
 * @param {Event} touchEvent
 * @return {MouseCoordinates}
 */
bitmapper.getTouchCoordinates = function(touchEvent) {
  var mouseCoordinates = new MouseCoordinates();
  mouseCoordinates.sourceX = bitmapper.zoomManager.getSourceCoordinate(
      touchEvent.targetTouches[0].pageX - bitmapper.displayCanvas.offsetLeft);
  mouseCoordinates.sourceY = bitmapper.zoomManager.getSourceCoordinate(
      touchEvent.targetTouches[0].pageY - bitmapper.displayCanvas.offsetTop);
  return mouseCoordinates;
};


/**
 * Bundle mouse coordinates to pass to tools.
 * @param {Event} mouseEvent
 * @return {MouseCoordinates}
 */
bitmapper.getMouseCoordinates = function(mouseEvent) {
  var mouseCoordinates = new MouseCoordinates();
  mouseCoordinates.sourceX =
      bitmapper.zoomManager.getSourceCoordinate(mouseEvent.offsetX);
  mouseCoordinates.sourceY =
      bitmapper.zoomManager.getSourceCoordinate(mouseEvent.offsetY);
  return mouseCoordinates;
};


/**
 * Display source co-ordinates UI.
 * @param {MouseCoordinates} mouseCoordinates
 */
bitmapper.showCoordinates = function(mouseCoordinates) {
  document.getElementById('xCoordinate').textContent =
      Math.round(mouseCoordinates.sourceX);
  document.getElementById('yCoordinate').textContent =
      Math.round(mouseCoordinates.sourceY);
};


/**
 * Set up optionProviders which is given to tools.
 * @param {Object} localStorageObject
 */
bitmapper.setUpOptionProviders = function(localStorageObject) {
  // Callback sets the color selector box to the selected color.
  var colorPalette = new bitmapper.ColorPalette(
      document.getElementById('paletteContainer'),
      bitmapper.setSelectedColorBox);

  var initialColors = localStorageObject[bitmapper.COLOR_ARRAY_STORAGE_KEY];
  if (!initialColors) {
    initialColors = ['#000000', '#ffff00', '#0000ff', '#ff00ff',
                     '#cc00ff', '#9900ff', '#ff6600', '#0099ff'];
  }
  colorPalette.generatePalette(initialColors);
  var sizeSelector = document.getElementById('sizeSelector');

  // Option providers passed to Tools as an Object so there is no type safety.
  bitmapper.optionProviders =
      /** @struct */ {
        /** @type {ColorPalette} */
        colorPalette: colorPalette,
        /** @type {HTMLElement} */
        sizeSelector: sizeSelector
      };

  // Change UI brush size arc.
  bitmapper.optionProviders.sizeSelector.addEventListener('change', function() {
    document.getElementById('brushSize').style.height =
        (bitmapper.optionProviders.sizeSelector.value * 2) + 'px';
    document.getElementById('brushSize').style.width =
        (bitmapper.optionProviders.sizeSelector.value * 2) + 'px';
  }, false);
};


/**
 * Set up tools and handlers for UI tool elements.
 */
bitmapper.setUpTools = function() {
  var toolContext = new ToolContext(
      bitmapper.sourceCanvas,
      bitmapper.displayCanvas,
      function() {
        bitmapper.zoomManager.drawDisplayCanvas();
      });

  // Initialise tools.
  var brushTool = new bitmapper.BrushTool(
      toolContext, bitmapper.optionProviders);
  var pencilTool = new bitmapper.PencilTool(
      toolContext, bitmapper.optionProviders);
  var pipetteTool = new bitmapper.PipetteTool(
      toolContext, function(color, opacity, done) {
        bitmapper.optionProviders.colorPalette.updateCellColor(
            color,
            bitmapper.optionProviders.colorPalette.getSelectedIndex());
        bitmapper.setSelectedColorBox();
        var opacityPercent = Math.round(opacity * 100);
        document.getElementById('opacity').value = opacityPercent;
        document.getElementById('opacityValue').innerHTML =
            opacityPercent + '%';
        bitmapper.optionProviders.colorPalette.setOpacity(opacity);
        if (done)
          bitmapper.setSelectedTool(bitmapper.tools.pencilTool);
      });

  bitmapper.tools =
      /** @struct */ {
        /** @type {BrushTool} */
        brushTool: brushTool,
        /** @type {PencilTool} */
        pencilTool: pencilTool,
        /** @type {PipetteTool} */
        pipetteTool: pipetteTool
      };

  // Handlers for tool buttons.
  document.getElementById('brushToolButton').addEventListener(
      'click',
      function() {
        bitmapper.setSelectedTool(bitmapper.tools.brushTool);
      },
      false);
  document.getElementById('pencilToolButton').addEventListener(
      'click',
      function() {
        bitmapper.setSelectedTool(bitmapper.tools.pencilTool);
      },
      false);
  document.getElementById('pipetteToolButton').addEventListener(
      'click',
      function() {
        bitmapper.setSelectedTool(bitmapper.tools.pipetteTool);
      },
      false);
};


/**
 * Updates the current opacity level.
 */
bitmapper.updateOpacity = function() {
  var opacity = document.getElementById('opacity').value;
  document.getElementById('opacityValue').innerHTML = opacity + '%';
  bitmapper.optionProviders.colorPalette.setOpacity(opacity / 100);
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
  if (!newWidth || !newHeight || newWidth < 1 || newHeight < 1) {
    bitmapper.statusMessage('Please enter valid dimensions.');
    return;
  }
  if (newWidth > bitmapper.MAX_RESIZE_CANVAS_WIDTH ||
      newHeight > bitmapper.MAX_RESIZE_CANVAS_HEIGHT) {
    bitmapper.statusMessage('Maximum is' + bitmapper.MAX_RESIZE_CANVAS_WIDTH +
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
  bitmapper.statusMessage('Resized the canvas.');

  bitmapper.displayCanvasDimensions(newWidth, newHeight);
};


/**
 * Displays canvas dimensions in UI as placeholders.
 * @param {number} width
 * @param {number} height
 */
bitmapper.displayCanvasDimensions = function(width, height) {
  document.getElementById('resizeCanvasWidth').placeholder = 'W: ' + width;
  document.getElementById('resizeCanvasHeight').placeholder = 'H: ' + height;
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

  document.getElementById('newButton')
      .addEventListener('click', bitmapper.newFile, false);
  bitmapper.updateFileNameMessage();

  // Initialise handlers for filesystem buttons.
  document.getElementById('openButton')
      .addEventListener('click', bitmapper.openFile, false);
  document.getElementById('saveButton')
      .addEventListener('click', bitmapper.saveFile, false);
  document.getElementById('saveAsButton')
      .addEventListener('click', bitmapper.saveAsFile, false);

  // Initialise zoom functionality.
  bitmapper.zoomManager = new bitmapper.ZoomManager(
      bitmapper.sourceCanvas, bitmapper.displayCanvas);
  document.getElementById('zoomSelector')
      .addEventListener('change', bitmapper.zoomCanvas, false);

  // Initialise cursor guide.
  bitmapper.cursorGuide = new bitmapper.CursorGuide(
      document.getElementById('canvasWrapper'), bitmapper.zoomManager);

  // Set up option providers and tools.
  bitmapper.setUpOptionProviders(localStorageObject);
  bitmapper.setUpTools();

  // Set default tool.
  bitmapper.setSelectedTool(bitmapper.tools.pencilTool);
  // Set up mouse event listeners.
  bitmapper.registerMouseEvents();
  bitmapper.setSelectedColorBox();

  // Other UI elements.
  document.getElementById('colorSelector')
    .addEventListener('change', bitmapper.updatePalette, false);

  document.getElementById('opacity')
      .addEventListener('change', bitmapper.updateOpacity, false);

  document.getElementById('resizeCanvasButton').addEventListener(
      'click',
      function() {
        bitmapper.resizeCanvas(
            document.getElementById('resizeCanvasWidth').value,
            document.getElementById('resizeCanvasHeight').value);
      }, false);

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
  document.getElementById('undoButton')
    .addEventListener('click', bitmapper.undo, false);

  document.getElementById('redoButton')
    .addEventListener('click', bitmapper.redo, false);
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

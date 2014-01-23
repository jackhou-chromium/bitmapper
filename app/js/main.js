/**
 * @license Copyright 2013 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */


/**
 * Draws the image file to the canvas.
 */
bitmapper.setCanvasToImage = function() {
  var image = bitmapper.imageFile.image;
  bitmapper.sourceCanvas.width = image.width;
  bitmapper.sourceCanvas.height = image.height;
  var sourceContext = bitmapper.sourceCanvas.getContext('2d');
  sourceContext.drawImage(image, 0, 0);
  bitmapper.zoomManager.setZoomFactor(1);
  bitmapper.zoomManager.drawDisplayCanvas();
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
        if (!bitmapper.imageFile)
          bitmapper.imageFile = new bitmapper.ImageFile();

        bitmapper.imageFile.loadFile(entry, bitmapper.setCanvasToImage);
        // TODO(dadisusila): Handle errors while loading.
        bitmapper.statusMessage(bitmapper.imageFile.fileEntry.name +
                                ' opened.');
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
          if (!bitmapper.imageFile)
            bitmapper.imageFile = new bitmapper.ImageFile();
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
    // TODO(dadisusila): Handle error cases for saving.
    bitmapper.statusMessage(bitmapper.imageFile.fileEntry.name + ' saved.');
  }
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
 * Scales to double.
 */
bitmapper.zoomIn = function() {
  if (!bitmapper.zoomManager.exceededZoomLimit()) {
    bitmapper.zoomManager.setZoomFactor(
        bitmapper.zoomManager.getZoomFactor() * 2);
    bitmapper.zoomManager.drawDisplayCanvas();
  }
};


/**
 * Scales to half.
 */
bitmapper.zoomOut = function() {
  bitmapper.zoomManager.setZoomFactor(
      bitmapper.zoomManager.getZoomFactor() * 0.5);
  bitmapper.zoomManager.drawDisplayCanvas();
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
};


/**
 * Set selected tool.
 * @param {Object} tool
 */
bitmapper.setSelectedTool = function(tool) {
  bitmapper.selectedTool = tool;
};


/**
 * Dispatch mouse events.
 */
bitmapper.handleMouseEvents = function() {
  // Mouse support.
  bitmapper.displayCanvas.addEventListener('mousedown',
      function(mouseEvent) {
        bitmapper.selectedTool.mouseDown(
            bitmapper.getMouseCoordinates(mouseEvent));
      });
  bitmapper.displayCanvas.addEventListener('mouseup',
      function(mouseEvent) {
        bitmapper.selectedTool.mouseUp(
            bitmapper.getMouseCoordinates(mouseEvent));
      });
  bitmapper.displayCanvas.addEventListener('mousemove',
      function(mouseEvent) {
        bitmapper.selectedTool.mouseMove(
            bitmapper.getMouseCoordinates(mouseEvent));
      });
  bitmapper.displayCanvas.addEventListener('mouseleave',
      function(mouseEvent) {
        bitmapper.selectedTool.mouseLeave(
            bitmapper.getMouseCoordinates(mouseEvent));
      });

  // Touch Support.
  bitmapper.displayCanvas.addEventListener('touchstart',
      function(touchEvent) {
        touchEvent.preventDefault();
        bitmapper.selectedTool.mouseDown(
            bitmapper.getTouchCoordinates(touchEvent));
      });
  bitmapper.displayCanvas.addEventListener('touchend',
      function(touchEvent) {
        touchEvent.preventDefault();
        bitmapper.selectedTool.mouseUp(
            bitmapper.getTouchCoordinates(touchEvent));
      });
  bitmapper.displayCanvas.addEventListener('touchmove',
      function(touchEvent) {
        touchEvent.preventDefault();
        bitmapper.selectedTool.mouseMove(
            bitmapper.getTouchCoordinates(touchEvent));
      });
  bitmapper.displayCanvas.addEventListener('touchleave',
      function(touchEvent) {
        touchEvent.preventDefault();
        bitmapper.selectedTool.mouseLeave(
            bitmapper.getTouchCoordinates(touchEvent));
      });
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
 * Set up optionProviders which is given to tools.
 */
bitmapper.setUpOptionProviders = function() {
  // Callback sets the color selector box to the selected color.
  var colorPalette = new bitmapper.ColorPalette(
      document.getElementById('paletteContainer'),
      bitmapper.setSelectedColorBox);
  var initialColors = ['#000000', '#ffff00', '#0000ff', '#ff00ff',
    '#cc00ff', '#9900ff', '#ff6600', '#0099ff'];
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
  var pencilTool = new bitmapper.PencilTool(
      toolContext, bitmapper.optionProviders);

  bitmapper.tools =
      /** @struct */ {
        /** @type {PencilTool} */
        pencilTool: pencilTool
      };

  // Handlers for tool buttons.
  document.getElementById('pencilToolButton').addEventListener(
      'click',
      function() {
        bitmapper.setSelectedTool(bitmapper.tools.pencilTool);
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
  if (bitmapper.imageFile)
    bitmapper.imageFile.fileEntry = null;

  bitmapper.clearCanvas();
  bitmapper.statusMessage('Untitled Image.');
};


/**
 * Entry point.
 */
bitmapper.start = function() {
  // Initialise canvases.
  bitmapper.displayCanvas = document.getElementById('imageCanvas');
  bitmapper.sourceCanvas = document.getElementById('sourceCanvas');
  document.getElementById('newButton')
      .addEventListener('click', bitmapper.newFile, false);
  bitmapper.statusMessage('Untitled Image.');


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
  document.getElementById('zoomInButton')
      .addEventListener('click', bitmapper.zoomIn, false);
  document.getElementById('zoomOutButton')
      .addEventListener('click', bitmapper.zoomOut, false);

  // Set up option providers and tools.
  bitmapper.setUpOptionProviders();
  bitmapper.setUpTools();

  // Set default tool.
  bitmapper.setSelectedTool(bitmapper.tools.pencilTool);
  // Set up mouse event listeners.
  bitmapper.handleMouseEvents();

  // Other UI elements.
  document.getElementById('colorSelector')
    .addEventListener('change', bitmapper.updatePalette, false);
  // Set color selector as first color in palette.
  bitmapper.setSelectedColorBox();

  document.getElementById('opacity')
      .addEventListener('input', bitmapper.updateOpacity, false);
};


/** Closure called when the window finishes loading. */
window.onload = bitmapper.start;

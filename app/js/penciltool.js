/**
 * @license Copyright 2014 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */



/**
 * @constructor
 * @struct
 * @implements {Tool}
 * @param {ToolContext} toolContext
 * @param {OptionProviders} optionProviders
 * @param {PencilTool.ToolType} type
 */
function PencilTool(toolContext, optionProviders, type) {}


(function() {

  /**
   * Pencil tool. 1px crisp drawing and replacement of color on canvas to
   * selected color (not additive color drawing).
   * @constructor
   * @struct
   * @implements {Tool}
   * @param {ToolContext} toolContext
   * @param {OptionProviders} optionProviders
   * @param {PencilTool.ToolType} type
   */
  function PencilTool(toolContext, optionProviders, type) {
    /**
     * @type {CanvasRenderingContext2D}
     */
    this.sourceContext = Canvas2DContext(toolContext.sourceCanvas);

    /**
     * @type {HTMLCanvasElement}
     */
    this.sourceCanvas = toolContext.sourceCanvas;

    /**
     * @type {CanvasRenderingContext2D}
     */
    this.brushContext = Canvas2DContext(toolContext.brushCanvas);

    /**
     * Auxiliary canvas to allow for implementation of alpha blending when
     * using drawing tools.
     * @type {HTMLCanvasElement}
     */
    this.brushCanvas = toolContext.brushCanvas;

    /**
     * @type {ColorPalette}
     */
    this.colorPalette = optionProviders.colorPalette;

    /**
     * @type {HTMLInputElement}
     */
    this.sizeSelector = optionProviders.sizeSelector;

    /**
     * Draw display canvas callback.
     * @type {function()}
     */
    this.drawDisplayCanvas = toolContext.drawDisplayCanvas;

    /**
     * Whether the mouse is being held down for a drag.
     * @type {boolean}
     */
    this.dragging = false;

    /**
     * Contains the last MAX_SNAPSHOTS {x,y} coordinate pairs.
     * @type {!Stack.<MouseCoordinates>}
     */
    this.lastPositions = new bitmapper.Stack(bitmapper.ImageFile.MAX_SNAPSHOTS);

    /**
     * The last {x,y} coordinates.
     * @type {MouseCoordinates}
     */
    this.lastCoordinate = null;

    /**
     * Type of pencil tool.
     * @type {PencilTool.ToolType}
     */
    this.type = type;
  };


  /**
   * Pencil tool types.
   * @enum {number}
   */
  PencilTool.ToolType = {
    PENCIL: 0,
    ERASER: 1,
    BRUSH: 2
  };

  /**
   * Updates the last {x,y} coordinate position.
   * @param {MouseCoordinates} mouseCoordinates
   */
  PencilTool.prototype.updateLastPosition = function(mouseCoordinates) {
    this.lastCoordinate = mouseCoordinates;
    this.lastPositions.push(mouseCoordinates);
  };

  /**
   * Undoes the previous line action, updating the stack and lastCoordinate
   * accordingly.
   */
  PencilTool.prototype.undo = function() {
    this.lastPositions.pop();
    this.lastCoordinate = this.lastPositions.top();
  };

  /**
   * Redoes the previous line action, updating the stack and lastCoordinate
   * accordingly.
   */
  PencilTool.prototype.redo = function() {
    this.lastCoordinate = this.lastPositions.unpop();
  };

  /**
   * Start draw.
   * @param {MouseCoordinates} mouseCoordinates
   * @param {boolean=} opt_shiftDown
   */
  PencilTool.prototype.mouseDown = function(mouseCoordinates, opt_shiftDown) {
    this.dragging = true;
    // We also want to draw freehand if shift is held for the first stroke.
    if (!opt_shiftDown || this.lastCoordinate === null) {
      // Create a copy of mouseCoordinates to ensure that lastCoordinate isn't
      // accidentally called by the caller.
      this.lastCoordinate = new MouseCoordinates();
      this.lastCoordinate.sourceX = mouseCoordinates.sourceX;
      this.lastCoordinate.sourceY = mouseCoordinates.sourceY;
    }
    if (this.type == PencilTool.ToolType.BRUSH) {
      this.drawBrush(this.lastCoordinate.sourceX, this.lastCoordinate.sourceY,
                     mouseCoordinates.sourceX, mouseCoordinates.sourceY);
    } else {
      this.drawLine(this.lastCoordinate.sourceX, this.lastCoordinate.sourceY,
                    mouseCoordinates.sourceX, mouseCoordinates.sourceY);
    }
  };

  /**
   * Draw.
   * @param {MouseCoordinates} mouseCoordinates
   */
  PencilTool.prototype.mouseMove = function(mouseCoordinates) {
    if (!this.dragging)
      return;

    if (this.type == PencilTool.ToolType.BRUSH) {
      this.drawBrush(this.lastCoordinate.sourceX, this.lastCoordinate.sourceY,
                     mouseCoordinates.sourceX, mouseCoordinates.sourceY);
    } else {
      this.drawLine(this.lastCoordinate.sourceX, this.lastCoordinate.sourceY,
                    mouseCoordinates.sourceX, mouseCoordinates.sourceY);
    }
    this.lastCoordinate = mouseCoordinates;
  };

  /**
   * Stop draw.
   * @param {MouseCoordinates} mouseCoordinates
   */
  PencilTool.prototype.mouseUp = function(mouseCoordinates) {
    this.dragging = false;

    // Record the endpoint of every line in the stack. The most recently
    // recorded coordinate will be used as a starting point for straight lines.
    this.updateLastPosition(mouseCoordinates);

    // Draw image onto canvas.
    this.drawDisplayCanvas();

    // Set globalCompositeOperation based on whether eraser tool is selected.
    this.sourceContext.globalCompositeOperation = this.type ==
        PencilTool.ToolType.ERASER ? 'destination-out' : 'source-over';

    var tempAlpha = this.sourceContext.globalAlpha;
    this.sourceContext.globalAlpha = this.colorPalette.getOpacity();

    // Draw brushCanvas onto sourceCanvas.
    this.sourceContext.drawImage(
        this.brushCanvas,
        0,
        0,
        this.sourceCanvas.width,
        this.sourceCanvas.height,
        0,
        0,
        this.brushCanvas.width,
        this.brushCanvas.height);
    this.sourceContext.globalAlpha = tempAlpha;
    // Set globalCompositeOperation to the default value.
    this.sourceContext.globalCompositeOperation = 'source-over';
    // Clear brush canvas.
    this.brushContext.clearRect(0, 0,
        this.brushCanvas.width, this.brushCanvas.height);
  };

  /**
   * Stop draw.
   * @param {MouseCoordinates} mouseCoordinates
   */
  PencilTool.prototype.mouseLeave = function(mouseCoordinates) {
    this.dragging = false;
  };

  /**
   * Draw using pencil/ eraser.
   * Takes into account size selector value and draws to centre of rect.
   * @param {number} x0
   * @param {number} y0
   * @param {number} x1
   * @param {number} y1
   */
  PencilTool.prototype.drawLine = function(x0, y0, x1, y1) {
    // Bresenham's line algorithm
    // Based on the Wikipedia article about Bresenham's line
    // function.
    var ctx = this.brushContext;
    var shift = this.sizeSelector.value / 2;
    x0 = Math.floor(x0 - shift);
    y0 = Math.floor(y0 - shift);
    x1 = Math.floor(x1 - shift);
    y1 = Math.floor(y1 - shift);
    var run = true;
    var dx = Math.abs(x1 - x0);
    var dy = Math.abs(y1 - y0);


    if (this.type == PencilTool.ToolType.ERASER) {
      // Set eraser color to black, and it will be drawn onto sourceCanvas
      // with globalCompositeOperation = 'destination-out'. This will allow
      // to 'erase' over anything exisiting on the canvas previously. Opacity
      // will be taken into account when compositing takes place in mouseUp().
      ctx.fillStyle = 'rgb(0,0,0)';
    } else {
      ctx.fillStyle = this.colorPalette.getSelectedColor();
    }
    var sx = x0 < x1 ? 1 : -1;
    var sy = y0 < y1 ? 1 : -1;
    var err = dx - dy;
    while (run) {
      var size = parseInt(this.sizeSelector.value, 10);
      ctx.clearRect(x0, y0, size, size);
      ctx.fillRect(x0, y0, size, size);
      if (x0 === x1 && y0 === y1) {
        run = false;
      }
      var e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (x0 === x1 && y0 === y1) {
        ctx.clearRect(x0, y0, size, size);
        ctx.fillRect(x0, y0, size, size);
        run = false;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }
    // Redraw display canvas.
    this.drawDisplayCanvas();
  };

  /**
   * Draw using brush tool onto brushCanvas.
   * @param {number} x0
   * @param {number} y0
   * @param {number} x1
   * @param {number} y1
   */
  PencilTool.prototype.drawBrush = function(x0, y0, x1, y1) {
    var ctx = this.brushContext;
    ctx.beginPath();
    ctx.globalCompositeOperation = 'source-over';
    var brushSize = parseInt(this.sizeSelector.value, 10);

    // Draw with 100% opacity (regardless of the current brush opacity).
    // When the draw operation is completed, the brush canvas will be applied
    // to the source canvas at the correct opacity.
    var brushColor = this.colorPalette.getSelectedColor();
    if (x0 == x1 &&
        y0 == y1) {
      // Mouse coordinates have not changed. lineTo will not draw a line,
      // so instead draw circle with current co-ordinates.
      ctx.arc(x0, y0, brushSize / 2, 0, 2 * Math.PI, false);
      ctx.fillStyle = brushColor;
      ctx.fill();
    } else {
      ctx.moveTo(x0, y0);
      ctx.lineWidth = parseInt(brushSize, 10);
      ctx.lineTo(x1, y1);
      ctx.strokeStyle = brushColor;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
    // Redraw display canvas.
    this.drawDisplayCanvas();
  };

  PencilTool.prototype.tearDown = function() {
    this.lastPositions = new bitmapper.Stack(bitmapper.ImageFile.MAX_SNAPSHOTS);
    this.lastCoordinate = null;
  };


  /**
   * Set cursor guide image.
   * @param {Element} cursorDiv
   * @param {MouseCoordinates} mouseCoordinates
   * @param {number} zoomFactor
   * @return {boolean}
   */
  PencilTool.prototype.updateCursorGuide = function(
      cursorDiv, mouseCoordinates, zoomFactor) {
    // Styling.
    cursorDiv.style.width = (this.sizeSelector.value * zoomFactor) + 'px';
    cursorDiv.style.height = (this.sizeSelector.value * zoomFactor) + 'px';
    cursorDiv.style.border = '1px solid black';

    if (this.type == PencilTool.ToolType.BRUSH)
      cursorDiv.style.borderRadius = '50%';
    else
      cursorDiv.style.removeProperty('borderRadius');

    if (this.type == PencilTool.ToolType.ERASER) {
      cursorDiv.style.removeProperty('backgroundColor');
    } else {
      cursorDiv.style.backgroundColor =
          this.colorPalette.getSelectedColorWithOpacity();
    }
    // Position with centred pixel alignment.
    var shift = this.sizeSelector.value / 2;
    cursorDiv.style.left =
        (Math.floor(mouseCoordinates.sourceX - shift)) * zoomFactor + 'px';
    cursorDiv.style.top =
        (Math.floor(mouseCoordinates.sourceY - shift)) * zoomFactor + 'px';
    return true;
  };


  /**
   * Set size of pencilTool, used in testing.
   * @param {number} size
   */
  PencilTool.prototype.setSize = function(size) {
    this.sizeSelector.value = size.toString();
  };

  bitmapper.PencilTool = PencilTool;
})();

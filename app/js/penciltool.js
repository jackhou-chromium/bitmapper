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
     * The last x coordinate.
     * @type {number}
     */

    this.lastX = 0;

    /**
     * The last y coordinate.
     * @type {number}
     */
    this.lastY = 0;

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
   * Start draw.
   * @param {MouseCoordinates} mouseCoordinates
   */
  PencilTool.prototype.mouseDown = function(mouseCoordinates) {
    this.dragging = true;
    this.lastX = mouseCoordinates.sourceX;
    this.lastY = mouseCoordinates.sourceY;
    if (this.type == PencilTool.ToolType.BRUSH)
      this.drawBrush(mouseCoordinates);
    else
      this.drawLine(this.lastX, this.lastY, mouseCoordinates.sourceX,
          mouseCoordinates.sourceY);
  };

  /**
   * Draw.
   * @param {MouseCoordinates} mouseCoordinates
   */
  PencilTool.prototype.mouseMove = function(mouseCoordinates) {
    if (!this.dragging)
      return;

    if (this.type == PencilTool.ToolType.BRUSH) {
      this.drawBrush(mouseCoordinates);
    } else {
      this.drawLine(this.lastX, this.lastY, mouseCoordinates.sourceX,
          mouseCoordinates.sourceY);
    }
    this.lastX = mouseCoordinates.sourceX;
    this.lastY = mouseCoordinates.sourceY;
  };

  /**
   * Stop draw.
   * @param {MouseCoordinates} mouseCoordinates
   */
  PencilTool.prototype.mouseUp = function(mouseCoordinates) {
    this.dragging = false;
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
    var ctx = this.sourceContext;
    var shift = this.sizeSelector.value / 2;
    x0 = Math.floor(x0 - shift);
    y0 = Math.floor(y0 - shift);
    x1 = Math.floor(x1 - shift);
    y1 = Math.floor(y1 - shift);
    var run = true;
    var dx = Math.abs(x1 - x0);
    var dy = Math.abs(y1 - y0);


    if (this.type == PencilTool.ToolType.ERASER) {
      // Only set opacity.
      ctx.fillStyle = 'rgba(0,0,0,0)';
    } else {
      ctx.fillStyle = this.colorPalette.getSelectedColorWithOpacity();
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
   * Draw using brush tool.
   * @param {MouseCoordinates} mouseCoordinates
   */
  PencilTool.prototype.drawBrush = function(mouseCoordinates) {
    var ctx = this.sourceContext;
    ctx.beginPath();
    ctx.globalCompositeOperation = 'source-over';
    var startX = this.lastX;
    var endX = mouseCoordinates.sourceX;
    var startY = this.lastY;
    var endY = mouseCoordinates.sourceY;
    var brushSize = parseInt(this.sizeSelector.value, 10);
    var brushColor = this.colorPalette.getSelectedColorWithOpacity();
    if (startX == endX &&
        startY == endY) {
      // Mouse coordinates have not changed. lineTo will not draw a line,
      // so instead draw circle with current co-ordinates.
      ctx.arc(startX, startY, brushSize / 2, 0, 2 * Math.PI, false);
      ctx.fillStyle = brushColor;
      ctx.fill();
    } else {
      ctx.moveTo(startX, startY);
      ctx.lineWidth = parseInt(brushSize, 10);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = brushColor;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
    // Redraw display canvas.
    this.drawDisplayCanvas();
  };

  PencilTool.prototype.tearDown = function() {
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

  bitmapper.PencilTool = PencilTool;
})();

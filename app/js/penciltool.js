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
 * @param {Object} optionProviders
 *
 */
function PencilTool(toolContext, optionProviders) {}

(function() {

  /**
   * Pencil tool. 1px crisp drawing and replacement of color on canvas to
   * selected color (not additive color drawing).
   * @constructor
   * @struct
   * @implements {Tool}
   * @param {ToolContext} toolContext
   * @param {Object} optionProviders
   */
  function PencilTool(toolContext, optionProviders) {
    /**
     * @type {CanvasRenderingContext2D}
     */
    this.sourceContext = toolContext.sourceCanvas.getContext('2d');

    /**
     * @type {ColorPalette}
     */
    this.colorPalette = optionProviders.colorPalette;

    /**
     * @type {HTMLElement}
     */
    this.sizeSelector = optionProviders.sizeSelector;

    /**
     * Whether the mouse is being held down for a drag.
     * @type {boolean}
     */
    this.dragging = false;

    /**
     * Draw display canvas callback.
     * @type {function()}
     */
    this.drawDisplayCanvas = toolContext.drawDisplayCanvas;

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

  };


  /**
   * Start draw.
   * @param {MouseCoordinates} mouseCoordinates
   */
  PencilTool.prototype.mouseDown = function(mouseCoordinates) {
    this.dragging = true;
    this.lastX = mouseCoordinates.sourceX;
    this.lastY = mouseCoordinates.sourceY;
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

    this.drawLine(this.lastX, this.lastY, mouseCoordinates.sourceX,
        mouseCoordinates.sourceY);
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
    ctx.fillStyle = this.colorPalette.getSelectedColorWithOpacity();
    var sx = x0 < x1 ? 1 : -1;
    var sy = y0 < y1 ? 1 : -1;
    var err = dx - dy;
    while (run) {
      ctx.clearRect(x0, y0, this.sizeSelector.value, this.sizeSelector.value);
      ctx.fillRect(x0, y0, this.sizeSelector.value, this.sizeSelector.value);
      if (x0 === x1 && y0 === y1) {
        run = false;
      }
      var e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (x0 === x1 && y0 === y1) {
        ctx.clearRect(x0, y0, this.sizeSelector.value, this.sizeSelector.value);
        ctx.fillRect(x0, y0, this.sizeSelector.value, this.sizeSelector.value);
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
    cursorDiv.style.backgroundColor =
        this.colorPalette.getSelectedColorWithOpacity();
    // Give cursor div border when opacity is low.
    if (this.colorPalette.getOpacity() < 0.2) {
      cursorDiv.style.border = '1px solid black';
      // Account for border.
      cursorDiv.style.width = parseInt(cursorDiv.style.width, 10) - 1 + 'px';
      cursorDiv.style.height = parseInt(cursorDiv.style.height, 10) - 1 + 'px';
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

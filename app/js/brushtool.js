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
function BrushTool(toolContext, optionProviders) {}

(function() {

  /**
   * Brush tool. Drawing using lineTo
   * (opacity not available).
   * @constructor
   * @struct
   * @implements {Tool}
   * @param {ToolContext} toolContext
   * @param {Object} optionProviders
   */
  function BrushTool(toolContext, optionProviders) {
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
  BrushTool.prototype.mouseDown = function(mouseCoordinates) {
    this.dragging = true;
    this.lastX = mouseCoordinates.sourceX;
    this.lastY = mouseCoordinates.sourceY;
    this.mouseMove(mouseCoordinates);
  };

  /**
   * Draw.
   * @param {MouseCoordinates} mouseCoordinates
   */
  BrushTool.prototype.mouseMove = function(mouseCoordinates) {
    if (!this.dragging)
      return;

    var ctx = this.sourceContext;
    ctx.beginPath();
    ctx.moveTo(this.lastX, this.lastY);
    ctx.lineWidth = this.sizeSelector.value;
    ctx.lineTo(Math.floor(mouseCoordinates.sourceX),
        Math.floor(mouseCoordinates.sourceY));
    ctx.strokeStyle = this.colorPalette.getSelectedColor();
    ctx.lineCap = 'round';
    ctx.stroke();
    this.lastX = mouseCoordinates.sourceX;
    this.lastY = mouseCoordinates.sourceY;
    // Redraw display canvas.
    this.drawDisplayCanvas();
  };

  /**
   * Stop draw.
   * @param {MouseCoordinates} mouseCoordinates
   */
  BrushTool.prototype.mouseUp = function(mouseCoordinates) {
    this.dragging = false;
  };

  /**
   * Stop draw.
   * @param {MouseCoordinates} mouseCoordinates
   */
  BrushTool.prototype.mouseLeave = function(mouseCoordinates) {
    this.dragging = false;
  };

  BrushTool.prototype.tearDown = function() {
  };

  /**
   * Set cursor guide image.
   * @param {Element} cursorDiv
   * @param {MouseCoordinates} mouseCoordinates
   * @param {number} zoomFactor
   * @return {boolean}
   */
  BrushTool.prototype.updateCursorGuide = function(
      cursorDiv, mouseCoordinates, zoomFactor) {
    // Styling.
    cursorDiv.style.width = (this.sizeSelector.value * zoomFactor) + 'px';
    cursorDiv.style.height = (this.sizeSelector.value * zoomFactor) + 'px';
    cursorDiv.style.borderRadius = '50%';
    cursorDiv.style.border = '1px solid black';
    cursorDiv.style.backgroundColor = 'none';
    // Position with middle of circle.
    var shift = this.sizeSelector.value / 2;
    cursorDiv.style.left =
        (mouseCoordinates.sourceX - shift) * zoomFactor + 'px';
    cursorDiv.style.top =
        (mouseCoordinates.sourceY - shift) * zoomFactor + 'px';
    return true;
  };

  bitmapper.BrushTool = BrushTool;
})();

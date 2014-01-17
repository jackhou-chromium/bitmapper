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
     * No drawing has occured yet.
     * @type {boolean}
     */
    this.dragging = false;

    /**
     * Draw display canvas callback.
     * @type {function()}
     */
    this.drawDisplayCanvas = toolContext.drawDisplayCanvas;

  };

  /**
   * Start draw.
   * @param {MouseCoordinates} mouseCoordinates
   */
  PencilTool.prototype.mouseDown = function(mouseCoordinates) {
    // TODO(dadisusila): Implement drawing crisp square pixel on click.
    this.sourceContext.beginPath();
    this.dragging = true;
  };

  /**
   * Draw.
   * @param {MouseCoordinates} mouseCoordinates
   */
  PencilTool.prototype.mouseMove = function(mouseCoordinates) {
    if (!this.dragging)
      return;

    var ctx = this.sourceContext;
    // Cancels out eraser destination-out.
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = this.sizeSelector.value * 2;
    ctx.lineTo(Math.floor(mouseCoordinates.sourceX),
        Math.floor(mouseCoordinates.sourceY));
    ctx.strokeStyle = this.colorPalette.getSelectedColorWithOpacity();
    ctx.stroke();
    ctx.beginPath();
    // The circles drawn represent individual points/ mouse clicks
    // and the circles are joined when the mouse is dragged to
    // make a smooth line.
    ctx.arc(mouseCoordinates.sourceX, mouseCoordinates.sourceY,
        this.sizeSelector.value, 0, Math.PI * 2);
    ctx.fillStyle = this.colorPalette.getSelectedColorWithOpacity();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(mouseCoordinates.sourceX, mouseCoordinates.sourceY);

    // Redraw display canvas.
    this.drawDisplayCanvas();
  };

  /**
   * Stop draw.
   */
  PencilTool.prototype.mouseUp = function() {
    this.dragging = false;
  };

  /**
   * Stop draw.
   */
  PencilTool.prototype.mouseLeave = function() {
    this.dragging = false;
  };

  bitmapper.PencilTool = PencilTool;
})();

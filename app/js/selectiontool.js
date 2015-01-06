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
 */
function SelectionTool(toolContext) {}

(function() {

  /**
   * Selection tool.
   * @constructor
   * @struct
   * @implements {Tool}
   * @param {ToolContext} toolContext
   */
  function SelectionTool(toolContext) {
    /**
     * @type {HTMLCanvasElement}
     */
    this.sourceCanvas = toolContext.sourceCanvas;

    /**
     * @type {CanvasRenderingContext2D}
     */
    this.sourceContext = Canvas2DContext(toolContext.sourceCanvas);

    /**
     * @type {SelectionCanvasManager}
     */
    this.selectionCanvasManager = toolContext.selectionCanvasManager;

    /**
     * Draw display canvas callback.
     * @type {function()}
     */
    this.drawDisplayCanvas = toolContext.drawDisplayCanvas;

    /**
     * @type {number}
     */
    this.firstSourceX = 0;

    /**
     * @type {number}
     */
    this.firstSourceY = 0;

    /**
     * @type {boolean}
     */
    this.dragging = false;

    /**
     * @type {boolean}
     */
    this.isSelected = false;
  };

  /**
   * Initiate selection.
   * @param {MouseCoordinates} mouseCoordinates
   */
  SelectionTool.prototype.mouseDown = function(mouseCoordinates) {
    if (this.isSelected)
      this.blitImage();

    this.dragging = true;
    // Set first co-ordinates.
    this.firstSourceX = Math.floor(mouseCoordinates.sourceX);
    this.firstSourceY = Math.floor(mouseCoordinates.sourceY);

    this.selectionCanvasManager.setVisible(true);
    this.selectionCanvasManager.setPosition(
        this.firstSourceX, this.firstSourceY);
    this.selectionCanvasManager.setSize(1, 1);
    this.selectionCanvasManager.drawSelectionCanvas();
  };

  /**
   * Dragging shrinks/grows and displays selection canvas.
   * @param {MouseCoordinates} mouseCoordinates
   */
  SelectionTool.prototype.mouseMove = function(mouseCoordinates) {
    if (!this.dragging || this.isSelected)
      return;

    var sourceX = bitmapper.util.constrain(
        Math.floor(mouseCoordinates.sourceX), 0, this.sourceCanvas.width);
    var sourceY = bitmapper.util.constrain(
        Math.floor(mouseCoordinates.sourceY), 0, this.sourceCanvas.height);

    var left = Math.min(sourceX, this.firstSourceX);
    var top = Math.min(sourceY, this.firstSourceY);
    this.selectionCanvasManager.setPosition(left, top);
    var width = Math.abs(sourceX - this.firstSourceX);
    var height = Math.abs(sourceY - this.firstSourceY);
    this.selectionCanvasManager.setSize(width, height);
    this.selectionCanvasManager.drawSelectionCanvas();
  };

  /**
   * Pops selection out and draws to selection source canvas.
   * @param {MouseCoordinates} mouseCoordinates
   */
  SelectionTool.prototype.mouseUp = function(mouseCoordinates) {
    if (this.selectionCanvasManager.isDragging())
      return;

    var selectionSourceCanvas = this.selectionCanvasManager.getCanvas();
    if (this.dragging)
      this.isSelected = true;

    this.dragging = false;
    var x = this.selectionCanvasManager.getX();
    var y = this.selectionCanvasManager.getY();
    var width = selectionSourceCanvas.width;
    var height = selectionSourceCanvas.height;

    Canvas2DContext(selectionSourceCanvas).drawImage(
        this.sourceCanvas, x, y, width, height, 0, 0, width, height);
    this.selectionCanvasManager.drawSelectionCanvas();

    // Clear source image behind selection.
    Canvas2DContext(this.sourceCanvas).clearRect(x, y, width, height);
    this.drawDisplayCanvas();
  };

  /**
   * @param {MouseCoordinates} mouseCoordinates
   */
  SelectionTool.prototype.mouseLeave = function(mouseCoordinates) {
  };

  /**
   * Draw selection source canvas onto source canvas.
   */
  SelectionTool.prototype.blitImage = function() {
    if (!this.isSelected)
      return;

    var selectionSourceCanvas = this.selectionCanvasManager.getCanvas();
    var left = this.selectionCanvasManager.canvasX;
    var top = this.selectionCanvasManager.canvasY;
    Canvas2DContext(this.sourceCanvas).drawImage(
        selectionSourceCanvas, left, top);
    this.drawDisplayCanvas();
    this.selectionCanvasManager.setVisible(false);
    this.isSelected = false;
  };

  /**
   * Clean up.
   */
  SelectionTool.prototype.tearDown = function() {
    this.blitImage();
    this.selectionCanvasManager.resetSelection();
    this.isSelected = false;
    this.dragging = false;
  };

  /**
   * Set cursor guide image.
   * @param {Element} cursorDiv
   * @param {MouseCoordinates} mouseCoordinates
   * @param {number} zoomFactor
   * @return {boolean}
   */
  SelectionTool.prototype.updateCursorGuide = function(
      cursorDiv, mouseCoordinates, zoomFactor) {
    return false;
  };

  bitmapper.SelectionTool = SelectionTool;
})();

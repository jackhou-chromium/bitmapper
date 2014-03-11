/**
 * @license Copyright 2014 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */



/**
 * @constructor
 * @struct
 * @param {HTMLElement} selectionCanvas
 * @param {ZoomManager} zoomManager
 */
function SelectionCanvasManager(selectionCanvas, zoomManager) {}

(function() {

  /**
   * Selection canvas. Methods are relative to selection source canvas and
   * redrawn onto selection canvas when displayed.
   * @constructor
   * @struct
   * @param {HTMLElement} selectionCanvas
   * @param {ZoomManager} zoomManager
   */
  function SelectionCanvasManager(selectionCanvas, zoomManager) {
    /**
     * Selection relative to source co-ordinates.
     * @type {Element}
     */
    this.selectionSourceCanvas = document.createElement('canvas');

    /**
     * Selection displayed on this canvas.
     * Inline styling needed here for manipulation in methods.
     * @type {HTMLElement}
     */
    this.selectionCanvas = selectionCanvas;
    this.selectionCanvas.style.display = 'none';

    /**
     * @type {ZoomManager}
     */
    this.zoomManager = zoomManager;

    /**
     * @type {boolean}
     */
    this.dragging = false;

    /**
     * X co-ordinate of top left corner of selection canvas.
     * Needed for hit test.
     * @type {number}
     */
    this.canvasX = 0;

    /**
     * X co-ordinate of top left corner of selection canvas.
     * Needed for hit test.
     * @type {number}
     */
    this.canvasY = 0;

    /**
     * During mouse move, position of selection canvas is calculated from this.
     * @type {number}
     */
    this.beforeDragX = 0;

    /**
     * During mouse move, position of selection canvas is calculated from this.
     * @type {number}
     */
    this.beforeDragY = 0;

    /**
     * Distances calculated from mouse down co-ordinate on selection canvas.
     * @type {number}
     */
    this.mouseDownX = 0;

    /**
     * Distances calculated from mouse down co-ordinate on selection canvas.
     * @type {number}
     */
    this.mouseDownY = 0;

    /**
     * @type {boolean}
     */
    this.isVisible = false;
  };

  /**
   * Sets visibility of the selection canvas.
   * @param {boolean} visible
   */
  SelectionCanvasManager.prototype.setVisible = function(visible) {
    this.selectionCanvas.style.display = visible ? 'block' : 'none';
    this.isVisible = visible;
  };

  /**
   * Sets top left position of selection source canvas.
   * @param {number} x
   * @param {number} y
   */
  SelectionCanvasManager.prototype.setPosition = function(x, y) {
    this.canvasX = Math.round(x);
    this.canvasY = Math.round(y);
    this.beforeDragX = Math.round(x);
    this.beforeDragY = Math.round(y);
  };

  /**
   * Sets size of selection source canvas.
   * @param {number} width
   * @param {number} height
   */
  SelectionCanvasManager.prototype.setSize = function(width, height) {
    // Prevent width or height of 0.
    this.selectionSourceCanvas.width = Math.max(Math.round(width), 1);
    this.selectionSourceCanvas.height = Math.max(Math.round(height), 1);
  };

  /**
   * Returns selection source canvas.
   * @return {Element}
   */
  SelectionCanvasManager.prototype.getCanvas = function() {
    return this.selectionSourceCanvas;
  };

  /**
   * Returns X co-ordinate of top left corner of selection source canvas.
   */
  SelectionCanvasManager.prototype.getX = function() {
    return this.canvasX;
  };

  /**
   * Returns Y co-ordinate of top left corner of selection source canvas.
   */
  SelectionCanvasManager.prototype.getY = function() {
    return this.canvasY;
  };

  /**
   * Returns whether selection canvas is being dragged or not.
   */
  SelectionCanvasManager.prototype.isDragging = function() {
    return this.dragging;
  };

  /**
   * Hit test.
   * @param {MouseCoordinates} mouseCoordinates
   */
  SelectionCanvasManager.prototype.isInHitArea = function(mouseCoordinates) {
    if (!this.isVisible)
      return false;

    var leftEdge = this.canvasX;
    var rightEdge = this.canvasX + this.selectionSourceCanvas.width;
    var topEdge = this.canvasY;
    var bottomEdge = this.canvasY + this.selectionSourceCanvas.height;

    return (mouseCoordinates.sourceX > leftEdge &&
            mouseCoordinates.sourceX < rightEdge &&
            mouseCoordinates.sourceY > topEdge &&
            mouseCoordinates.sourceY < bottomEdge);
  };

  /**
   * Scales and redraws the source selection canvas onto selection canvas.
   */
  SelectionCanvasManager.prototype.drawSelectionCanvas = function() {
    if (!this.isVisible)
      return;

    // Scaling.
    var zoomFactor = this.zoomManager.getZoomFactor();
    this.selectionCanvas.width =
        this.selectionSourceCanvas.width * zoomFactor;
    this.selectionCanvas.height =
        this.selectionSourceCanvas.height * zoomFactor;
    // Drawing.
    var selectionCanvasContext = this.selectionCanvas.getContext('2d');
    selectionCanvasContext.imageSmoothingEnabled = false;
    selectionCanvasContext.drawImage(this.selectionSourceCanvas, 0, 0,
        this.selectionCanvas.width, this.selectionCanvas.height);
    selectionCanvasContext.save();
    selectionCanvasContext.beginPath();
    selectionCanvasContext.strokeStyle = '#FFF';
    selectionCanvasContext.strokeRect(0.5, 0.5,
                                      this.selectionCanvas.width - 1,
                                      this.selectionCanvas.height - 1);
    selectionCanvasContext.strokeStyle = '#000';
    selectionCanvasContext.setLineDash([2, 2]);
    selectionCanvasContext.strokeRect(0.5, 0.5,
                                      this.selectionCanvas.width - 1,
                                      this.selectionCanvas.height - 1);
    selectionCanvasContext.restore();
    // Positioning.
    this.selectionCanvas.style.left =
        this.canvasX * zoomFactor + 'px';
    this.selectionCanvas.style.top =
        this.canvasY * zoomFactor + 'px';
  };

  /**
   * Initiate dragging.
   * @param {MouseCoordinates} mouseCoordinates
   */
  SelectionCanvasManager.prototype.mouseDown = function(mouseCoordinates) {
    this.mouseDownX = mouseCoordinates.sourceX;
    this.mouseDownY = mouseCoordinates.sourceY;
    this.dragging = true;
  };

  /**
   * Handle dragging of selection canvas.
   * @param {MouseCoordinates} mouseCoordinates
   */
  SelectionCanvasManager.prototype.mouseMove = function(mouseCoordinates) {
    if (this.dragging) {
      var deltaX = Math.floor(mouseCoordinates.sourceX - this.mouseDownX);
      var deltaY = Math.floor(mouseCoordinates.sourceY - this.mouseDownY);
      this.canvasX = this.beforeDragX + deltaX;
      this.canvasY = this.beforeDragY + deltaY;
      this.drawSelectionCanvas();
    }
  };

  /**
   * Stop dragging.
   * @param {MouseCoordinates} mouseCoordinates
   */
  SelectionCanvasManager.prototype.mouseUp = function(mouseCoordinates) {
    this.dragging = false;
    this.beforeDragX = this.canvasX;
    this.beforeDragY = this.canvasY;
  };

  /**
   * Stop dragging.
   * @param {MouseCoordinates} mouseCoordinates
   */
  SelectionCanvasManager.prototype.mouseLeave = function(mouseCoordinates) {
    this.mouseUp(mouseCoordinates);
  };

  /**
   * Clear selection.
   */
  SelectionCanvasManager.prototype.resetSelection = function() {
    this.selectionSourceCanvas.getContext('2d').clearRect(0, 0,
        this.selectionSourceCanvas.width, this.selectionSourceCanvas.height);
    this.setSize(1, 1);
    this.setPosition(0, 0);
    this.drawSelectionCanvas();
  };

  bitmapper.SelectionCanvasManager = SelectionCanvasManager;
})();

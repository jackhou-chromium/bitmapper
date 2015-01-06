/**
 * @license Copyright 2013 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */



/**
 * @constructor
 * @struct
 * @param {HTMLCanvasElement} sourceCanvas
 * @param {HTMLCanvasElement} displayCanvas
 * @param {HTMLElement} canvasPlaceholder
 * @param {HTMLElement} canvasViewport
 */
function ZoomManager(sourceCanvas,
                     displayCanvas,
                     canvasPlaceholder,
                     canvasViewport) {
}

(function() {

  /**
   * Encapsulates data related to the zoom manager.
   * @constructor
   * @struct
   * @param {HTMLCanvasElement} sourceCanvas
   * @param {HTMLCanvasElement} displayCanvas
   * @param {HTMLElement} canvasPlaceholder
   * @param {HTMLElement} canvasViewport
   */
  function ZoomManager(sourceCanvas,
                       displayCanvas,
                       canvasPlaceholder,
                       canvasViewport) {
    /**
     * @type {number}
     */
    this.zoomFactor = 1;

    /**
     * @type {HTMLCanvasElement}
     */
    this.sourceCanvas = sourceCanvas;

    /**
     * @type {HTMLCanvasElement}
     */
    this.displayCanvas = displayCanvas;

    /**
     * @type {HTMLElement}
     * A placeholder for the displayCanvas which sizes to the logical pixel size
     * of the zoomed image.
     */
    this.canvasPlaceholder = canvasPlaceholder;

    /**
     * @type {HTMLElement}
     * The element which controls the scrolling and visible region of the
     * displayed image.
     */
    this.canvasViewport = canvasViewport;

    var outer = this;
    canvasViewport.addEventListener(
        'scroll',
        function() { outer.drawDisplayCanvas(); },
        true);

    this.drawDisplayCanvas();
  };

  /**
   * Sets zoom factor, repositioning the viewport to respect |anchorX| and
   * |anchorY|.
   * @param {number} zoomFactor
   * @param {number} anchorX
   * @param {number} anchorY
   */
  ZoomManager.prototype.setZoomFactor = function(
      zoomFactor, anchorX, anchorY) {
    this.repositionViewportForZoom(
        anchorX, anchorY, this.zoomFactor, zoomFactor);
    this.zoomFactor = zoomFactor;
  };

  /**
   * Sets the top and left of the canvasViewport to keep |anchorX| and |anchorY|
   * in the same place relative to the visible area. Clamps to the canvas bounds
   * if repositioning would show an area outside the image.
   *
   * The anchor is specified in display coordinates.
   * @param {number} anchorX
   * @param {number} anchorY
   * @param {number} oldZoom
   * @param {number} newZoom
   */
  ZoomManager.prototype.repositionViewportForZoom = function(
      anchorX, anchorY, oldZoom, newZoom) {
    var anchorDistanceX = anchorX - this.canvasViewport.scrollLeft;
    var anchorDistanceY = anchorY - this.canvasViewport.scrollTop;

    var rescaledAnchorX = anchorX * newZoom / oldZoom;
    var rescaledAnchorY = anchorY * newZoom / oldZoom;

    var scrollLeftMax = Math.max(0,
        this.sourceCanvas.width * newZoom - this.canvasViewport.clientWidth);
    var scrollTopMax = Math.max(0,
        this.sourceCanvas.height * newZoom - this.canvasViewport.clientHeight);

    // Resize the canvas placeholder first so that there's sufficient scrollbar
    // on zoom-in.
    this.resizeCanvasPlaceholder(newZoom);
    this.canvasViewport.scrollLeft =
        bitmapper.util.constrain(rescaledAnchorX - anchorDistanceX,
                                 0,
                                 scrollLeftMax);
    this.canvasViewport.scrollTop =
        bitmapper.util.constrain(rescaledAnchorY - anchorDistanceY,
                                 0,
                                 scrollTopMax);
  };

  /**
   * Resizes the canvasPlaceholder to fill up the space of the sourceCanvas
   * zoomed |zoom| times.
   * @param {number} zoom
   */
  ZoomManager.prototype.resizeCanvasPlaceholder = function(zoom) {
    // Size the placeholder to the desired image size.
    this.canvasPlaceholder.style.height =
        (this.sourceCanvas.height * zoom) + 'px';
    this.canvasPlaceholder.style.width =
        (this.sourceCanvas.width * zoom) + 'px';
  };

  /**
   * Scales and redraws the display canvas.
   */
  ZoomManager.prototype.drawDisplayCanvas = function() {
    var zoom = this.zoomFactor;
    this.resizeCanvasPlaceholder(zoom);

    // Size and move the displayCanvas to the area visible in the viewport.
    var left = this.canvasViewport.scrollLeft;
    var top = this.canvasViewport.scrollTop;
    this.displayCanvas.style.left = left + 'px';
    this.displayCanvas.style.top = top + 'px';
    this.displayCanvas.height = this.canvasViewport.clientHeight;
    this.displayCanvas.width = this.canvasViewport.clientWidth;

    var displayContext = Canvas2DContext(this.displayCanvas);
    // Displays crisp pixels when scaled.
    displayContext.imageSmoothingEnabled = false;
    displayContext.clearRect(
        0, 0, this.displayCanvas.width, this.displayCanvas.height);

    // Draw the visible region of the sourceCanvas to the display canvas.
    displayContext.drawImage(
        this.sourceCanvas,
        left / zoom, top / zoom,
        this.displayCanvas.width / zoom,
        this.displayCanvas.height / zoom,
        0,
        0,
        this.displayCanvas.width,
        this.displayCanvas.height);
  };

  /**
   * Returns current zoom factor.
   * @return {number}
   */
  ZoomManager.prototype.getZoomFactor = function() {
    return this.zoomFactor;
  };

  /**
   * Calculates the co-ordinate relative to source canvas.
   * @param {number} displayCoordinate
   * @return {number}
   */
  ZoomManager.prototype.getSourceCoordinate = function(displayCoordinate) {
    return displayCoordinate / this.zoomFactor;
  };

  bitmapper.ZoomManager = ZoomManager;
})();

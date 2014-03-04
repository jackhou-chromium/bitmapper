/**
 * @license Copyright 2013 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */



/**
 * @constructor
 * @struct
 * @param {HTMLElement} sourceCanvas
 * @param {HTMLElement} displayCanvas
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
   * @param {HTMLElement} sourceCanvas
   * @param {HTMLElement} displayCanvas
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
     * @type {HTMLElement}
     */
    this.sourceCanvas = sourceCanvas;

    /**
     * @type {HTMLElement}
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
    canvasViewport.addEventListener(
        'scroll',
        function() { this.drawDisplayCanvas(); }.bind(this),
        true);

    this.drawDisplayCanvas();
  };

  /**
   * Sets zoom factor.
   * @param {number} zoomFactor
   */
  ZoomManager.prototype.setZoomFactor = function(zoomFactor) {
    this.zoomFactor = zoomFactor;
  };

  /**
   * Scales and redraws the display canvas.
   */
  ZoomManager.prototype.drawDisplayCanvas = function() {
    var zoom = this.zoomFactor;
    // Size the placeholder to the desired image size.
    this.canvasPlaceholder.style.height =
        (this.sourceCanvas.height * zoom) + 'px';
    this.canvasPlaceholder.style.width =
        (this.sourceCanvas.width * zoom) + 'px';

    // Size and move the displayCanvas to the area visible in the viewport.
    var left = this.canvasViewport.scrollLeft;
    var top = this.canvasViewport.scrollTop;
    this.displayCanvas.style.left = left + 'px';
    this.displayCanvas.style.top = top + 'px';
    this.displayCanvas.height = this.canvasViewport.clientHeight;
    this.displayCanvas.width = this.canvasViewport.clientWidth;

    var displayContext = this.displayCanvas.getContext('2d');
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

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
 */
function ZoomManager(sourceCanvas, displayCanvas) {}

(function() {

  /** @const {number} MAX_AREA */
  var MAX_AREA = 15000000;

  /**
   * Encapsulates data related to the zoom manager.
   * @constructor
   * @struct
   * @param {HTMLElement} sourceCanvas
   * @param {HTMLElement} displayCanvas
   */
  function ZoomManager(sourceCanvas, displayCanvas) {
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
    this.displayCanvas.height = this.sourceCanvas.height * this.zoomFactor;
    this.displayCanvas.width = this.sourceCanvas.width * this.zoomFactor;
    var displayContext = this.displayCanvas.getContext('2d');
    // Displays crisp pixels when scaled.
    displayContext.imageSmoothingEnabled = false;
    displayContext.drawImage(this.sourceCanvas,
        0, 0, this.displayCanvas.width, this.displayCanvas.height);
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

  /**
   * Returns true if display canvas is too large.
   * @return {boolean}
   */
  ZoomManager.prototype.exceededZoomLimit = function() {
    return (this.displayCanvas.height * this.displayCanvas.width) > MAX_AREA;
  };

  bitmapper.ZoomManager = ZoomManager;
})();

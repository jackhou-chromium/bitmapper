/**
 * Copyright 2013 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */

(function() {

/**
 * Encapsulates data related to the zoom manager.
 * @constructor
 * @param {HTMLElement} sourceCanvas
 * @param {HTMLElement} displayCanvas
 */
function ZoomManager(sourceCanvas, displayCanvas) {
  this.zoomFactor = 1;
  this.sourceCanvas = sourceCanvas;
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
 */
ZoomManager.prototype.getZoomFactor = function() {
  return this.zoomFactor;
};

/**
 * Calculates the co-ordinate relative to source canvas.
 * @param {number} displayCoordinate
 */
ZoomManager.prototype.getSourceCoordinate = function(displayCoordinate) {
  return displayCoordinate / this.zoomFactor;
};

bitmapper.ZoomManager = ZoomManager;
})();
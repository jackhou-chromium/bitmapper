/**
 * @license Copyright 2014 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */



/**
 * @constructor
 * @struct
 * @param {HTMLElement} canvasWrapper
 * @param {ZoomManager} zoomManager
 */
function CursorGuide(canvasWrapper, zoomManager) {}

(function() {

  /**
   * Cursor guide displays cursor for selected tool.
   * @constructor
   * @struct
   * @param {HTMLElement} canvasWrapper
   * @param {ZoomManager} zoomManager
   */
  function CursorGuide(canvasWrapper, zoomManager) {
    /**
     * Container div for cursor content div.
     * @type {HTMLElement}
     */
    this.canvasWrapper = canvasWrapper;

    /**
     * Container div for cursor content div.
     * @type {Element}
     */
    this.cursorDiv = document.createElement('div');
    this.canvasWrapper.appendChild(this.cursorDiv);
    /**
     * @type {Tool}
     */
    this.tool = null;

    /**
     * @type {ZoomManager}
     */
    this.zoomManager = zoomManager;
  };


  /**
   * Current tool updates the content div.
   * Display, translate and scale the cursor div.
   * @param {MouseCoordinates} mouseCoordinates
   */
  CursorGuide.prototype.setPosition = function(mouseCoordinates) {
    // Reset cursorDiv.
    this.canvasWrapper.style.cursor = 'none';
    this.canvasWrapper.removeChild(this.cursorDiv);
    this.cursorDiv = document.createElement('div');
    this.cursorDiv.className = 'cursorDiv';

    if (!this.tool.updateCursorGuide(
        this.cursorDiv, mouseCoordinates, this.zoomManager.getZoomFactor())) {
      this.hide();
      this.canvasWrapper.style.cursor = 'default';
      this.canvasWrapper.appendChild(this.cursorDiv);
      return;
    }
    this.canvasWrapper.appendChild(this.cursorDiv);
  };

  /**
   * Set the selected tool.
   * @param {Tool} tool
   */
  CursorGuide.prototype.setTool = function(tool) {
    this.tool = tool;
  };

  /**
   * Hide the cursor.
   */
  CursorGuide.prototype.hide = function() {
    this.cursorDiv.style.display = 'none';
  };

  bitmapper.CursorGuide = CursorGuide;
})();

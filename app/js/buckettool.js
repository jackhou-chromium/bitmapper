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
 * @param {OptionProviders} optionProviders
 *
 */
function BucketTool(toolContext, optionProviders) {}

(function() {

  /**
   * Size of cursor image.
   * @const
   */
  var CURSOR_SIZE = 16;

  /**
   * Bucket tool. Replaces connected pixels of the same color and alpha with
   * the current color.
   * @constructor
   * @struct
   * @implements {Tool}
   * @param {ToolContext} toolContext
   * @param {OptionProviders} optionProviders
   */
  function BucketTool(toolContext, optionProviders) {
    /**
     * @type {HTMLCanvasElement}
     */
    this.sourceCanvas = toolContext.sourceCanvas;

    /**
     * @type {CanvasRenderingContext2D}
     */
    this.sourceContext = Canvas2DContext(this.sourceCanvas);

    /**
     * @type {ColorPalette}
     */
    this.colorPalette = optionProviders.colorPalette;

    /**
     * Draw display canvas callback.
     * @type {function()}
     */
    this.drawDisplayCanvas = toolContext.drawDisplayCanvas;

    /**
     * Cursor image.
     * @type {Element}
     */
    this.cursorDiv = document.createElement('div');
    this.cursorDiv.style.width = CURSOR_SIZE + 'px';
    this.cursorDiv.style.height = CURSOR_SIZE + 'px';
    this.cursorDiv.style.backgroundImage =
        'url("images/bucket_cursor.png")';

  };


  /**
   * Do bucket fill on mouse down.
   * @param {MouseCoordinates} mouseCoordinates
   */
  BucketTool.prototype.mouseDown = function(mouseCoordinates) {
    var color = bitmapper.rgbaToArray(
        this.colorPalette.getSelectedColorWithOpacity());
    var x = Math.floor(mouseCoordinates.sourceX);
    var y = Math.floor(mouseCoordinates.sourceY);
    var fromColor = this.sourceContext.getImageData(x, y, 1, 1).data;
    if (fromColor[0] == color[0] &&
        fromColor[1] == color[1] &&
        fromColor[2] == color[2] &&
        fromColor[3] == color[3]) {
      return;
    }
    floodfill(x, y,
              color,
              this.sourceContext,
              this.sourceCanvas.width, this.sourceCanvas.height,
              0 /* tolerance */);
    this.drawDisplayCanvas();
  };

  /**
   * @param {MouseCoordinates} mouseCoordinates
   */
  BucketTool.prototype.mouseMove = function(mouseCoordinates) {
  };

  /**
   * @param {MouseCoordinates} mouseCoordinates
   */
  BucketTool.prototype.mouseUp = function(mouseCoordinates) {
  };

  /**
   * @param {MouseCoordinates} mouseCoordinates
   */
  BucketTool.prototype.mouseLeave = function(mouseCoordinates) {
  };

  BucketTool.prototype.tearDown = function() {
  };

  /**
   * Set cursor guide image.
   * @param {Element} cursorDiv
   * @param {MouseCoordinates} mouseCoordinates
   * @param {number} zoomFactor
   * @return {boolean}
   */
  BucketTool.prototype.updateCursorGuide = function(
      cursorDiv, mouseCoordinates, zoomFactor) {
    cursorDiv.appendChild(this.cursorDiv);
    // Tip of pipette matches mouse co-ordinate.
    cursorDiv.style.left =
        mouseCoordinates.sourceX * zoomFactor + 'px';
    cursorDiv.style.top =
        mouseCoordinates.sourceY * zoomFactor - CURSOR_SIZE + 'px';
    return true;
  };

  bitmapper.BucketTool = BucketTool;
})();

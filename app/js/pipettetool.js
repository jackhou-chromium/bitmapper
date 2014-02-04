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
 * @param {function()} callback
 */
function PipetteTool(toolContext, callback) {}

(function() {

  /**
   * Pipette tool. Gets the color of the selected pixel on the
   * display canvas and puts it on the color palette.
   * @constructor
   * @struct
   * @implements {Tool}
   * @param {ToolContext} toolContext
   * @param {function()} callback
   */
  function PipetteTool(toolContext, callback) {
    /**
     * @type {HTMLElement}
     */
    this.sourceCanvas = toolContext.sourceCanvas;

    /**
     * @type {CanvasRenderingContext2D}
     */
    this.sourceContext = toolContext.sourceCanvas.getContext('2d');

    /**
     * Called when color is selected.
     * The parameters are the color, the opacity value of the color
     * and whether the mouse has finished moving.
     * Opacity is a value in [0,1].
     * @type {function(string, number, boolean)}
     */
    this.callback = callback;

    /**
     * The selected color.
     * @type {string}
     */
    this.pipetteColor = 'rgb(0, 0, 0)';

    /**
     * The opacity value of the selected color.
     * @type {number}
     */
    this.opacity = 0;

    /**
     * Whether the mouse is being held down for a drag.
     * @type {boolean}
     */
    this.dragging = false;
  };

  /**
   * Gets the color of the selected pixel.
   * @param {MouseCoordinates} mouseCoordinates
   */
  PipetteTool.prototype.mouseDown = function(mouseCoordinates) {
    this.dragging = true;
    this.mouseMove(mouseCoordinates);
  };

  /**
   * Calls callback.
   * @param {MouseCoordinates} mouseCoordinates
   */
  PipetteTool.prototype.mouseUp = function(mouseCoordinates) {
    this.dragging = false;
    this.callback(this.pipetteColor, this.opacity, true);
  };

  /**
   * @param {MouseCoordinates} mouseCoordinates
   */
  PipetteTool.prototype.mouseLeave = function(mouseCoordinates) {
  };

  /**
   * Gets color of pixel under mouse and calls callback.
   * @param {MouseCoordinates} mouseCoordinates
   */
  PipetteTool.prototype.mouseMove = function(mouseCoordinates) {
    // Return if pipette moves outside canvas.
    if (!this.dragging || mouseCoordinates.sourceX > this.sourceCanvas.width ||
        mouseCoordinates.sourceY > this.sourceCanvas.height)
      return;

    var imageData = this.sourceContext.getImageData(
        mouseCoordinates.sourceX, mouseCoordinates.sourceY,
        1, 1);
    // Checks if pixel is valid, else set it to an array of zeros.
    var pixel = imageData.data || [0, 0, 0, 0];
    var pixelColor = 'rgb(' +
        pixel[0] + ', ' +
        pixel[1] + ', ' +
        pixel[2] + ')';
    // Selected colour is stored in variable pipetteColor.
    this.pipetteColor = pixelColor;
    // The opacity, given as a value from 0 to 255,
    // is converted into a value from 0 to 1.
    this.opacity = pixel[3] / 255;
    this.callback(this.pipetteColor, this.opacity, false);
  };

  bitmapper.PipetteTool = PipetteTool;
})();

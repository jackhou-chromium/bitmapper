/**
 * @license Copyright 2013 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */



/**
 * Mouse Coordinates.
 * @constructor
 * @struct
 */
function MouseCoordinates() {
  /**
   * @type {number}
   */
  this.sourceX = 0;
  /**
   * @type {number}
   */
  this.sourceY = 0;
  /**
   * @type {boolean}
   */
  this.inCanvas = false;
}



/**
 * Contains elements and callbacks Tools need.
 * @constructor
 * @struct
 * @param {HTMLCanvasElement} sourceCanvas
 * @param {HTMLCanvasElement} displayCanvas
 * @param {HTMLCanvasElement} brushCanvas
 * @param {SelectionCanvasManager} selectionCanvasManager
 * @param {function()} drawDisplayCanvas
 */
function ToolContext(sourceCanvas, displayCanvas, brushCanvas,
    selectionCanvasManager, drawDisplayCanvas) {
  /**
   * @type {HTMLCanvasElement}
   */
  this.sourceCanvas = sourceCanvas;
  /**
   * @type {HTMLCanvasElement}
   */
  this.displayCanvas = displayCanvas;
  /**
   * @type {HTMLCanvasElement}
   */
  this.brushCanvas = brushCanvas;
  /**
   * @type {SelectionCanvasManager}
   */
  this.selectionCanvasManager = selectionCanvasManager;
  /**
   * @type {function()}
   */
  this.drawDisplayCanvas = drawDisplayCanvas;
}



/**
 * Option providers for tools.
 * @constructor
 * @param {ColorPalette} colorPalette
 * @param {HTMLInputElement} sizeSelector
 * @struct
 */
function OptionProviders(colorPalette, sizeSelector) {
  /**
   * @type {ColorPalette}
   */
  this.colorPalette = colorPalette;
  /**
   * @type {HTMLInputElement}
   */
  this.sizeSelector = sizeSelector;
}



/**
 * Tool interface.
 * @interface
 */
function Tool() {}


/**
 * @param {MouseCoordinates} mouseCoordinates
 * @param {boolean=} opt_doLine
 */
Tool.prototype.mouseDown = function(mouseCoordinates, opt_doLine) {};


/**
 * @param {MouseCoordinates} mouseCoordinates
 */
Tool.prototype.mouseUp = function(mouseCoordinates) {};


/**
 * @param {MouseCoordinates} mouseCoordinates
 */
Tool.prototype.mouseMove = function(mouseCoordinates) {};


/**
 * @param {MouseCoordinates} mouseCoordinates
 */
Tool.prototype.mouseLeave = function(mouseCoordinates) {};


/**
 * Tool will clean up after itself.
 */
Tool.prototype.tearDown = function() {};


/**
 * Return if tool needs cursor guide or not and update cursor guide.
 * @param {Element} contentDiv
 * @param {MouseCoordinates} mouseCoordinates
 * @param {number} zoomFactor
 * @return {boolean}
 */
Tool.prototype.updateCursorGuide = function(
    contentDiv, mouseCoordinates, zoomFactor) {};

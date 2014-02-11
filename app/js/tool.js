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
}



/**
 * Contains elements and callbacks Tools need.
 * @constructor
 * @struct
 * @param {HTMLElement} sourceCanvas
 * @param {HTMLElement} displayCanvas
 * @param {function()} drawDisplayCanvas
 */
function ToolContext(sourceCanvas, displayCanvas, drawDisplayCanvas) {
  /**
   * @type {HTMLElement}
   */
  this.sourceCanvas = sourceCanvas;
  /**
   * @type {HTMLElement}
   */
  this.displayCanvas = displayCanvas;
  /**
   * @type {function()}
   */
  this.drawDisplayCanvas = drawDisplayCanvas;
}



/**
 * Tool interface.
 * @interface
 */
function Tool() {}


/**
 * @param {MouseCoordinates} mouseCoordinates
 */
Tool.prototype.mouseDown = function(mouseCoordinates) {};


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
 * Return if tool needs cursor guide or not and update cursor guide.
 * @param {Element} contentDiv
 * @param {MouseCoordinates} mouseCoordinates
 * @param {number} zoomFactor
 * @return {boolean}
 */
Tool.prototype.updateCursorGuide = function(
    contentDiv, mouseCoordinates, zoomFactor) {};

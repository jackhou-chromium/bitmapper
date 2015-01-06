/**
 * @license Copyright 2014 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */

/**
 * @fileoverview Utility functions.
 */

bitmapper.util = {};


/**
 * Utility function to constrain a value between a min and max.
 *
 * Throws an exception if |minValue| is greater than |maxValue|.
 * @param {number} value
 * @param {number} minValue
 * @param {number} maxValue
 * @return {number}
 */
bitmapper.util.constrain = function(value, minValue, maxValue) {
  if (minValue > maxValue)
    throw new Error('minValue is greater than maxValue');
  return Math.min(Math.max(minValue, value), maxValue);
};


/**
 * Closure helper function to return a new, temporary, typed HTMLCanvasElement.
 *
 * @return {HTMLCanvasElement}
 */
function CreateCanvasElement() {
  return /** @type {HTMLCanvasElement} */(document.createElement('canvas'));
}


/**
 * Closure helper function to retrieve an existing, typed HTMLCanvasElement from
 * the document by ID.
 *
 * @param {string} canvasId The element ID of an existing canvas element.
 * @return {HTMLCanvasElement}
 */
function GetCanvasElement(canvasId) {
  return /** @type {HTMLCanvasElement} */(document.getElementById(canvasId));
}


/**
 * Closure helper function to return a typed, 2D drawing context from |canvas|.
 * Since HTMLCanvasElement::getContext() returns a different type based on
 * whether its (string) argument is '2d' or '3d', this helper function allows
 * Closure to perform more rigorous type checks on the return value.
 *
 * @param {HTMLCanvasElement} canvas The canvas element to call getContext() on.
 * @return {CanvasRenderingContext2D}
 */
function Canvas2DContext(canvas) {
  return /** @type {CanvasRenderingContext2D} */(canvas.getContext('2d'));
}

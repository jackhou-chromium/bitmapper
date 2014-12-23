// Copyright 2013 Google Inc. All rights reserved.
// Use of this source code is governed by the Apache license that can be
// found in the LICENSE file.

// This file defines all the functions that the closure compiler does not know
// about. More info here:
// http://developers.google.com/closure/compiler/docs/api-tutorial3#externs


/**
 * @param {string} data data
 */
var atob = function(data) {};


/**
 * @param {number} x
 * @param {number} y
 * @param {Array} fillcolor
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width
 * @param {number} height
 * @param {number} tolerance
 */
var floodfill = function(x, y, fillcolor, ctx, width, height, tolerance) {};


/**
 * Declare all our polymer properties so Closure doesn't optimize them out.
 *
 * @type {Object}
 * @const
 */
HTMLElement.prototype.$ = {
  sliderModel: { size: 0, opacity: 0, zoom: 0},
  resizeInput: {},
  sizeSelector: {}
};


/**
 * Expose Object.observe to closure. Eventually this should be bundled inside
 * the Closure compiler.jar and this can be removed. But it's not there yet.
 */
Object.observe = function(object, callback) {};


/**
 * @type {boolean}
 */
CanvasRenderingContext2D.prototype.imageSmoothingEnabled;

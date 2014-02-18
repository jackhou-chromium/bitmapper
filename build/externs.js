// Copyright 2013 Google Inc. All rights reserved.
// Use of this source code is governed by the Apache license that can be
// found in the LICENSE file.

// This file defines all the functions that the closure compiler does not know
// about. More info here:
// http://developers.google.com/closure/compiler/docs/api-tutorial3#externs


/**
 * @param {function(Entry)} callback callback
 */
chrome.runtime.getPackageDirectoryEntry = function(callback) {};


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
 * @type {boolean}
 */
CanvasRenderingContext2D.prototype.imageSmoothingEnabled;

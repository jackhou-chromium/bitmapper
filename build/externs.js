// Copyright 2013 Google Inc. All rights reserved.
// Use of this source code is governed by the Apache license that can be
// found in the LICENSE file.

// This file defines all the functions that the closure compiler does not know
// about. More info here:
// http://developers.google.com/closure/compiler/docs/api-tutorial3#externs

chrome.fileSystem = {
  chooseEntry: function(a, b) {}
};

var console = {
  log: function(s) {}
};

/** @constructor */
function RenderingContext() {}

/**
 * @param {Image} image image.
 * @param {number} dx dx.
 * @param {number} dy dy.
 * @param {number} dw dw.
 * @param {number} dh dh.
 */
RenderingContext.prototype.drawImage = function(image, dx, dy, dw, dh) {};

/**
 * @param {number} dx dx.
 * @param {number} dy dy.
 * @param {number} dw dw.
 * @param {number} dh dh.
 */
RenderingContext.prototype.clearRect = function(dx, dy, dw, dh) {};

/**
 * @param {number} dx dx.
 * @param {number} dy dy.
 * @param {number} dw dw.
 * @param {number} dh dh.
 */
RenderingContext.prototype.fillRect = function(dx, dy, dw, dh) {};

/**
 * @param {number} dx dx.
 * @param {number} dy dy.
 * @param {number} dw dw.
 * @param {number} dh dh.
 */
RenderingContext.prototype.strokeRect = function(dx, dy, dw, dh) {};

/**
 * @param {number} x0 x0.
 * @param {number} y0 y0.
 * @param {number} r0 r0.
 * @param {number} x1 x1.
 * @param {number} y1 y1.
 * @param {number} r1 r1.
 * @return {Object}
 */
RenderingContext.prototype.createRadialGradient =
    function(x0, y0, r0, x1, y1, r1) {};

/**
 * @param {number} x0 x0.
 * @param {number} y0 y0.
 * @param {number} x1 x1.
 * @param {number} y1 y1.
 * @return {Object}
 */
RenderingContext.prototype.createLinearGradient = function(x0, y0, x1, y1) {};

/**
 * @param {number} x x.
 * @param {number} y y.
 * @param {number} r r.
 * @param {number} startAngle start angle.
 * @param {number} endAngle end angle.
 * @return {Object}
 */
RenderingContext.prototype.arc = function(x, y, r, startAngle, endAngle) {};

/**
 * @param {number} cpx cpx.
 * @param {number} cpy cpy.
 * @param {number} x x.
 * @param {number} y y.
 */
RenderingContext.prototype.quadraticCurveTo = function(cpx, cpy, x, y) {};

/**
 * @param {number} x x.
 * @param {number} y y.
 */
RenderingContext.prototype.moveTo = function(x, y) {};

/**
 * @param {number} x x.
 * @param {number} y y.
 */
RenderingContext.prototype.lineTo = function(x, y) {};

/**
 * @param {string} text text.
 * @param {number} x x.
 * @param {number} y y.
 * @param {number=} maxWidth maxWidth.
 */
RenderingContext.prototype.fillText = function(text, x, y, maxWidth) {};

/** */
RenderingContext.prototype.beginPath = function() {};
/** */
RenderingContext.prototype.closePath = function() {};
/** */
RenderingContext.prototype.fill = function() {};
/** */
RenderingContext.prototype.stroke = function() {};

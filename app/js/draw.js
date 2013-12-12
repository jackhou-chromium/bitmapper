/**
 * @license Copyright 2013 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */

/**
 * Drawing on canvas.
 */
(function() {

/**
 * The radius of the circle being drawn.
 * @const
 * @type {number}
 */
var radius = 1;

/**
 * Keeps track of whether the mouse is being held down or not.
 * @type {boolean}
 */
var dragging = false;

/**
 * Draws on the canvas.
 * @param {Event} e
 */
function draw(e) {
  if (!dragging) {
    return;
  }
  var ctx = bitmapper.canvas.getContext('2d');
  ctx.lineWidth = radius * 2;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  ctx.beginPath();
  // The circles drawn represent individual points/ mouse clicks
  // and the circles are joined when the mouse is dragged to
  // make a smooth line.
  ctx.arc(e.offsetX, e.offsetY, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
};

/**
 * Starts drawing when the mouse is pressed.
 * @param {Event} e
 */
bitmapper.mousedown = function(e) {
  var ctx = bitmapper.canvas.getContext('2d');
  ctx.beginPath();
  dragging = true;
  draw(e);
};

/**
 * Stops drawing when the mouse is lifted.
 */
function stopDrawing() {
  dragging = false;
};

bitmapper.mousemove = draw;
bitmapper.mouseup = stopDrawing;
bitmapper.mouseleave = stopDrawing;

})();

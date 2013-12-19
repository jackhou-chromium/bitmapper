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
 * Draws on source canvas.
 * @param {number} sourceX
 * @param {number} sourceY
 */
function draw(sourceX, sourceY) {
  if (!dragging) {
    return;
  }
  var ctx = bitmapper.sourceCanvas.getContext('2d');
  ctx.lineWidth = radius * 2;
  ctx.lineTo(sourceX, sourceY);
  ctx.stroke();
  ctx.beginPath();
  // The circles drawn represent individual points/ mouse clicks
  // and the circles are joined when the mouse is dragged to
  // make a smooth line.
  ctx.arc(sourceX, sourceY, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(sourceX, sourceY);

  bitmapper.zoomManager.drawDisplayCanvas();
};

/**
 * Starts drawing on source canvas when the mouse is pressed.
 * @param {number} sourceX
 * @param {number} sourceY
 */
bitmapper.mousedown = function(sourceX, sourceY) {
  var ctx = bitmapper.sourceCanvas.getContext('2d');
  ctx.beginPath();
  dragging = true;
  draw(sourceX, sourceY);
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

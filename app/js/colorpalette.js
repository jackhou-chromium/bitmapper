/**
 * @license Copyright 2013 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */

/**
 * Color palette.
 */
(function() {

/**
 * Encapsulates data related to the color palette.
 * @constructor
 * @param {HTMLElement} divContainer
 * @param {function()} callback
 */
function ColorPalette(divContainer, callback) {
  this.divContainer = divContainer;
  this.callback = callback;
  this.selectedColor = 0;
  this.colorDivs = [];
};

/**
 * Generates html for color palette.
 * @param {Array.<string>} colorArray
 */
ColorPalette.prototype.generatePalette = function(colorArray) {
  for (var i = 0; i < colorArray.length; i++) {
    // Styling.
    var cellDiv = document.createElement('div');
    cellDiv.className = 'paletteCell';
    cellDiv.style.backgroundColor = colorArray[i];
    this.divContainer.className = 'paletteContainer';
    this.divContainer.appendChild(cellDiv);
    this.colorDivs[i] = cellDiv;
    // Mouse event.
    this.addClickListenerToColorDiv(i);
  }
};

/**
 * Sets correct selected index when div is clicked.
 * @param {number} cellIndex
 */
ColorPalette.prototype.addClickListenerToColorDiv = function(cellIndex) {
  // Without this, the cell index would be the last i value in for loop of
  // generatePalette function.
  this.colorDivs[cellIndex].addEventListener('click',
      function() {this.setSelectedIndex(cellIndex)}.bind(this), false);
};

/**
 * Changes background color of selected cell in palette.
 * @param {string} color
 * @param {number} index
 */
ColorPalette.prototype.updateCellColor = function(color, index) {
  this.colorDivs[index].style.backgroundColor = color;
};

/**
 * Sets selected index in color palette array.
 * @param {number} index
 */
ColorPalette.prototype.setSelectedIndex = function(index) {
  this.selectedColor = index;
  this.callback();
};

/**
 * Gets selected index in color palette array.
 * @return {number}
 */
ColorPalette.prototype.getSelectedIndex = function() {
  return this.selectedColor;
};

/**
 * Gets selected color.
 * @return {string}
 */
ColorPalette.prototype.getSelectedColor = function() {
  return this.colorDivs[this.selectedColor].style.backgroundColor;
};

/**
 * Converts rgb color format to hex. Color selector only takes hex for value.
 * @param {string} rgbColor
 * @return {string}
 */
function rgbToHex(rgbColor) {
  if (rgbColor[0] == '#' && rgbColor.length == 7) {
    // Color already in hex format.
    return rgbColor;
  }
  var digits = rgbColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  var r = ('0' + parseInt(digits[1], 10).toString(16)).slice(-2);
  var g = ('0' + parseInt(digits[2], 10).toString(16)).slice(-2);
  var b = ('0' + parseInt(digits[3], 10).toString(16)).slice(-2);
  return '#' + r + g + b;
}

bitmapper.rgbToHex = rgbToHex;
bitmapper.ColorPalette = ColorPalette;
})();

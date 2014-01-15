/**
 * @license Copyright 2013 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */



/**
 * @constructor
 * @struct
 * @param {HTMLElement} divContainer
 * @param {function()} callback
 */
function ColorPalette(divContainer, callback) {}


/**
 * Color palette.
 */
(function() {

  /**
   * Encapsulates data related to the color palette.
   * @constructor
   * @struct
   * @param {HTMLElement} divContainer
   * @param {function()} callback
   */
  function ColorPalette(divContainer, callback) {
    /**
     * Color palette cells appended to this div container.
     * @type {HTMLElement}
     */
    this.divContainer = divContainer;

    /**
     * Called when selectedColorIndex is set.
     * @type {function()}
     */
    this.callback = callback;

    /**
     * The palette position of selected color.
     * @type {number}
     */
    this.selectedColorIndex = 0;

    /**
     * Array of given colors.
     * @type {Array.<Element>}
     */
    this.colorDivs = [];

    /**
     * Default opacity is 1 (fully opaque).
     * @type {number}
     */
    this.opacity = 1;
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
    this.selectedColorIndex = index;
    this.callback();
  };

  /**
   * Gets selected index in color palette array.
   * @return {number}
   */
  ColorPalette.prototype.getSelectedIndex = function() {
    return this.selectedColorIndex;
  };

  /**
   * Gets selected color.
   * @return {string}
   */
  ColorPalette.prototype.getSelectedColor = function() {
    return this.colorDivs[this.selectedColorIndex].style.backgroundColor;
  };

  /**
   * Gets selected color with opacity level (rgba).
   * @param {string} rgb
   * @return {string}
   */
  ColorPalette.prototype.getSelectedColorWithOpacity = function() {
    var rgb = this.getSelectedColor();
    return 'rgba' + rgb.slice(3, -1) + ', ' + this.opacity.toString() + ')';
  };

  /**
   * Sets the opacity value (0-1 scale).
   * @param {number} opacity
   */
  ColorPalette.prototype.setOpacity = function(opacity) {
    this.opacity = opacity;
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

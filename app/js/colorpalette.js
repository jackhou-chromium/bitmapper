/**
 * @license Copyright 2013 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */



/**
 * @constructor
 * @struct
 */
function ColorPalette() {}


/**
 * Color palette.
 */
(function() {

  /**
   * Encapsulates data related to the color palette.
   * @constructor
   * @struct
   */
  function ColorPalette() {
    /**
     * Most recently selected div.
     * @type {Element}
     */
    this.selectedDiv = null;

    /**
     * Default opacity is 1 (fully opaque).
     * @type {number}
     */
    this.opacity = 1;
  };

  /**
   * Sets selected div.
   * @param {Element} selected
   */
  ColorPalette.prototype.setSelectedCell = function(selected) {
    this.selectedDiv = selected;
  };

  /**
   * Changes background color of selected cell in palette.
   * @param {string} color
   */
  ColorPalette.prototype.updateCellColor = function(color) {
    this.selectedDiv.style.backgroundColor = color;
  };

  /**
   * Gets selected color.
   * @return {string}
   */
  ColorPalette.prototype.getSelectedColor = function() {
    return this.selectedDiv.style.backgroundColor;
  };

  /**
   * Gets selected color with opacity level (rgba).
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
   * Gets opacity value.
   * @return {number}
   */
  ColorPalette.prototype.getOpacity = function() {
    return this.opacity;
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

  /**
   * Converts rgba color format to an object.
   * @param {string} rgbaColor
   * @return {Array.<number>}
   */
  function rgbaToArray(rgbaColor) {
    var digits = rgbaColor.match(
        /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+\.?\d*)\)$/);
    return [parseInt(digits[1], 10),
            parseInt(digits[2], 10),
            parseInt(digits[3], 10),
            Math.floor(parseFloat(digits[4]) * 255)];
  }

  bitmapper.rgbToHex = rgbToHex;
  bitmapper.rgbaToArray = rgbaToArray;
  bitmapper.ColorPalette = ColorPalette;
})();

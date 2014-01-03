/**
 * @license Copyright 2013 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */

/**
 * Tests color palette.
 */
(function() {

/**
 * Initialises color palette and appends to selected test debug div.
 * @param {function()} callback
 */
function initialiseTestPalette(callback) {
  // Create color palette element in debug section.
  var currentTestDiv = document.getElementById(bitmapper_test.currentTestName);
  var colorPalette = new bitmapper.ColorPalette(currentTestDiv, callback);
  var initialColors = ['#ff0000', '#ffff00', '#0000ff', '#ff00ff',
                      '#cc00ff', '#9900ff', '#ff6600', '#0099ff'];
  colorPalette.generatePalette(initialColors);
  // Allow palette to be seen for visual debugging.
  for (var i = 0; i < initialColors.length; i++) {
    colorPalette.colorDivs[i].style.height = '30px';
    colorPalette.colorDivs[i].style.width = '30px';
  }
  return colorPalette;
}

module('ColorPalette');

/**
 * Convert rgb to hexadecimal value.
 */
test('convertRgbToHex', function() {
  equal(bitmapper.rgbToHex('rgb(255, 102, 0)'), '#ff6600',
        'Correct rgb to hex conversion');
  equal(bitmapper.rgbToHex('rgb(0, 153, 255)'), '#0099ff',
        'Correct rgb to hex conversion');
  equal(bitmapper.rgbToHex('rgb(255, 255, 255)'), '#ffffff',
        'Correct rgb to hex conversion');
});

/**
 * Generate palette with correctly styled divs.
 */
test('generateColorPalette', function() {
  var colorPalette = initialiseTestPalette(function() {});
  // Testing a generated div.
  equal(colorPalette.colorDivs[7].style.backgroundColor, 'rgb(0, 153, 255)',
        'Div has correct background color');
});

/**
 * Check selected color and selected index.
 */
asyncTest('useColorPalette', function() {
  expect(3);
  var callback = function() {
    // Check selected color and selected index.
    equal(colorPalette.getSelectedColor(), 'rgb(0, 0, 255)',
          'Correct selected color');
    equal(colorPalette.getSelectedIndex(), 2, 'Correct selected index');
    start();
  };
  var colorPalette = initialiseTestPalette(callback);
  // Trigger the callback.
  colorPalette.colorDivs[2].click();
  ok(true, 'Triggering choosing color palette cell');
});

/**
 * Update selected cell color with selected color.
 */
asyncTest('updateColorPalette', function() {
  expect(2);
  var callback = function() {
    equal(colorPalette.getSelectedIndex(), 4, 'Correct selected index');
    start();
  };
  var colorPalette = initialiseTestPalette(callback);
  // Trigger callback.
  colorPalette.colorDivs[4].click();
  colorPalette.updateCellColor('rgb(64, 224, 208)',
                                colorPalette.getSelectedIndex());
  // Check background of selected palette cell changes.
  var backgroundColor =
  colorPalette.colorDivs[colorPalette.getSelectedIndex()].style.backgroundColor;
  equal(backgroundColor, 'rgb(64, 224, 208)',
        'Color palette cell updated with selected color');
});
})();

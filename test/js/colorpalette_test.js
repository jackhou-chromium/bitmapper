/**
 * @license Copyright 2013 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */


/**
 * Tests color palette.
 */
(function() {

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
    var colorPalette = bitmapper_test.initialiseTestPalette(function() {});
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
    var colorPalette = bitmapper_test.initialiseTestPalette(callback);
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
    var colorPalette = bitmapper_test.initialiseTestPalette(callback);
    // Trigger callback.
    colorPalette.colorDivs[4].click();
    colorPalette.updateCellColor('rgb(64, 224, 208)',
        colorPalette.getSelectedIndex());
    // Check background of selected palette cell changes.
    var backgroundColor =
        colorPalette.colorDivs[colorPalette.getSelectedIndex()]
            .style.backgroundColor;
    equal(backgroundColor, 'rgb(64, 224, 208)',
          'Color palette cell updated with selected color');
  });

  /**
   * Testing adding opacity to color (rgb to rgba).
   */
  test('rgbaFormat', function() {
    var colorPalette = bitmapper_test.initialiseTestPalette(function() {});
    // Choose color from palette, alter opacity and check resulting rgba.
    colorPalette.setSelectedIndex(0);
    equal(colorPalette.getSelectedColorWithOpacity(), 'rgba(255, 0, 0, 1)');

    colorPalette.setSelectedIndex(1);
    colorPalette.setOpacity(0.2);
    equal(colorPalette.getSelectedColorWithOpacity(), 'rgba(255, 255, 0, 0.2)');

    colorPalette.setSelectedIndex(2);
    colorPalette.setOpacity(0.053);
    equal(colorPalette.getSelectedColorWithOpacity(), 'rgba(0, 0, 255, 0.053)');

    colorPalette.setSelectedIndex(3);
    colorPalette.setOpacity(0);
    equal(colorPalette.getSelectedColorWithOpacity(), 'rgba(255, 0, 255, 0)');
  });
})();

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
   * Convert rgb to an array.
   */
  test('convertRgbaToArray', function() {
    deepEqual(bitmapper.rgbaToArray('rgba(255, 102, 0, 0.5)'),
              [255, 102, 0, 127],
              'Correct rgb to hex conversion');
    deepEqual(bitmapper.rgbaToArray('rgba(0, 153, 255, 1)'),
              [0, 153, 255, 255],
              'Correct rgb to hex conversion');
    deepEqual(bitmapper.rgbaToArray('rgba(255, 255, 255, 0)'),
              [255, 255, 255, 0],
              'Correct rgb to hex conversion');
  });

  /**
   * Check selected color.
   */
  test('useColorPalette', function(palette, colorPalette) {
    // Expect 2 assertions:
    // 1. Triggering of core-select event.
    // 2. Color set correctly on color-palette.
    expect(2);
    var colorPalette = bitmapper_test.initializeColorPalette(function() {});
    var palette = bitmapper_test.initializePalette(colorPalette);

    // Create a clickable paper-button element, with black background to model
    // a user selection on the button.
    var paperButton = document.createElement('paper-button');
    paperButton.style.backgroundColor = '#ff0000';
    // Set the initial selection to the paperButton.
    // Note that the initial core-select event will not get triggered until
    // after the test finishes. So trigger this event manually.
    colorPalette.setSelectedCell(paperButton);

    // Create core-select event and populate with necessary properties for event
    // listener added in setup.js.
    var coreSelect = new CustomEvent('core-select', {
      'detail': {
        'item': paperButton,
        'isSelected': true
      }
    });
    // Trigger core-select on palette.
    // Expect an assertion here from calling function.
    palette.dispatchEvent(coreSelect);

    // Check button color
    equal(colorPalette.getSelectedColor(), 'rgb(255, 0, 0)',
          'Initial color set on colorPalette');

    // Test deselection of the event by triggering the event again, with
    // isSelected property set to false.
    coreSelect = new CustomEvent('core-select', {
      'detail': {
        'item': paperButton,
        'isSelected': false
      }
    });

    // Trigger core-select on palette.
    // There should be no assertion here, as for the deselection case.
    palette.dispatchEvent(coreSelect);
  });

  /**
   * Update selected cell color with selected color.
   */
  test('updateColorPalette', function() {
    var colorPalette = bitmapper_test.initializeColorPalette(function() {});
    colorPalette.updateCellColor('rgb(64, 224, 208)');
    // Check background of selected palette cell changes.
    var backgroundColor = colorPalette.getSelectedColor();
    equal(backgroundColor, 'rgb(64, 224, 208)',
          'Color palette cell updated with selected color');
  });

  /**
   * Testing adding opacity to color (rgb to rgba).
   */
  test('rgbaFormat', function() {
    var colorPalette = bitmapper_test.initializeColorPalette(function() {});
    // Change color, alter opacity and check resulting rgba.
    colorPalette.updateCellColor('#ff0000');
    colorPalette.setOpacity(1);
    equal(colorPalette.getSelectedColorWithOpacity(), 'rgba(255, 0, 0, 1)');

    colorPalette.updateCellColor('#ffff00');
    colorPalette.setOpacity(0.2);
    equal(colorPalette.getSelectedColorWithOpacity(), 'rgba(255, 255, 0, 0.2)');

    colorPalette.updateCellColor('#0000ff');
    colorPalette.setOpacity(0.053);
    equal(colorPalette.getSelectedColorWithOpacity(), 'rgba(0, 0, 255, 0.053)');

    colorPalette.updateCellColor('#ff00ff');
    colorPalette.setOpacity(0);
    equal(colorPalette.getSelectedColorWithOpacity(), 'rgba(255, 0, 255, 0)');
  });
})();

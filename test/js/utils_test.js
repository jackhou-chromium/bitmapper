/**
 * @license Copyright 2014 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */


/**
 * Tests for functions in bitmapper.utils.
 */
(function() {

  module('bitmapper.utils');

  test('constrain', function() {
    equal(10, bitmapper.utils.constrain(10, 5, 15));
    equal(12, bitmapper.utils.constrain(10, 12, 15));
    equal(8, bitmapper.utils.constrain(10, 5, 8));
  });

})();

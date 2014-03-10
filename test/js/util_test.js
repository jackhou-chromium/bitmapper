/**
 * @license Copyright 2014 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */


/**
 * Tests for functions in bitmapper.util.
 */
(function() {

  module('bitmapper.util');

  test('constrain', function() {
    equal(10, bitmapper.util.constrain(10, 5, 15));
    equal(12, bitmapper.util.constrain(10, 12, 15));
    equal(8, bitmapper.util.constrain(10, 5, 8));
    throws(function() {
      bitmapper.util.constrain(10, 10, 5);
    });
  });

})();

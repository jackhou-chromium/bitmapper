/**
 * @license Copyright 2014 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */

/**
 * @fileoverview Utility functions.
 */

bitmapper.utils = {};


/**
 * Utility function to constrain a value between a min and max.
 *
 * Returns NaN if |minValue| is greater than |maxValue|.
 * @param {number} value
 * @param {number} minValue
 * @param {number} maxValue
 * @return {number}
 */
bitmapper.utils.constrain = function(value, minValue, maxValue) {
  if (minValue > maxValue)
    throw new Error('minValue is greater than maxValue');
  return Math.min(Math.max(minValue, value), maxValue);
};

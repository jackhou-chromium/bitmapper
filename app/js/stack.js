/**
 * @license Copyright 2015 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */



/**
 * @constructor
 * @struct
 * @template T
 * @param {number} maxSize
 */
function Stack(maxSize) {}

(function() {

  /**
   * Encapsulates data related to one stack.
   * @constructor
   * @struct
   * @template T
   * @param {number} maxSize
   */
  function Stack(maxSize) {
    /**
     * The stack which holds the data.
     * @type {Array.<T>}
     */
    this.stack = [];

    /**
     * Holds the index of one past the current position in the stack.
     * @type {number}
     */
    this.position = 0;

    /**
     * The size of the size of the stack.
     * @type {number}
     */
    this.maxSize = maxSize;
  };

  /**
   * Pushes an element to the stack.
   * @suppress {reportUnknownTypes}
   * @param {T} item
   */
  Stack.prototype.push = function(item) {
    this.stack.splice(this.position, this.stack.length, item);

    // Cut off beginning of the stack to limit to max stack size.
    if (this.stack.length == this.maxSize + 1)
      this.stack.shift();
    else
      this.position++;
  };

  /**
   * Pops an element off the stack. Element stays in the stack for potential
   * future redos.
   * @return {T}
   */
  Stack.prototype.pop = function() {
    if (this.position == 0)
      return null;
    this.position--;
    return this.stack[this.position];
  };

  /**
   * Moves forward in the stack.
   * @return {T}
   */
  Stack.prototype.unpop = function() {
    // No entries after current entry.
    if (this.position == this.stack.length)
      return null;

    this.position++;
    return this.stack[this.position - 1];
  };

  /**
   * Returns the top element of the stack.
   * @return {T}
   */
  Stack.prototype.top = function() {
    if (this.position == 0)
      return null;
    return this.stack[this.position - 1];
  };

  bitmapper.Stack = Stack;
})();

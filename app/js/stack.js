/**
 * @license Copyright 2015 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */



/**
 * @constructor
 * @struct
 * @param {number} maxSize
 */
function Stack(maxSize) {}

(function() {

  /**
   * Encapsulates data related to one stack.
   * @constructor
   * @struct
   * @param {number} maxSize
   */
  function Stack(maxSize) {
    /**
     * The stack which holds the data.
     * @type {Array.<Object>}
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
   * @param {Object} item
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
   * @return {Object}
   */
  Stack.prototype.pop = function() {
    if (this.position == 0)
      return null;
    this.position--;
    return this.stack[this.position];
  };

  /**
   * Moves forward in the stack.
   * @return {Object}
   */
  Stack.prototype.unpop = function() {
    // No entries after current entry.
    if (this.position == this.stack.length)
      return null;

    this.position++;
    return this.stack[this.position - 1];
  };

  /**
   * Checks whether the stack is empty.
   * @return {boolean}
   */
  Stack.prototype.isEmpty = function() {
    if (this.stack.length == 0)
      return true;
    return false;
  };

  /**
   * Returns the top element of the stack.
   * @return {Object}
   */
  Stack.prototype.top = function() {
    if (this.position == 0)
      return null;
    return this.stack[this.position - 1];
  };

  bitmapper.Stack = Stack;
})();

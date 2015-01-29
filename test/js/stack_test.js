/**
 * @license Copyright 2015 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */


/**
 * Tests Stack implementation.
 */
(function() {


  module('Stack');

  var SMALL = 10;

  test('testEmpty', function() {
    var stack = new bitmapper.Stack(SMALL);

    equal(stack.pop(), null, 'Popped values are the same.');
    equal(stack.unpop(), null, 'Unpopped values are the same.');
    equal(stack.top(), null, 'Top values are the same.');
  });

  // This test pushes an element to the stack, pops it off, and unpops
  // it. This mimics an action followed by an undo and a redo.
  test('testBasic', function() {
    var stack = new bitmapper.Stack(SMALL);

    stack.push('hello');
    equal(stack.top(), 'hello', 'Top values are the same.');

    equal(stack.pop(), 'hello', 'Popped values are the same.');
    equal(stack.top(), null, 'Top values are the same.');

    stack.unpop();
    equal(stack.top(), 'hello', 'Top values are the same.');
  });

  // This test pushes 10 elements to the stack (the maximum capacity)
  // and pops them off one by one.
  test('testPop', function() {
    var stack = new bitmapper.Stack(SMALL);

    for (var i = 1; i <= SMALL; i++)
      stack.push(i);
    equal(stack.top(), i - 1, 'Top value is correct.');

    // If the popped values are correct as it is popped, we don't also
    // need to check that each top value is correct after each pop.
    for (var i = SMALL; i >= 1; i--)
      equal(stack.pop(), i, 'Popped value is correct.');
  });

  // This test pushes 10 elements to the stack (the maximum capacity)
  // and pops them off one by one. It then unpops one by one.
  test('testUnpop', function() {
    var stack = new bitmapper.Stack(SMALL);

    for (var i = 1; i <= SMALL; i++)
      stack.push(i);
    equal(stack.top(), i - 1, 'Top value is correct.');

    for (var i = SMALL; i >= 1; i--)
      stack.pop();
    equal(stack.top(), null, 'Top value is correct.');

    for (var i = 1; i <= SMALL; i++)
      equal(stack.unpop(), i, 'Unpopped value is correct.');
  });

  test('testAll', function() {
    var stack = new bitmapper.Stack(SMALL);

    // Stack: [1, 2, 3, 4]
    for (var i = 1; i <= 4; i++)
      stack.push(i);
    equal(stack.top(), i - 1, 'Top value is correct.');

    // Stack: [1, 2]
    equal(stack.pop(), 4, 'Popped value is correct.');
    equal(stack.pop(), 3, 'Popped value is correct.');
    equal(stack.top(), 2, 'Top value is correct.');

    // Stack: [1, 2, 5, 6]
    for (var i = 5; i <= 6; i++)
      stack.push(i);

    // Stack: [1]
    equal(stack.pop(), 6, 'Popped value is correct.');
    equal(stack.pop(), 5, 'Popped value is correct.');
    equal(stack.pop(), 2, 'Popped value is correct.');

    // Stack: [1, 2, 5]
    equal(stack.unpop(), 2, 'Unpopped value is correct.');
    equal(stack.unpop(), 5, 'Unpopped value is correct.');
  });

  // This test pushes 11 elements to the stack (more than the maximum
  // capacity) and pops them off one by one.
  test('testPushFull', function() {
    var stack = new bitmapper.Stack(SMALL);

    // Stack: [1, 2, 3, ..., 10]
    // On 11th iteration of the loop: [2, 3, ..., 11]
    for (var i = 1; i <= SMALL + 1; i++)
      stack.push(i);
    equal(stack.top(), i - 1, 'Top value is correct.');

    // Check values from 11 down to 2.
    for (var i = SMALL + 1; i > 1; i--)
      equal(stack.pop(), i, 'Popped value is correct.');
    equal(stack.pop(), null, 'Popped value is correct.');
  });

})();

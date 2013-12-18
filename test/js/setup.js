/**
 * How long an async test will run for before it times out and fails.
 */
QUnit.config.testTimeout = 1000;

/**
 * Names div with current test name and appends to debug div.
 * @param {function()} test
 */
QUnit.testStart = function(test) {
  bitmapper_test.currentTestName = test.module + '.' + test.name;
  var testDiv = document.createElement('div');
  testDiv.id = bitmapper_test.currentTestName;
  document.getElementById('debug').appendChild(testDiv);
  var titleDiv = document.createElement('div');
  titleDiv.innerHTML = bitmapper_test.currentTestName;
  testDiv.appendChild(titleDiv);
};

/**
 * Creates canvas for testing and appends to current test div.
 * @return {HTMLElement} testCanvas
 */
bitmapper_test.createCanvas = function() {
  var testCanvas = document.createElement('canvas');
  document.getElementById(bitmapper_test.currentTestName).
      appendChild(testCanvas);
  testCanvas.style.border = 'black solid 1px';
  return testCanvas;
};

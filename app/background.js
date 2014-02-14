/**
 * @license Copyright 2013 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */

/* Launch initiated by user so start clean. */
chrome.app.runtime.onLaunched.addListener(function() {
 runApp(false);
});

/* Restarted by Chrome so get saved state. */
chrome.app.runtime.onRestarted.addListener(function() {
 runApp(true);
});

/**
 * Called on window load to start running the app.
 * @param {boolean} isRestart
 */ 
function runApp(isRestart) {
  chrome.app.window.create('main.html', {
    'width': 900,
    'height': 700,
    'minWidth': 900,
    'minHeight': 700,
  },
  function(createdWindow) {
    createdWindow.contentWindow.addEventListener('load', function() {
      createdWindow.contentWindow.runApp(isRestart);
    })
  });
}
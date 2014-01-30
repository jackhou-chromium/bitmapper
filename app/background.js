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
    'width': 800,
    'height': 600,
    'minWidth': 800,
    'minHeight': 600,
  },
  function(createdWindow) {
    createdWindow.contentWindow.addEventListener('load', function() {
      createdWindow.contentWindow.runApp(isRestart);
    })
  });
}
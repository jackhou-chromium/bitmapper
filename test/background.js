"use strict";

chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('test_build.html', {
    'width': 800,
    'height': 600,
  });
});

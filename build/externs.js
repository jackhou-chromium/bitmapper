// Copyright 2013 Google Inc. All rights reserved.
// Use of this source code is governed by the Apache license that can be
// found in the LICENSE file.

// This file defines all the functions that the closure compiler does not know
// about. More info here:
// http://developers.google.com/closure/compiler/docs/api-tutorial3#externs


/**
 * @param {function(Entry)} callback callback
 */
chrome.runtime.getPackageDirectoryEntry = function(callback) {};


/**
 * @param {string} data data
 */
var atob = function(data) {};


/**
 * @type {boolean}
 */
CanvasRenderingContext2D.prototype.imageSmoothingEnabled;

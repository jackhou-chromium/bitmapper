/**
 * Looks for a file in the app bundle and calls the callback passing in the
 * FileEntry.
 * @param {string} fileName
 * @param {function(FileEntry)} callback
 */
bitmapper_test.getLocalFileEntry = function(fileName, callback) {
  var endsWith = function(string, suffix) {
    return string.indexOf(suffix, string.length - suffix.length) !== -1;
  };

  chrome.runtime.getPackageDirectoryEntry(function(entry) {
    var dirReader = entry.createReader();
    var readEntries = function() {
      dirReader.readEntries(
          function(results) {
            if (!results.length) {
              return;
            }
            var found = false;
            results.forEach(function(fileEntry) {
              if (endsWith(fileEntry.fullPath, fileName)) {
                found = true;
                callback(fileEntry);
              }
            });
            if (!found) {
              readEntries();
            }
          });
    };
    readEntries();
  });
};

asyncTest('ImageFile', function() {
  // This tells the test that there should will be 7 expectations. If there are
  // not, the test will fail. Expectations are any calls to ok(), equal(), or
  // deepEqual().
  expect(7);

  bitmapper_test.getLocalFileEntry('test-image.png', function(entry) {
    ok(true, 'Got test-image.png FileEntry');
    var callback = function() {
      ok(true, 'Loaded image');
      equal(imageFile.loaded, true);
      ok(imageFile.image.src);

      // Despite being called start() this actually called at the end to verify
      // the expect() called at the start of the test.
      start();
    };
    var imageFile = new bitmapper.ImageFile(entry, callback);
    equal(imageFile.fileEntry, entry);
    equal(imageFile.callback, callback);
    ok(!imageFile.image.src);
  });
});

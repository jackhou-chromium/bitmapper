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

asyncTest('Open File', function() {
  expect(6);
  bitmapper_test.getLocalFileEntry('test-image.png', function(entry) {
    ok(true, 'Got test-image.png FileEntry');
    var imageFile = new bitmapper.ImageFile();
    var callback = function() {
      ok(true, 'Loading image');
      equal(imageFile.loaded, true, 'Successfully loaded');
      ok(imageFile.image.src, 'Image source valid');
      start();
    };
    imageFile.loadFile(entry, callback);
    equal(imageFile.fileEntry, entry,
       'Chosen file entry and global entry equal');
    ok(!imageFile.image.src, 'Starts with no image');
  });
});

test('Save File', function() {
  var blob1 = bitmapper.ImageFile.prototype.dataURItoBlob(
      'data:image/png;base64,iV');
  equal(blob1.size, 1, 'Blob correct size');
  equal(blob1.type, 'image/png', 'Blob correct type (image/png)');
  var blob2 = bitmapper.ImageFile.prototype.dataURItoBlob(
      'data:image/png;base64,iVbe');
  equal(blob2.size, 3, 'Blob correct size');
  equal(blob2.type, 'image/png', 'Blob correct type (image/png)');
});

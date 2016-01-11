/*
  Copyright 2014 Google Inc. All Rights Reserved.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

// This is a test and we want descriptions to be useful, if this
// breaks the max-length, it's ok.

/* eslint-disable max-len, no-lonely-if */
/* eslint-env browser, mocha */
/* global testHelper */

'use strict';

describe('Test use of custom cache', () => {
  function compareCachedAssets(assetList, cachedAssets) {
    return new Promise((resolve, reject) => {
      var cachedAssetsKeys = Object.keys(cachedAssets);
      cachedAssetsKeys.should.have.length(assetList.length);

      for (var i = 0; i < assetList.length; i++) {
        var key = location.origin + assetList[i];
        if (typeof cachedAssets[key] === 'undefined') {
          reject(new Error('Cache doesn\'t have a cache item for: ' + key));
        }

        // TODO: Check the contents of the cache matches the data files?
      }

      resolve();
    });
  }

  var serviceWorkersFolder = '/test/browser-tests/custom-cache/serviceworkers';

  it.skip('should only cache the first two files', done => {
    var urls = [
      '/test/data/files/text.txt',
      '/test/data/files/text-1.txt',
      '/test/data/files/text-2.txt'
    ];
    var iframe;
    testHelper.activateSW(serviceWorkersFolder + '/max-entries.js')
    .then(newIframe => {
      iframe = newIframe;
      // Call the iframes fetch event so it goes through the service worker
      return iframe.contentWindow.fetch(urls[0]);
    })
    .then(() => {
      return iframe.contentWindow.fetch(urls[1]);
    })
    .then(() => {
      return iframe.contentWindow.fetch(urls[2]);
    })
    // TODO: Need to stub out the test
    /** .then(() => {
      return new Promise(function(resolve) {
        setTimeout(resolve, 500);
      });
    }) **/
    .then(() => {
      return testHelper.getAllCachedAssets('max-cache-entries');
    })
    .then(cachedAssets => {
      return compareCachedAssets([
        '/test/data/files/text-1.txt',
        '/test/data/files/text-2.txt'
      ], cachedAssets);
    })
    .then(() => done(), done);
  });

  // TODO: When does the age kick in and clean the cache?
  // TODO: How can we account for this.
  it.skip('should use elements during max age', done => {
    var urls = [
      '/test/data/files/text.txt',
      '/test/data/files/text-1.txt',
      '/test/data/files/text-2.txt'
    ];
    var iframe;
    testHelper.activateSW(serviceWorkersFolder + '/max-age.js')
    .then(newIframe => {
      iframe = newIframe;
      // Call the iframes fetch event so it goes through the service worker
      return iframe.contentWindow.fetch(urls[0]);
    })
    .then(() => {
      return iframe.contentWindow.fetch(urls[1]);
    })
    .then(() => {
      return testHelper.getAllCachedAssets('max-cache-age');
    })
    .then(cachedAssets => {
      return compareCachedAssets([
        '/test/data/files/text.txt',
        '/test/data/files/text-1.txt'
      ], cachedAssets);
    })
    .then(() => {
      return new Promise(function(resolve) {
        setTimeout(resolve, 1000);
      });
    })
    .then(() => {
      // This fetch should clean up the cache
      return iframe.contentWindow.fetch(urls[2]);
    })
    // TODO: Need to stub out the test
    /** .then(() => {
      return new Promise(function(resolve) {
        setTimeout(resolve, 500);
      });
    })**/
    .then(() => {
      return testHelper.getAllCachedAssets('max-cache-age');
    })
    .then(cachedAssets => {
      return compareCachedAssets([
        '/test/data/files/text-2.txt'
      ], cachedAssets);
    })
    .then(() => done(), done);
  });

  it.skip('should respect max entries and max age', done => {
    var urls = [
      '/test/data/files/text.txt',
      '/test/data/files/text-1.txt',
      '/test/data/files/text-2.txt'
    ];
    var iframe;
    testHelper.activateSW(serviceWorkersFolder + '/max-entries.js')
    .then(newIframe => {
      iframe = newIframe;
      // Call the iframes fetch event so it goes through the service worker
      return iframe.contentWindow.fetch(urls[0]);
    })
    .then(() => {
      return iframe.contentWindow.fetch(urls[1]);
    })
    .then(() => {
      return iframe.contentWindow.fetch(urls[2]);
    })
    // TODO: Need to stub out the test
    /** .then(() => {
      return new Promise(function(resolve) {
        setTimeout(resolve, 500);
      });
    }) **/
    .then(() => {
      return testHelper.getAllCachedAssets('max-cache-entries');
    })
    .then(cachedAssets => {
      return compareCachedAssets([
        '/test/data/files/text-1.txt',
        '/test/data/files/text-2.txt'
      ], cachedAssets);
    })
    .then(() => {
      return new Promise(function(resolve) {
        setTimeout(resolve, 1000);
      });
    })
    .then(() => {
      // This fetch should clean up the cache
      return iframe.contentWindow.fetch(urls[2]);
    })
    // TODO: Need to stub out the test
    /** .then(() => {
      return new Promise(function(resolve) {
        setTimeout(resolve, 500);
      });
    })**/
    .then(() => {
      return testHelper.getAllCachedAssets('max-cache-age');
    })
    .then(cachedAssets => {
      return compareCachedAssets([
        '/test/data/files/text-2.txt'
      ], cachedAssets);
    })
    .then(() => done(), done);
  });
});

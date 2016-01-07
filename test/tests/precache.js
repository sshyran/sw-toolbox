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

'use strict';

// This is a test and we want descriptions to be useful, if this
// breaks the max-length, it's ok.

/* eslint-disable max-len, no-lonely-if */
/* eslint-env browser, mocha */

window.chai.should();
var testHelper = window.SWTestHelper;

describe('Test SW-Toolbox', () => {
  // This make browsers without a service worker pass by
  // bypassing the tests altogether.
  // This is desirable to allow travis to run tests in all browsers
  // regardless of support or not and track over time.
  if (!('serviceWorker' in navigator)) {
    return;
  }

  beforeEach(function(done) {
    Promise.all([
      testHelper.unregisterAllRegistrations(),
      testHelper.clearAllCaches()
    ])
    .then(() => {
      // Because promise.all returns an array of results
      // we have to create an anonymouse function to call
      // done with no parameters
      done();
    }, done);
  });

  after(function(done) {
    Promise.all([
      testHelper.unregisterAllRegistrations(),
      testHelper.clearAllCaches()
    ])
    .then(() => {
      var iframeList = document.querySelectorAll('.js-test-iframe');
      for (var i = 0; i < iframeList.length; i++) {
        iframeList[i].parentElement.removeChild(iframeList[i]);
      }
    })
    .then(() => done(), done);
  });

  describe('Test precache method', () => {
    it('should precache all desired assets in precache-valid', done => {
      var assetList = [
        '/test/data/files/text.txt',
        '/test/data/files/image.png'
      ];
      testHelper.activateSW('/test/data/precache-valid/sw.js')
      .then(() => {
        return testHelper.getAllCachedAssets('precache-valid');
      })
      .then(cachedAssets => {
        var cachedAssetsKeys = Object.keys(cachedAssets);
        cachedAssetsKeys.should.have.length(assetList.length);

        for (var i = 0; i < assetList.length; i++) {
          var key = location.origin + assetList[i];
          if (typeof cachedAssets[key] === 'undefined') {
            throw new Error('Cache doesn\'t have a cache item for: ' + key);
          }

          // TODO: Check the contents of the cache matches the data files?
        }
      })
      .then(() => {
        done();
      })
      .catch(error => {
        done(error);
      });
    });

    it('should not precache paths that do no exist', done => {
      var testId = 'precache-non-existant-files';
      var validAssetsList = [
        '/test/data/files/text.txt',
        '/test/data/files/image.png'
      ];
      testHelper.activateSW('/test/data/' + testId + '/sw.js')
      .then(() => {
        return testHelper.getAllCachedAssets(testId);
      })
      .then(cachedAssets => {
        var cachedAssetsKeys = Object.keys(cachedAssets);
        cachedAssetsKeys.should.have.length(validAssetsList.length);

        for (var i = 0; i < validAssetsList.length; i++) {
          var key = location.origin + validAssetsList[i];
          if (typeof cachedAssets[key] === 'undefined') {
            throw new Error('Cache doesn\'t have a cache item for: ' + key);
          }

          // TODO: Check the contents of the cache matches the data files?
        }
      })
      .then(() => {
        done();
      })
      .catch(error => {
        done(error);
      });
    });

    it('should precache all assets from each install step', done => {
      var toolboxAssetList = [
        '/test/data/files/text.txt',
        '/test/data/files/image.png'
      ];
      testHelper.activateSW('/test/data/precache-custom-install/sw.js')
      .then(() => {
        return testHelper.getAllCachedAssets('precache-custom-install-toolbox');
      })
      .then(cachedAssets => {
        var cachedAssetsKeys = Object.keys(cachedAssets);
        cachedAssetsKeys.should.have.length(toolboxAssetList.length);

        for (var i = 0; i < toolboxAssetList.length; i++) {
          var key = location.origin + toolboxAssetList[i];
          if (typeof cachedAssets[key] === 'undefined') {
            throw new Error('Cache doesn\'t have a cache item for: ' + key);
          }

          // TODO: Check the contents of the cache matches the data files?
        }
      })
      .then(() => {
        return testHelper.getAllCachedAssets('precache-custom-install');
      })
      .then(cachedAssets => {
        var expectedAssets = [
          '/test/data/files/text-1.txt',
          '/test/data/files/text-2.txt'
        ];

        var cachedAssetsKeys = Object.keys(cachedAssets);
        cachedAssetsKeys.should.have.length(expectedAssets.length);

        for (var i = 0; i < expectedAssets.length; i++) {
          var key = location.origin + expectedAssets[i];
          if (typeof cachedAssets[key] === 'undefined') {
            throw new Error('Cache doesn\'t have a cache item for: ' + key);
          }

          // TODO: Check the contents of the cache matches the data files?
        }
      })
      .then(() => {
        done();
      })
      .catch(error => {
        done(error);
      });
    });
  });
});

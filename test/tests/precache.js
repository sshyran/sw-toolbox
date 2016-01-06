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

/* eslint-disable max-len */
/* eslint-env browser, mocha */

window.chai.should();
var testHelper = window.SWTestHelper;

describe('Test SW-Toolbox', () => {
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
    it('should precache all desired assets in precache-1', done => {
      var assetList = [];
      fetch('/test/data/precache-1/assets.json')
      .then(request => {
        return request.json();
      })
      .then(response => {
        assetList = response.assets;
        return testHelper.activateSW('/test/data/precache-1/sw.js');
      })
      .then(() => {
        return testHelper.getAllCachedAssets('precache-1');
      })
      .then(cachedAssets => {
        window.debug = assetList;
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
  });
});

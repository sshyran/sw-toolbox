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

describe('Test router.head method', () => {
  function performTest(swUrl, fetchUrl, expectedString, done) {
    testHelper.activateSW(swUrl)
    .then(iframe => {
      // Call the iframes fetch event so it goes through the service worker
      return iframe.contentWindow.fetch(fetchUrl, {
        method: 'head'
      });
    })
    .then(response => {
      response.status.should.equal(200);
      return response.text();
    })
    .then(responseText => {
      responseText.should.equal(expectedString);
    })
    .then(() => done(), done);
  }

  var serviceWorkersFolder = '/test/browser-tests/router-head/serviceworkers';

  it('should return response for absolute url /test/relative-url-test', done => {
    performTest(
      serviceWorkersFolder + '/basic.js',
      '/test/relative-url-test',
      '/test/relative-url-test-head',
      done
    );
  });
});

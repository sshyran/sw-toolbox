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

/**

Things to test:
- change router.default <- last one wins?
- change default to null <- goes to network?

**/

describe('Test router.default', () => {
  var serviceWorkersFolder = '/test/browser-tests/router-default/serviceworkers';

  it('should return default response for all URLs', done => {
    var urlList = [
      '/all-urls-should-return-default',
      '/all/urls/should/return/default',
      '/all-urls-should/return-default',
      '/hello',
      '/world'
    ];
    var expectedString = 'default-response';

    testHelper.activateSW(serviceWorkersFolder + '/default.js')
    .then(iframe => {
      // Call the iframes fetch event so it goes through the service worker
      var promises = [];
      for (var i = 0; i < urlList.length; i++) {
        promises.push(iframe.contentWindow.fetch(urlList[i]));
      }
      return Promise.all(promises);
    })
    .then(responses => {
      var textPromises = [];
      for (var i = 0; i < urlList.length; i++) {
        var response = responses[i];
        response.status.should.equal(200);

        textPromises.push(response.text());
      }
      return Promise.all(textPromises);
    })
    .then(textResponses => {
      for (var i = 0; i < urlList.length; i++) {
        var responseText = textResponses[i];
        responseText.should.equal(expectedString);
      }
    })
    .then(() => done(), done);
  });

  it('should return default urls for non-defined routed', done => {
    var urlList = [
      {
        url: '/hello',
        response: 'default-response'
      },
      {
        url: '/world',
        response: 'default-response'
      },
      {
        url: '/test/relative-url-test',
        response: '/test/relative-url-test'
      }
    ];

    testHelper.activateSW(serviceWorkersFolder + '/mixed-requests.js')
    .then(iframe => {
      // Call the iframes fetch event so it goes through the service worker
      var promises = [];
      for (var i = 0; i < urlList.length; i++) {
        promises.push(iframe.contentWindow.fetch(urlList[i].url));
      }
      return Promise.all(promises);
    })
    .then(responses => {
      var textPromises = [];
      for (var i = 0; i < urlList.length; i++) {
        var response = responses[i];
        response.status.should.equal(200);

        textPromises.push(response.text());
      }
      return Promise.all(textPromises);
    })
    .then(textResponses => {
      for (var i = 0; i < urlList.length; i++) {
        var responseText = textResponses[i];
        responseText.should.equal(urlList[i].response);
      }
    })
    .then(() => done(), done);
  });
});

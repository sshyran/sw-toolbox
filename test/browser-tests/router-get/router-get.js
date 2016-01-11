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

describe('Test router.get method', () => {
  function performTest(swUrl, fetchUrl, expectedString, done) {
    testHelper.activateSW(swUrl)
    .then(iframe => {
      // Call the iframes fetch event so it goes through the service worker
      return iframe.contentWindow.fetch(fetchUrl);
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

  var serviceWorkersFolder = '/test/browser-tests/router-get/serviceworkers';

  it('should return response for absolute url /test/relative-url-test', done => {
    performTest(
      serviceWorkersFolder + '/relative.js',
      '/test/relative-url-test',
      '/test/relative-url-test',
      done
    );
  });

  it.skip('should return response for relative url test/relative-url-test-2', done => {
    performTest(
      serviceWorkersFolder + '/relative.js',
      '/test/serviceworkers/router-get/test/relative-url-test-2',
      'test/relative-url-test-2',
      result => {
        if (result) {
          done(result);
        } else {
          done('This is unpredictable behaviour. ' +
            'We probably shouldn\'t support or encourage it.');
        }
      }
    );
  });

  it('should return the variable from a pattern', done => {
    performTest(
      serviceWorkersFolder + '/variable-match.js',
      '/test/match/echo-this/pattern',
      'echo-this',
      done
    );
  });

  it.skip('should return response for a full URL', done => {
    performTest(
      serviceWorkersFolder + '/full-url.js',
      '/test/absolute-url-test',
      location.origin + '/test/absolute-url-test',
      done
    );
  });

  it('should return a response from the first defined match', done => {
    var iframe;
    testHelper.activateSW(serviceWorkersFolder + '/definition-order.js')
    .then(newIframe => {
      iframe = newIframe;
      // Call the iframes fetch event so it goes through the service worker
      return iframe.contentWindow.fetch('/multiple/match/something.html');
    })
    .then(response => {
      response.status.should.equal(200);
      return response.text();
    })
    .then(responseText => {
      responseText.should.equal('multiple-match-1');
    })
    .then(() => {
      // Call the iframes fetch event so it goes through the service worker
      return iframe.contentWindow.fetch('/multiple/match/something');
    })
    .then(response => {
      response.status.should.equal(200);
      return response.text();
    })
    .then(responseText => {
      responseText.should.equal('multiple-match-2');
    })
    .then(() => done(), done);
  });

  it.skip('should return response for different origin', done => {
    performTest(
      serviceWorkersFolder + '/origin-matching.js',
      'developers.google.com/web-origin',
      '/web-with-origin-option',
      done
    );
  });

  it('should return response for different origin with HTTP', done => {
    performTest(
      serviceWorkersFolder + '/origin-matching.js',
      'http://developers.google.com/web-origin',
      '/web-with-origin-option',
      done
    );
  });

  it('should return response for different origin with HTTPS', done => {
    performTest(
      serviceWorkersFolder + '/origin-matching.js',
      'https://developers.google.com/web-origin',
      '/web-with-origin-option',
      done
    );
  });

  it('should return response for different origin using regex', done => {
    performTest(
      serviceWorkersFolder + '/origin-matching.js',
      'developers.google.com/web-regex',
      '/web-with-regex',
      done
    );
  });

  it('should return response for different origin with HTTP using regex', done => {
    performTest(
      serviceWorkersFolder + '/origin-matching.js',
      'http://developers.google.com/web-regex',
      '/web-with-regex',
      done
    );
  });

  it('should return response for different origin with HTTPS using regex', done => {
    performTest(
      serviceWorkersFolder + '/origin-matching.js',
      'https://developers.google.com/web-regex',
      '/web-with-regex',
      done
    );
  });
});

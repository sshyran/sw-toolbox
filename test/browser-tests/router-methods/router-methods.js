/*
  Copyright 2016 Google Inc. All Rights Reserved.

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

/* eslint-env browser, mocha */

'use strict';

const availableMethods = ['get', 'post', 'put', 'delete', 'head'];

describe('Test router.{' + availableMethods.join(',') + '} methods', () => {
  const serviceWorkersFolder = '/test/browser-tests/router-methods/serviceworkers';

  const performFetch = (method, fetchUrl, expectedString) => {
    return testHelper.getIframe()
      .then(iframe => {
        // Call the iframes fetch event so it goes through the service worker
        return iframe.contentWindow.fetch(fetchUrl, {
          method: method
        });
      })
      .then(response => {
        response.status.should.equal(200);
        return response.text();
      })
      .then(responseText => {
        responseText.should.equal(expectedString);
      });
  };

  const performTest = (method, swUrl, fetchUrl, expectedString, done) => {
    let testPromise = testHelper.activateSW(swUrl + '?method=' + method)
    .then(() => {
      if (method === 'any') {
        return Promise.all(
          availableMethods.map(fetchMethod => {
            return performFetch(fetchMethod, fetchUrl, expectedString);
          })
        );
      }

      return performFetch(method, fetchUrl, expectedString);
    });

    if (done) {
      testPromise = testPromise.then(() => done(), done);
    }

    return testPromise;
  };

  const addMochaTests = method => {
    describe('Testing router.' + method, function() {
      it('should return response for absolute url', done => {
        performTest(
          method,
          serviceWorkersFolder + '/relative.js',
          '/test/relative-url-test',
          '/test/relative-url-test',
          done
        );
      });

      it('should return response for relative url', done => {
        performTest(
          method,
          serviceWorkersFolder + '/relative.js',
          serviceWorkersFolder + '/test/relative-url-test-2',
          'test/relative-url-test-2',
          done
        );
      });

      it('should return the variable from a pattern', done => {
        performTest(
          method,
          serviceWorkersFolder + '/variable-match.js',
          '/test/match/echo-this/pattern',
          'echo-this',
          done
        );
      });

     // TODO: Find out correct behaviour https://github.com/GoogleChrome/sw-toolbox/issues/86
      it.skip('should throw an error for route with an origin defined in sw testing request for full url', done => {
        performTest(
          method,
          serviceWorkersFolder + '/full-url.js',
          location.origin + '/test/absolute-url-test',
          '/test/absolute-url-test',
          done
        );
      });

      // TODO: Find out correct behaviour https://github.com/GoogleChrome/sw-toolbox/issues/86
      it.skip('should throw an error for route with an origin defined in sw testing request for relative url', done => {
        performTest(
          method,
          serviceWorkersFolder + '/full-url.js',
          '/test/absolute-url-test',
          '/test/absolute-url-test',
          done
        );
      });

      it('should return a response from the first defined match then second based on specificity', done => {
        performTest(
          method,
          serviceWorkersFolder + '/definition-order.js',
          '/multiple/match/something.html',
          'multiple-match-1'
        )
        .then(() => {
          return performFetch(
            method,
            '/multiple/match/something',
            'multiple-match-2'
          );
        })
        .then(() => done())
        .catch(done);
      });

      // Firefox version 45+ support fetch requests to other origins going through
      // service workers. This check will skip tests for older version of
      // firefox and reenable the tests when appropriate.
      var firefoxVersion = /Firefox\/(\d+).\d+/.exec(navigator.userAgent);
      if (firefoxVersion && parseInt(firefoxVersion[1], 10) < 45) {
        console.warn('Tests skipped due to version of Firefox not supporting ' +
          'cross origin requests via fetch()');
        return;
      }

      it('should not match relative path starting with the origin defined in toolbox route. Origin option as regex.', done => {
        performTest(
          method,
          serviceWorkersFolder + '/origin-matching.js',
          'developers.google.com/origin-option-regex',
          '/default',
          done
        );
      });

      it('should return response for request to a different origin defined in toolbox route. HTTP + Origin option as regex.', done => {
        performTest(
          method,
          serviceWorkersFolder + '/origin-matching.js',
          'http://developers.google.com/origin-option-regex',
          '/origin-option-regex',
          done
        );
      });

      it('should return response for request to a different origin defined in toolbox route. HTTPS + Origin option as regex.', done => {
        performTest(
          method,
          serviceWorkersFolder + '/origin-matching.js',
          'https://developers.google.com/origin-option-regex',
          '/origin-option-regex',
          done
        );
      });

      it('should not match relative path starting with origin defined in toolbox route. Origin option as string.', done => {
        performTest(
          method,
          serviceWorkersFolder + '/origin-matching.js',
          'developers.google.com/origin-option-string',
          '/default',
          done
        );
      });

      it('should return response for request to a different origin defined in toolbox route. HTTP + Origin option as string.', done => {
        performTest(
          method,
          serviceWorkersFolder + '/origin-matching.js',
          'http://developers.google.com/origin-option-string',
          '/origin-option-string',
          done
        );
      });

      it('should return response for request to a different origin defined in toolbox route. HTTPS + Origin option as string.', done => {
        performTest(
          method,
          serviceWorkersFolder + '/origin-matching.js',
          'https://developers.google.com/origin-option-string',
          '/origin-option-string',
          done
        );
      });

      it('should not match relative path starting with origin defined in toolbox route specifying HTTPS. Origin option as string.', done => {
        performTest(
          method,
          serviceWorkersFolder + '/origin-matching.js',
          'developers.google.com/https-only-string',
          '/default',
          done
        );
      });

      it('should not match a HTTP request to a different origin for route specifying HTTPS. HTTP + Origin option as string.', done => {
        performTest(
          method,
          serviceWorkersFolder + '/origin-matching.js',
          'http://developers.google.com/https-only-string',
          '/default',
          done
        );
      });

      it('should return response for HTTPS request to a different origin for route specifying HTTPS. HTTPS + Origin option as string.', done => {
        performTest(
          method,
          serviceWorkersFolder + '/origin-matching.js',
          'https://developers.google.com/https-only-string',
          '/https-only-string',
          done
        );
      });

      // Note the behaviour of this is different to previous tests with this relative path
      it('should match regex for relative request defining an origin in regex route. (Soft origin check)', done => {
        performTest(
          method,
          serviceWorkersFolder + '/origin-matching.js',
          'developers.google.com/soft-origin-regex-route',
          '/soft-origin-regex-route',
          done
        );
      });

      it('should match regex HTTP request defining an origin in regex route. (Soft origin check)', done => {
        performTest(
          method,
          serviceWorkersFolder + '/origin-matching.js',
          'http://developers.google.com/soft-origin-regex-route',
          '/soft-origin-regex-route',
          done
        );
      });

      it('should match regex HTTPS request defining an origin in regex route. (Soft origin check)', done => {
        performTest(
          method,
          serviceWorkersFolder + '/origin-matching.js',
          'https://developers.google.com/soft-origin-regex-route',
          '/soft-origin-regex-route',
          done
        );
      });

      it('should not match regex for relative request defining an origin in regex route. (Hard origin check)', done => {
        performTest(
          method,
          serviceWorkersFolder + '/origin-matching.js',
          'developers.google.com/hard-origin-regex-route',
          '/default',
          done
        );
      });

      it('should match regex HTTP request defining an origin in regex route. (Hard origin check)', done => {
        performTest(
          method,
          serviceWorkersFolder + '/origin-matching.js',
          'http://developers.google.com/hard-origin-regex-route',
          '/hard-origin-regex-route',
          done
        );
      });

      it('should match regex HTTPS request defining an origin in regex route. (Hard origin check)', done => {
        performTest(
          method,
          serviceWorkersFolder + '/origin-matching.js',
          'https://developers.google.com/hard-origin-regex-route',
          '/hard-origin-regex-route',
          done
        );
      });

      it('should not match regex for relative request defining an HTTPS origin in regex route', done => {
        performTest(
          method,
          serviceWorkersFolder + '/origin-matching.js',
          'developers.google.com/https-only-regex',
          '/default',
          done
        );
      });

      it('should not match regex for HTTP request defining an HTTPS origin in regex route', done => {
        performTest(
          method,
          serviceWorkersFolder + '/origin-matching.js',
          'http://developers.google.com/https-only-regex',
          '/default',
          done
        );
      });

      it('should match regex for HTTPS request defining an HTTPS origin in regex route', done => {
        performTest(
          method,
          serviceWorkersFolder + '/origin-matching.js',
          'https://developers.google.com/https-only-regex',
          '/https-only-regex',
          done
        );
      });
    });
  };

  availableMethods.map(method => {
    addMochaTests(method);
  });

  addMochaTests('any');
});

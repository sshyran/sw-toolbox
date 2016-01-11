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

describe('Test cacheOnly response type', () => {
  var serviceWorkersFolder = '/test/browser-tests/cache-only/serviceworkers';

  it('should return nothing from the empty', done => {
    testHelper.activateSW(serviceWorkersFolder + '/cache-tests.js')
    .then(iframe => {
      // Call the iframes fetch event so it goes through the service worker
      return iframe.contentWindow.fetch('/get-cache-value');
    })
    .then(() => {
      done(new Error('This shouldn\'t have returned a value'));
    })
    .catch(() => {
      done();
    });
  });

  it('should return value from the cache', done => {
    var date = Date.now();
    var iframe;
    testHelper.activateSW(serviceWorkersFolder + '/cache-tests.js')
    .then(newIframe => {
      // Call the iframes fetch event so it goes through the service worker
      iframe = newIframe;
      return iframe.contentWindow.fetch('/add-to-cache', {
        method: 'post',
        body: String(date)
      });
    })
    .then(() => {
      // Call the iframes fetch event so it goes through the service worker
      return iframe.contentWindow.fetch('/get-cache-value');
    })
    .then(response => {
      response.status.should.equal(200);
      return response.text();
    })
    .then(response => {
      response.should.equal(String(date));
    })
    .then(() => done(), done);
  });

  it('should uncache the value from the cache', done => {
    var date = Date.now();
    var iframe;
    testHelper.activateSW(serviceWorkersFolder + '/cache-tests.js')
    .then(newIframe => {
      // Call the iframes fetch event so it goes through the service worker
      iframe = newIframe;
      return iframe.contentWindow.fetch('/add-to-cache', {
        method: 'post',
        body: String(date)
      });
    })
    .then(response => {
      response.status.should.equal(200);
      return response.text();
    })
    .then(() => {
      // Call the iframes fetch event so it goes through the service worker
      return iframe.contentWindow.fetch('/get-cache-value');
    })
    .then(response => {
      response.status.should.equal(200);
      return response.text();
    })
    .then(response => {
      response.should.equal(String(date));
    })
    .then(() => {
      // Call the iframes fetch event so it goes through the service worker
      return iframe.contentWindow.fetch('/perform-uncache', {
        method: 'delete'
      });
    })
    .then(response => {
      response.status.should.equal(200);
    })
    .then(() => {
      // Call the iframes fetch event so it goes through the service worker
      return iframe.contentWindow.fetch('/get-cache-value')
        .then(() => {
          done(new Error('This shouldn\'t have returned a value'));
        })
        .catch(() => {
          done();
        });
    })
    .catch(err => {
      done(err);
    });
  });
});

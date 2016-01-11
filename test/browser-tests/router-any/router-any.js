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

describe('Test router.any method', () => {
  var serviceWorkersFolder = '/test/browser-tests/router-any/serviceworkers';

  it('should return match for get request', done => {
    testHelper.activateSW(serviceWorkersFolder + '/any.js')
    .then(iframe => {
      // Call the iframes fetch event so it goes through the service worker
      return iframe.contentWindow.fetch(
        '/matches/any/method',
        {
          method: 'get'
        }
      );
    })
    .then(response => {
      response.status.should.equal(200);
      return response.text();
    })
    .then(responseText => {
      responseText.should.equal('/matches/any/method');
    })
    .then(() => done(), done);
  });

  it('should return match for post request', done => {
    testHelper.activateSW(serviceWorkersFolder + '/any.js')
    .then(iframe => {
      // Call the iframes fetch event so it goes through the service worker
      return iframe.contentWindow.fetch(
        '/matches/any/method',
        {
          method: 'post'
        }
      );
    })
    .then(response => {
      response.status.should.equal(200);
      return response.text();
    })
    .then(responseText => {
      responseText.should.equal('/matches/any/method');
    })
    .then(() => done(), done);
  });

  it('should return match for head request', done => {
    testHelper.activateSW(serviceWorkersFolder + '/any.js')
    .then(iframe => {
      // Call the iframes fetch event so it goes through the service worker
      return iframe.contentWindow.fetch(
        '/matches/any/method',
        {
          method: 'head'
        }
      );
    })
    .then(response => {
      response.status.should.equal(200);
      return response.text();
    })
    .then(responseText => {
      responseText.should.equal('/matches/any/method');
    })
    .then(() => done(), done);
  });

  it('should return match for delete request', done => {
    testHelper.activateSW(serviceWorkersFolder + '/any.js')
    .then(iframe => {
      // Call the iframes fetch event so it goes through the service worker
      return iframe.contentWindow.fetch(
        '/matches/any/method',
        {
          method: 'delete'
        }
      );
    })
    .then(response => {
      response.status.should.equal(200);
      return response.text();
    })
    .then(responseText => {
      responseText.should.equal('/matches/any/method');
    })
    .then(() => done(), done);
  });

  it('should return variable match for get request', done => {
    testHelper.activateSW(serviceWorkersFolder + '/any.js')
    .then(iframe => {
      // Call the iframes fetch event so it goes through the service worker
      return iframe.contentWindow.fetch(
        '/test/match/testget/pattern',
        {
          method: 'get'
        }
      );
    })
    .then(response => {
      response.status.should.equal(200);
      return response.text();
    })
    .then(responseText => {
      responseText.should.equal('testget');
    })
    .then(() => done(), done);
  });

  it('should return variable match for post request', done => {
    testHelper.activateSW(serviceWorkersFolder + '/any.js')
    .then(iframe => {
      // Call the iframes fetch event so it goes through the service worker
      return iframe.contentWindow.fetch(
        '/test/match/testpost/pattern',
        {
          method: 'post'
        }
      );
    })
    .then(response => {
      response.status.should.equal(200);
      return response.text();
    })
    .then(responseText => {
      responseText.should.equal('testpost');
    })
    .then(() => done(), done);
  });

  it('should return variable match for head request', done => {
    testHelper.activateSW(serviceWorkersFolder + '/any.js')
    .then(iframe => {
      // Call the iframes fetch event so it goes through the service worker
      return iframe.contentWindow.fetch(
        '/test/match/testhead/pattern',
        {
          method: 'head'
        }
      );
    })
    .then(response => {
      response.status.should.equal(200);
      return response.text();
    })
    .then(responseText => {
      responseText.should.equal('testhead');
    })
    .then(() => done(), done);
  });

  it('should return variable match for delete request', done => {
    testHelper.activateSW(serviceWorkersFolder + '/any.js')
    .then(iframe => {
      // Call the iframes fetch event so it goes through the service worker
      return iframe.contentWindow.fetch(
        '/test/match/testdelete/pattern',
        {
          method: 'delete'
        }
      );
    })
    .then(response => {
      response.status.should.equal(200);
      return response.text();
    })
    .then(responseText => {
      responseText.should.equal('testdelete');
    })
    .then(() => done(), done);
  });
});

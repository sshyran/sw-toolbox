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

// toolbox.router.get('relative/route', respondOK);
// toolbox.router.get('matching/:string/patterns', function(request, values) {
//   return new Response(values.string);
// });

describe('Test router.get method', () => {
  beforeEach(function(done) {
    Promise.all([
      testHelper.unregisterAllRegistrations(),
      testHelper.clearAllCaches()
    ])
    .then(() => done(), done);
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

  it('should return response of relative url', done => {
    done('TODO');
  });

  it('should return response of absolute url', done => {
    var absoluteUrl = 'https://developers.google.com/web/tools/swtoolbox/absolute/route/test/';
    var iframe;
    testHelper.createNewIframe()
    .then(newIframe => {
      iframe = newIframe;
      return testHelper.activateSW('/test/serviceworkers/router-get/absolute.js');
    })
    .then(() => {
      console.log(iframe.src);
      // Call the iframes fetch event so it goes through the service worker
      return iframe.contentWindow.fetch(absoluteUrl);
    })
    .then(response => {
      response.status.should.equal(200);
      return response.text();
    })
    .then(responseText => {
      responseText.should.equal(absoluteUrl);
    })
    .then(() => done(), done);
  });
});

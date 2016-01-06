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

var webdriver = require('selenium-webdriver');
require('chai').should();

// var testHelper = require('./libs/helper-functions');

/* eslint-disable max-len, no-console, padded-blocks, no-multiple-empty-lines */
/* eslint-env node,mocha */

describe('Test SW-Toolbox', () => {
  var webDriver;
  before(function() {
    webDriver = new webdriver
      .Builder()
      .withCapabilities({
        browserName: 'firefox'
      })
      .build();
  });

  after(function(done) {
    webDriver.quit()
    .then(() => done(), done);
  });

  it('should pass all tests in Firefox', done => {

    new Promise(resolve => {
      webDriver.get('http://localhost:8888/test/')
      .then(function() {
        return webDriver.wait(function() {
          return webDriver.executeScript('return ((typeof window.swtoolbox !== \'undefined\') && window.swtoolbox.testResults !== \'undefined\');');
        });
      })
      .then(() => {
        return webDriver.executeScript('return window.swtoolbox.testResults;');
      })
      .then(testResults => {
        resolve(testResults);
      });
    })
    .then(testResults => {
      if (testResults.failed.length > 0) {
        var failedTests = testResults.failed;
        var errorMsg = 'Issues in Firefox.\n\nFirefox had ' + testResults.failed.length + ' test failures.\n';
        errorMsg += '------------------------------------------------\n';
        for (var i = 0; i < failedTests.length; i++) {
          var testResult = failedTests[i];
          errorMsg += '[Failed Test ' + (i + 1) + ']\n';
          errorMsg += '    ' + testResult.title + '\n';
          if ((i + 1) !== failedTests.length) {
            errorMsg += '\n';
          }
        }
        errorMsg += '------------------------------------------------\n';
        throw new Error(errorMsg);
      }
    })
    .then(() => {
      done();
    })
    .catch(err => {
      done(err);
    });
  });
});

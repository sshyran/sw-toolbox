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
var chrome = require('selenium-webdriver/chrome');
var firefox = require('selenium-webdriver/firefox');
var fs = require('fs');
require('chai').should();

// var testHelper = require('./libs/helper-functions');

/* eslint-disable max-len, no-console, padded-blocks, no-multiple-empty-lines */
/* eslint-env node,mocha */

describe('Test SW-Toolbox', () => {
  var driver = null;
  afterEach(function(done) {
    if (driver === null) {
      return done();
    }

    driver.quit()
    .then(() => {
      driver = null;
      done();
    });
  });

  var performTests = function(browserName, driver) {
    return new Promise(resolve => {
      driver.get('http://localhost:8888/test/')
      .then(function() {
        return driver.executeScript('return window.navigator.userAgent;');
      })
      .then(function(userAgent) {
        console.log('Browser User Agent: ' + userAgent);
      })
      .then(function() {
        return driver.wait(function() {
          return driver.executeScript('return ((typeof window.swtoolbox !== \'undefined\') && window.swtoolbox.testResults !== \'undefined\');');
        });
      })
      .then(() => {
        return driver.executeScript('return window.swtoolbox.testResults;');
      })
      .then(testResults => {
        resolve(testResults);
      });
    })
    .then(testResults => {
      if (testResults.failed.length > 0) {
        var failedTests = testResults.failed;
        var errorMsg = 'Issues in ' + browserName + '.\n\n' + browserName + ' had ' + testResults.failed.length + ' test failures.\n';
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
    });
  };

  it('should pass all tests in Chrome Stable', done => {
    // Chrome Options Doc: http://selenium.googlecode.com/git/docs/api/javascript/module_selenium-webdriver_chrome_class_Options.html
    var options = new chrome.Options();
    options.setChromeBinaryPath('/usr/bin/google-chrome-stable');

    driver = new webdriver
      .Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    performTests('chrome-stable', driver)
    .then(() => {
      done();
    })
    .catch(err => {
      done(err);
    });
  });

  it('should pass all tests in Chrome Beta', done => {
    var options = new chrome.Options();
    options.setChromeBinaryPath('/usr/bin/google-chrome-beta');

    driver = new webdriver
      .Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    performTests('chrome-beta', driver)
    .then(response => {
      console.log(response);
    })
    .then(() => {
      done();
    })
    .catch(err => {
      done(err);
    });
  });

  it('should pass all tests in Firefox', done => {
    driver = new webdriver
      .Builder()
      .forBrowser('firefox')
      .build();

    performTests('Firefox Stable', driver)
    .then(() => {
      done();
    })
    .catch(err => {
      done(err);
    });
  });


  it('should pass all tests in Firefox Beta', done => {
    fs.lstat('./firefox/', err => {
      if (err) {
        console.warn('Local Firefox beta couldn\'t be found. Nothing to test.');
        return done();
      }

      // Firefox Options Docs: http://selenium.googlecode.com/git/docs/api/javascript/module_selenium-webdriver_firefox_class_Options.html
      var options = new firefox.Options();
      options.setBinary('./firefox/firefox');

      driver = new webdriver
        .Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(options)
        .build();

      performTests('Firefox Beta', driver)
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
    });
  });
});

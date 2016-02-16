/**
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/* eslint-env browser */

const deleteSuccessChecker = success => {
  if (!success) {
    throw new Error('Unable to delete cache');
  }
};

var createNewIframe = function() {
  return new Promise(resolve => {
    var existingIframe = document.querySelector('.js-test-iframe');
    if (existingIframe) {
      throw new Error('You need to remove all iframes before each test.');
    }

    var newIframe = document.createElement('iframe');
    newIframe.classList.add('js-test-iframe');
    newIframe.src = '/test/iframe/' + Math.random();
    newIframe.addEventListener('load', () => {
      resolve(newIframe);
    });
    document.body.appendChild(newIframe);
  });
};

window.testHelper = {
  messageListeners: [],

  unregisterAllRegistrations: function() {
    return navigator.serviceWorker.getRegistrations()
      .then(registrations => {
        if (registrations.length === 0) {
          return null;
        }

        var unregisterPromises = [];
        for (var i = 0; i < registrations.length; i++) {
          unregisterPromises.push(
            registrations[i].unregister()
          );
        }
        return Promise.all(unregisterPromises);
      });
  },

  clearAllCaches: function() {
    return window.caches.keys()
      .then(cacheNames => {
        if (cacheNames.length === 0) {
          return null;
        }

        var cacheTaskPromises = [];
        for (var i = 0; i < cacheNames.length; i++) {
          cacheTaskPromises.push(
            window.caches.delete(cacheNames[i])
              .then(deleteSuccessChecker)
          );
        }
        return Promise.all(cacheTaskPromises);
      });
  },

  installSW: function(swFile) {
    return new Promise((resolve, reject) => {
      var iframe;
      createNewIframe()
      .then(newIframe => {
        var options = null;
        if (newIframe) {
          options = {scope: iframe.contentWindow.location.pathname};
          iframe = newIframe;
        }

        return navigator.serviceWorker.register(swFile, options);
      })
      .then(registration => {
        if (registration.installing === null) {
          throw new Error(swFile + ' already installed.');
        }

        // We unregister all service workers after each test - this should
        // always be an install
        registration.installing.onstatechange = function() {
          if (this.state !== 'installed') {
            return;
          }

          resolve(iframe);
        };
      })
      .catch(err => {
        // console.log('Error with ' + swFile, err);
        reject(err);
      });
    });
  },

  activateSW: function(swFile) {
    return new Promise((resolve, reject) => {
      var iframe;
      createNewIframe()
      .then(newIframe => {
        var options = null;
        if (newIframe) {
          options = {scope: newIframe.contentWindow.location.pathname};
          iframe = newIframe;
        }
        return navigator.serviceWorker.register(swFile, options);
      })
      .then(registration => {
        if (registration.installing === null) {
          throw new Error(swFile + ' already installed.');
        }

        // We unregister all service workers after each test - this should
        // always be an install
        registration.installing.onstatechange = function() {
          if (this.state !== 'activated') {
            return;
          }

          resolve(iframe);
        };
      })
      .catch(err => {
        // console.log('Error with ' + swFile, err);
        reject(err);
      });
    });
  },

  getAllCachedAssets: function(cacheName) {
    var cache = null;
    return window.caches.keys()
      .then(cacheKeys => {
        if (cacheKeys.indexOf(cacheName) < 0) {
          throw new Error('Cache doesn\'t exist.');
        }

        return window.caches.open(cacheName);
      })
      .then(openedCache => {
        cache = openedCache;
        return cache.keys();
      })
      .then(cacheKeys => {
        return Promise.all(cacheKeys.map(cacheKey => {
          return cache.match(cacheKey);
        }));
      })
      .then(cacheResponses => {
        // This method extracts the response streams and pairs
        // them with a url.
        return Promise.all(cacheResponses.map(response => {
          return response.text().then(text => {
            return {
              url: response.url,
              text: text
            };
          });
        }));
      })
      .then(responseTexts => {
        // This converts url, value pairs in an array to an Object
        // of urls with text values. Makes comparisons a little
        // easier in tests
        var output = {};
        for (var i = 0; i < responseTexts.length; i++) {
          var cachedResponse = responseTexts[i];
          output[cachedResponse.url] = cachedResponse.text;
        }
        return output;
      });
  },

  cleanState: function() {
    return Promise.all([
      this.unregisterAllRegistrations(),
      this.clearAllCaches()
    ])
    .then(() => {
      var iframeList = document.querySelectorAll('.js-test-iframe');
      for (var i = 0; i < iframeList.length; i++) {
        iframeList[i].parentElement.removeChild(iframeList[i]);
      }
    })
    .then(() => {
      window.testHelper.messageListeners.forEach(function(listener) {
        navigator.serviceWorker.removeEventListener('message', listener);
      });
    });
  },

  addMessageHandler: function(cb) {
    var messageListener = function(event) {
      var result = JSON.parse(event.data);
      cb(result);
    };

    window.testHelper.messageListeners.push(messageListener);

    navigator.serviceWorker.addEventListener('message', messageListener);
  }
};

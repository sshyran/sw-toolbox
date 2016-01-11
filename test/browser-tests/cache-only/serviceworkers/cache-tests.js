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

/* eslint-env browser */

// This test looks at what would happen with multiple install events.
// This should cache all assets in both the install and precache steps

importScripts('/sw-toolbox.js');

self.addEventListener('install', function() {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

self.toolbox.router.get('/get-cache-value', self.toolbox.cacheOnly);

self.toolbox.router.post('/add-to-cache', function(request) {
  return Promise.all([
    request.text(),
    caches.open(self.toolbox.options.cache.name)
  ])
  .then(function(params) {
    var text = params[0];
    var cache = params[1];
    return cache.put('/get-cache-value', new Response(text));
  })
  .then(function() {
    return new Response('done');
  }, function() {
    return new Response('error');
  });
});

self.toolbox.router.delete('/perform-uncache', function() {
  return self.toolbox.uncache('/get-cache-value')
  .then(function() {
    return new Response('done');
  }, function() {
    return new Response('error');
  });
});

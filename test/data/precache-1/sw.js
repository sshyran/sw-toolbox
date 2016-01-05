'use strict';

/* eslint-env browser */

importScripts('/sw-toolbox.js');

self.toolbox.options.debug = true;
self.toolbox.options.cache = {
  name: 'precache-1'
};

var asssetListPromise = fetch('/test/data/precache-1/assets.json')
.then(response => {
  return response.json();
})
.then(assetList => {
  return assetList.assets;
});

self.toolbox.precache(asssetListPromise);

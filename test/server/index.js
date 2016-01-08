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

'use strict';

var path = require('path');
var express = require('express');
var app = express();

// Set up static assets
app.use('/test/serviceworkers/',
  express.static(path.join(__dirname, '../serviceworkers/'), {
    setHeaders: function(res) {
      res.setHeader('Service-Worker-Allowed', '/');
    }
  }));
app.use('/',
  express.static(path.join(__dirname, '../../')));

app.get('/', function(req, res) {
  res.redirect('/test/');
});

app.get('/test/iframe/:timestamp', function(req, res) {
  res.sendFile(path.join(__dirname, '../data/test-iframe.html'));
});

var server = app.listen(8888, function() {
  console.log('Example app listening at http://localhost:%s',
    server.address().port);
});

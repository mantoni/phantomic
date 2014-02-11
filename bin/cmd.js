#!/usr/bin/env node
'use strict';

var phantomic = require('../lib/phantomic.js');

phantomic(process.stdin, function (code) {
  process.exit(code);
}).pipe(process.stdout);

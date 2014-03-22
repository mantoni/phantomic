#!/usr/bin/env node
'use strict';

var phantomic = require('../lib/phantomic.js');

var args = process.argv.slice(2);
var debug = false;
var input = process.stdin;

if (args[0] === '--debug') {
  debug = true;
  args.shift();
}
if (args.length) {
  console.log(args[0]);
  input = require('fs').createReadStream(args[0]);
}

phantomic(input, { debug : debug }, function (code) {
  process.exit(code);
}).pipe(process.stdout);

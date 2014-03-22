#!/usr/bin/env node
'use strict';

var phantomic = require('../lib/phantomic.js');

var args = process.argv.slice(2);
var debug = false;
var port = 0;
var input = process.stdin;

while (args.length && args[0][0] === '-') {
  if (args[0] === '--debug') {
    args.shift();
    debug = true;
  } else if (args[0] === '--port') {
    args.shift();
    port = parseInt(args.shift(), 10);
  } else {
    console.error('Unsupported options: ' + args[0]);
    process.exit(1);
  }
}
if (args.length) {
  console.log(args[0]);
  input = require('fs').createReadStream(args[0]);
}

phantomic(input, { debug : debug, port : port }, function (code) {
  process.exit(code);
}).pipe(process.stdout);

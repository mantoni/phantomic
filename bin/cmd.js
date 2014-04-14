#!/usr/bin/env node
'use strict';

var phantomic = require('../lib/phantomic.js');

var args = process.argv.slice(2);
var arg;
var opts = {
  debug : false,
  brout : false,
  port  : 0
};
var input = process.stdin;

while (args.length && args[0][0] === '-') {
  arg = args[0];
  if (arg === '--debug') {
    args.shift();
    opts.debug = true;
  } else if (arg === '--port') {
    args.shift();
    opts.port = parseInt(args.shift(), 10);
  } else if (arg === '--brout') {
    args.shift();
    opts.brout = true;
  } else {
    console.error('Unsupported options: ' + args[0]);
    process.exit(1);
  }
}
if (args.length) {
  console.log(args[0]);
  input = require('fs').createReadStream(args[0]);
}

phantomic(input, opts, function (code) {
  process.exit(code);
}).pipe(process.stdout);

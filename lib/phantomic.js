'use strict';

var spawn = require('child_process').spawn;

module.exports = function (input, cb) {
  var phantomjs = spawn('phantomjs', [__dirname + '/runner.js']);
  input.pipe(phantomjs.stdin);
  phantomjs.stdout.pipe(process.stdout);
  phantomjs.stderr.pipe(process.stderr);
  phantomjs.on('exit', cb);
};

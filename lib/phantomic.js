'use strict';

var through = require('through');
var spawn   = require('child_process').spawn;

module.exports = function (input, cb) {
  var phantomjs = spawn('phantomjs', [__dirname + '/runner.js']);
  var output    = through();
  input.pipe(phantomjs.stdin);
  phantomjs.stdout.on('data', function (data) {
    output.queue(data);
  });
  phantomjs.stderr.on('data', function (data) {
    output.queue(data);
  });
  phantomjs.on('exit', function (code) {
    output.queue(null);
    process.nextTick(function () {
      cb(code);
    });
  });
  return output;
};

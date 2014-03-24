/*global phantom*/
'use strict';

var system  = require('system');
var webpage = require('webpage');

var page    = webpage.create();
var errd    = false;
var timeout = null;
var signal  = '[E_PHANTOMIC] ';
var url     = 'http://localhost:' + system.env.PHANTOMIC_PORT;
var debug   = system.env.PHANTOMIC_DEBUG;
var lastLog = Date.now();
var done    = false;

if (debug) {
  system.stderr.write('PHANTOMIC_DEBUG');
  url += '?debug';
}

page.onConsoleMessage = function (msg) {
  if (msg.indexOf(signal) === 0) {
    errd = true;
    msg = msg.substring(signal.length);
  }
  if (msg === '[X_PHANTOMIC]') {
    if (!done && Date.now() - lastLog > 100) {
      done = true;
      phantom.exit(errd ? 1 : 0);
    }
  } else {
    lastLog = Date.now();
    console.log(msg);
  }
};

page.onError = function (msg, trace) {
  errd = true;
  console.log(msg);
  if (trace) {
    trace.forEach(function (t) {
      console.log('    at ' + url + '/js/bundle:' + t.line);
    });
  }
};

page.open(url);

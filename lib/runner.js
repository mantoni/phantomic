/*global phantom*/
var system  = require('system');
var webpage = require('webpage');

var page    = webpage.create();
var errd    = false;
var timeout = null;
var signal  = '[E_PHANTOMIC] ';
var url     = 'http://localhost:' + system.env.PHANTOMIC_PORT;

function checkExit() {
  clearTimeout(timeout);
  timeout = setTimeout(function () {
    phantom.exit(errd ? 1 : 0);
  }, 100);
}

page.onConsoleMessage = function (msg) {
  if (msg.indexOf(signal) === 0) {
    errd = true;
    msg = msg.substring(signal.length);
  }
  console.log(msg);
  if (timeout) {
    checkExit();
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
  if (timeout) {
    checkExit();
  }
};

page.open(url, function () {
  setTimeout(function () {
    checkExit();
  }, 10);
});

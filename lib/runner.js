var system  = require('system');
var webpage = require('webpage');


var input = system.stdin.read();
var page  = webpage.create();

page.onConsoleMessage = function (msg) {
  console.log(msg);
};

var errd = false;
page.onError = function (msg, trace) {
  errd = true;
  console.error(msg);
  trace.forEach(function (t) {
    if (t.function) {
      console.error('    at ' + t.function + ' #' + t.line);
    }
  });
};

page.content = '<html><body><script>(function () {' +
  'console.error = function (msg) { throw msg; };' +
  '}());' + input + '</script></body></html>';

setTimeout(function () {
  phantom.exit(errd ? 1 : 0);
}, 1);

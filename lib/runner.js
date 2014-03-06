var system  = require('system');
var webpage = require('webpage');


var input   = system.stdin.read();
var page    = webpage.create();
var errd    = false;
var timeout = null;
var signal  = '[E_PHANTOMIC] ';
var port    = 42000;
var url     = 'http://localhost:' + port;


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
      console.log('    at ' + url + '/js:' + t.line);
    });
  }
  if (timeout) {
    checkExit();
  }
};

var server = require('webserver').create();

var service = server.listen(port, function (req, res) {
  if (req.url === '/') {
    res.statusCode = 200;
    res.write('<html><head><meta charset="utf-8"></head><body>');
    res.write('<script src="/js"></script>');
    res.write('</body></html>');
  } else if (req.url === '/js') {
    res.statusCode = 200;
    res.write('(function () {');
    res.write('  console.error = function (msg) {');
    res.write('    console.log("' + signal + '" + msg);');
    res.write('  };');
    res.write('}());');
    res.write(input);
  } else {
    res.statusCode = 404;
  }
  res.close();
});
if (service) {
  page.open(url, function () {
    setTimeout(function () {
      checkExit();
    }, 10);
  });
} else {
  console.error('Could not start web server');
  phantom.exit(1);
}

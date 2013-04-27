var system  = require('system');
var webpage = require('webpage');


var input   = system.stdin.read();
var page    = webpage.create();
var errd    = false;
var signal  = '[E_PHANTOMIC] ';


page.onConsoleMessage = function (msg) {
  if (msg.indexOf(signal) === 0) {
    errd = true;
    msg = msg.substring(signal.length);
  }
  console.log(msg);
};

page.onError = function (msg, trace) {
  errd = true;
  console.error(msg);
  trace.forEach(function (t) {
    if (t.function) {
      console.error('    at ' + t.function + ' #' + t.line);
    }
  });
};

var server = require('webserver').create();
var port   = 42000;

var service = server.listen(port, function(req, res) {
  if (req.url === '/') {
    res.statusCode = 200;
    res.write('<html><body>');
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
  page.open('http://localhost:' + port, function () {
    setTimeout(function () {
      phantom.exit(errd ? 1 : 0);
    }, 1);
  });
} else {
  console.error('Could not start web server');
  phantom.exit(1);
}

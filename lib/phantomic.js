'use strict';

var through   = require('through');
var convert   = require('convert-source-map');
var sourceMap = require('source-map');
var spawn     = require('child_process').spawn;
var exec      = require('child_process').exec;
var http      = require('http');
var fs        = require('fs');

var stackRE   = /http\:\/\/localhost\:[0-9]+\/js\/bundle\:([0-9]+)/g;
var inspector = 'http://localhost:9000/webkit/inspector/inspector.html?page=2';


function stackMapper(mapper) {
  var buf = '';
  return through(function (data) {
    if (data) {
      buf += data.toString();
      var p = buf.lastIndexOf('\n');
      if (p !== -1) {
        var str = buf.substring(0, p + 1).replace(stackRE, function (m, nr) {
          /*jslint unparam: true*/
          if (nr < 1) {
            return '?';
          }
          var mapped = mapper.originalPositionFor({
            line   : Number(nr),
            column : 0
          });
          return mapped.source + ':' + mapped.line;
        });
        this.queue(str);
        buf = buf.substring(p + 1);
      }
    }
  });
}

function httpServer(port, js, callback) {
  var server = http.createServer(function (req, res) {
    if (req.url === '/' || req.url === '/?debug') {
      res.writeHead(200);
      fs.createReadStream(__dirname + '/page.html').pipe(res);
    } else if (req.url === '/js/bundle') {
      res.writeHead(200);
      res.write(js);
      res.end();
    } else if (req.url === '/js/es5-shim') {
      res.writeHead(200);
      fs.createReadStream(require.resolve('es5-shim/es5-shim')).pipe(res);
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  server.listen(port || 0, function (err) {
    callback(err, server.address().port);
  });
}

function launchPhantom(output, options, callback) {
  var args = [__dirname + '/runner.js'];
  if (options.debug) {
    args.unshift('--remote-debugger-autorun=yes');
    args.unshift('--remote-debugger-port=9000');
  }
  var phantomjs = spawn('phantomjs', args, {
    env: {
      PATH: process.env.PATH,
      PHANTOMIC_PORT: options.port,
      PHANTOMIC_DEBUG: options.debug ? '1' : ''
    }
  });
  phantomjs.stdout.pipe(output);
  phantomjs.stderr.on('data', function (data) {
    if (data.toString() === 'PHANTOMIC_DEBUG') {
      var cmd;
      if (process.platform === 'darwin') {
        cmd = 'open';
      } else if (process.platform === 'win32') {
        cmd = 'start ""';
      }
      if (cmd) {
        exec(cmd + ' ' + inspector);
      } else {
        process.stderr.write('\nPlease open ' + inspector + '\n');
      }
    } else {
      output.queue(data);
    }
  });
  phantomjs.on('exit', function (code) {
    output.queue(null);
    process.nextTick(function () {
      callback(code);
    });
  });
}


module.exports = function (input, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  var output = through();
  var js = '';
  input.on('data', function (d) {
    js += d;
  });
  input.on('end', function () {
    var map = convert.fromSource(js);
    if (map) {
      map = map.toObject();
      delete map.sourcesContent;
      var mapper = new sourceMap.SourceMapConsumer(map);
      js = convert.removeComments(js);
      var sm = stackMapper(mapper);
      sm.pipe(output);
      output = sm;
    }
    httpServer(options.port, js, function (err, port) {
      if (err) {
        process.stderr.write('Server failed: ' + err.toString() + '\n');
        callback(1);
      } else {
        options.port = port;
        launchPhantom(output, options, callback);
      }
    });
  });
  return output;
};

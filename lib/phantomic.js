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
      if (buf.length > 3 && !/^\s+at /.test(buf)) {
        this.queue(buf);
        buf = '';
      }
    }
  });
}

function httpServer(port, js, callback) {
  var server = http.createServer(function (req, res) {
    var url = req.url;
    var p = url.indexOf('?');
    if (p !== -1) {
      url = url.substring(0, p);
    }
    if (url === '/') {
      res.writeHead(200);
      fs.createReadStream(__dirname + '/page.html').pipe(res);
    } else if (url === '/js/bundle') {
      res.writeHead(200);
      js.pipe(res);
      js.resume();
    } else if (url === '/js/es5-shim') {
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
  var exitCode;
  var ended = 0;
  var onEnd = function () {
    if (++ended === 3) {
      output.queue(null);
      process.nextTick(function () {
        callback(exitCode);
      });
    }
  };
  var phantomjs = spawn('phantomjs', args, {
    env: {
      PATH: process.env.PATH,
      PHANTOMIC_PORT: options.port,
      PHANTOMIC_DEBUG: options.debug ? '1' : '',
      PHANTOMIC_BROUT: options.brout ? '1' : ''
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
  phantomjs.stdout.on('end', onEnd);
  phantomjs.stderr.on('end', onEnd);
  phantomjs.on('error', function (err) {
    if (err.code === 'ENOENT') {
      console.log('Cannot find phantomjs. Make sure it\'s in your $PATH.');
    } else {
      console.log('phantomjs failed:', err.toString());
    }
    ended = 2;
    exitCode = 1;
    onEnd();
  });
  phantomjs.on('exit', function (code) {
    exitCode = code;
    onEnd();
  });
}


module.exports = function (input, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  var output = through();
  var phantomOutput = through();
  var jsStream = through();
  jsStream.pause();
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
      phantomOutput.pipe(sm).pipe(output);
    } else {
      phantomOutput.pipe(output);
    }
    jsStream.queue(js);
    jsStream.queue(null);
  });
  httpServer(options.port, jsStream, function (err, port) {
    if (err) {
      process.stderr.write('Server failed: ' + err.toString() + '\n');
      callback(1);
    } else {
      options.port = port;
      launchPhantom(phantomOutput, options, callback);
    }
  });
  return output;
};

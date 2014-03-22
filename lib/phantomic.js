'use strict';

var through   = require('through');
var convert   = require('convert-source-map');
var sourceMap = require('source-map');
var spawn     = require('child_process').spawn;
var http      = require('http');
var fs        = require('fs');

var signal = '[E_PHANTOMIC] ';
var port   = 42000;

var RE = /http\:\/\/localhost\:[0-9]+\/js\/bundle\:([0-9]+)/g;


function stackMapper(mapper) {
  var buf = '';
  return through(function (data) {
    if (data) {
      buf += data.toString();
      var p = buf.lastIndexOf('\n');
      if (p !== -1) {
        var str = buf.substring(0, p + 1).replace(RE, function (m, nr) {
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

function httpServer(js, callback) {
  var server = http.createServer(function (req, res) {
    if (req.url === '/') {
      res.writeHead(200);
      fs.createReadStream(__dirname + '/page.html').pipe(res);
    } else if (req.url === '/js/bundle') {
      res.writeHead(200);
      res.write('(function () {');
      res.write('  console.error = function (msg) {');
      res.write('    console.log("' + signal + '" + msg);');
      res.write('  };');
      res.write('}());');
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
  server.listen(port, callback);
}

function launchPhantom(output, callback) {
  var args = [__dirname + '/runner.js'];
  var phantomjs = spawn('phantomjs', args, {
    env: {
      PATH: process.env.PATH,
      PHANTOMIC_PORT: port
    }
  });
  phantomjs.stdout.pipe(output);
  phantomjs.stderr.on('data', function (data) {
    output.queue(data);
  });
  phantomjs.on('exit', function (code) {
    output.queue(null);
    process.nextTick(function () {
      callback(code);
    });
  });
}


module.exports = function (input, callback) {
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
    httpServer(js, function (err) {
      if (err) {
        process.stderr.write('Server failed: ' + err.toString() + '\n');
        callback(1);
      } else {
        launchPhantom(output, callback);
      }
    });
  });
  return output;
};

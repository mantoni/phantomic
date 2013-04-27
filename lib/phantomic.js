var spawn = require('child_process').spawn;

var phantomjs = spawn('phantomjs', [__dirname + '/runner.js']);

process.stdin.pipe(phantomjs.stdin);
phantomjs.stdout.pipe(process.stdout);
phantomjs.stderr.pipe(process.stderr);
phantomjs.on('exit', function (code) {
  process.exit(code);
});

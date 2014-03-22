# Phantomic

- Pipes stdin to [PhantomJS](http://phantomjs.org)
- Writes script console output to stdout
- Writes script errors to stderr
- Exit code 0 if nothing threw, otherwise 1

## Install

```
npm install -g phantomic
```

## Usage

Phantomic does not include PhantomJS itself. Make sure the `phantomjs`
executable is in your `PATH`.

```
phantomic [--debug] [--port <num>]

    --debug       Launch the WebKit debugger in a browser
    --port <num>  Explicit port binding for web server
```

Pipe any script to phantomic:

```
phantomic < ./test.js
```

Opening a file:

```
phantomic ./test.js
```

If you are using phantomic from a Makefile with a local install, you will have
to include it in the PATH:

```
BIN = ./node_modules/.bin
PATH := $(BIN):$(PATH)

test:
  browserify ./test.js | phantomic
```

## Debugging

Debugging support is experimental. Please file issues if things are not
working.

Put a `debugger;` statement somewhere and run:

```
phantomic --debug < ./test.js
```

This will open the WebKit inspector in your browser.

## API

You can use phantomic from your own node scripts like this:

```js
var phantomic = require('phantomic');

phantomic(process.stdin, { debug : false, port : 0 }, function (code) {
  process.exit(code);
}).pipe(process.stdout);
```

## Run the test cases

```
npm install
make
```

## License

MIT

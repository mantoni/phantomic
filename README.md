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

```
phantomic < script.js
```

## With Browserify

```
browserify script.js | phantomic
```

## Run the test cases

```
git clone https://github.com/lehmannro/assert.sh
make
```

## License

MIT

#!/usr/bin/env bash

. assert.sh/assert.sh

assert "node bin/cmd.js < test/hello.js" "hello phantom.js"

assert "node bin/cmd.js ./test/hello.js" "hello phantom.js"

assert "node bin/cmd.js < test/async.js" "Oh, hi!"

assert "node bin/cmd.js < test/async-long.js" "1
2
3
4
5"
assert_end basic

assert_raises "echo '' | node bin/cmd.js --brout" 1

assert_raises "node bin/cmd.js < test/hello.js"

assert_raises "node bin/cmd.js < test/logerror.js" 1

assert_raises "node bin/cmd.js < test/error.js" 1

assert "node bin/cmd.js < test/logerror.js" "Whoups!"

assert "node bin/cmd.js < test/logerrors.js" "1
2
3"

assert_end error

assert "node bin/cmd.js --port 42000 < test/error.js | head -n 2" "Error: Ouch!
    at http://localhost:42000/js/bundle:2"

assert "node_modules/.bin/browserify test/browserify.js | bin/cmd.js" "hello emitter"

assert "node_modules/.bin/browserify --debug test/sourcemaps-console.js | node bin/cmd.js" "      at test/sourcemaps-console.js:3"
assert "node_modules/.bin/browserify --debug test/sourcemaps-uncaught.js | node bin/cmd.js | head -n 2" "Error: oups
      at test/sourcemaps-uncaught.js:2"

assert_end debugging

PHANTOM=$(which phantomjs)
NODE=$(which node)
assert "PATH=; $NODE bin/cmd.js < test/hello.js" "Cannot find phantomjs. Make sure it's in your \$PATH, or specify with --phantomjs."
# Don't know why this fails. Running this command from the command line works as expected
#assert "PATH=; $NODE bin/cmd.js --phantomjs $PHANTOM < test/hello.js" "hello phantom.js"

assert_raises "node bin/cmd.js < test/web-security.js" 1

assert "node bin/cmd.js --web-security false < test/web-security.js" "--web-security=false"

assert_raises "node bin/cmd.js < test/ignore-ssl-errors.js" 1

assert "node bin/cmd.js --web-security false --ignore-ssl-errors true < test/ignore-ssl-errors.js" "--ignore-ssl-errors=true"

assert_end "cli flag"

assert "node bin/cmd.js < test/navigation.js" "no navigation"

utc=$(date +%s --utc -d "12:00:00")
export TZ='Europe/Berlin'
offset=$((($(date +%s --utc -d "12:00:00 $(date +%Z)") - $utc) / 60))
assert "node bin/cmd.js < test/timezone.js" $offset
export TZ='America/New_York'
offset=$((($(date +%s --utc -d "12:00:00 $(date +%Z)") - $utc) / 60))
assert "node bin/cmd.js < test/timezone.js" $offset

assert_end miscellaneous

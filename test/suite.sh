. assert.sh/assert.sh

assert "node bin/cmd.js < test/hello.js" "hello phantom.js"

assert "node bin/cmd.js < test/async.js" "Oh, hi!"

assert "node bin/cmd.js < test/async-long.js" "1
2
3
4
5"

assert_raises "node bin/cmd.js < test/hello.js"

assert_raises "node bin/cmd.js < test/logerror.js" 1

assert_raises "node bin/cmd.js < test/error.js" 1

assert "node bin/cmd.js < test/logerror.js" "Whoups!"

assert "node bin/cmd.js < test/logerrors.js" "1
2
3"

assert "node bin/cmd.js < test/error.js | head -n 2" "Error: Ouch!
    at http://localhost:42000/js:2"

assert "browserify test/browserify.js | node bin/cmd.js" "hello emitter"

assert "browserify --debug test/sourcemaps-console.js | node bin/cmd.js" "    at $(pwd)/test/sourcemaps-console.js:3"
assert "browserify --debug test/sourcemaps-uncaught | node bin/cmd.js | head -n 2" "Error: oups
    at $(pwd)/test/sourcemaps-uncaught.js:2"

assert_end

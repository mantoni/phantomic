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

assert "node bin/cmd.js < test/error.js" "Error: Ouch!
    at throws #2
    at a #5
    at b #8"

assert "browserify test/browserify.js | node bin/cmd.js" "hello emitter"

assert "browserify --debug test/sourcemaps.js | node bin/cmd.js" "    at $(pwd)/test/sourcemaps.js:3"

assert_end

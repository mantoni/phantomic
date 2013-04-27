. assert.sh/assert.sh

assert "node . < test/hello.js" "hello phantom.js"

assert "node . < test/async.js" "Oh, hi!"

assert_raises "node . < test/hello.js"

assert_raises "node . < test/logerror.js" 1

assert_raises "node . < test/error.js" 1

assert "node . < test/logerror.js" "Whoups!"

assert "node . < test/error.js" "Error: Ouch!
    at throws #2
    at a #5
    at b #8"

assert "browserify test/browserify.js | node ." "hello emitter"

assert_end

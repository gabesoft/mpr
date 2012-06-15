#!/bin/bash
dir=`dirname $0`
NODE_ENV=test $dir/../node_modules/.bin/mocha \
                --grep "^[a-z]+" \
                --reporter spec \
                --timeout 2000 \
                --watch \
                --growl $dir/../test/*.js

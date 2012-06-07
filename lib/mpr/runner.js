/*
 * multiple processes manager
 */

var util = require('./util.js');

function Runner (options) {
    if (!(this instanceof Runner)) { return new Runner(options); }
}

module.exports = Runner;

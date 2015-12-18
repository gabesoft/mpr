/*
 * core logger
 */

var util   = require('./util')
  , core   = require('./core');

function Log (options) {
    if (!(this instanceof Log)) { return new Log(options); }
}

module.exports = Log;

Log.prototype.write = function(output) {
    var lines = util.exists(output.line) ? [ output.line ] : output.lines
      , toStr = function(items) {
            items = util.isArray(items) ? items : [ items ];
            var parts = items.map(function(item) {
                    return item.str();
                });
            return parts.join(output.separator || '');
        };
    lines.forEach(function(items) {
        console.log(toStr(output.label) + toStr(items));
    });
};

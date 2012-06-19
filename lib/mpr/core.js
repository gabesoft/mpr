/*
 * internal helper and utility functions for mpr
 */

var util     = require('./util')
  , Hook     = require('hook.io').Hook
  , makeHook = function(name, port) {
        return new Hook({
            name        : process.pid + '::' + name
          , silent      : true
          , debug       : false
          , 'one-way'   : true
          , 'hook-port' : port
        });
    };

module.exports.maxLen = function(items) {
    return util.max(items.map(function(x) {
        return x.length;
    }));
};

module.exports.hook        = makeHook;
module.exports.NOT_FOUND   = 'not-found';
module.exports.NOT_OFF     = 'not-off';
module.exports.NOT_ON      = 'not-on';
module.exports.NOT_RUNNING = 'not-running';
module.exports.NOT_STOPPED = 'not-stopped';
module.exports.SUCCESS     = 'success';
module.exports.SERVER_OFF  = 'server-off';

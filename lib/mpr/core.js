/*
 * internal helper and utility functions for mpr
 */

var util = require('./util')
  , Hook = require('hook.io').Hook
  , ARGS = [
        { name: 'ls', args: null, desc: 'lists all running processes', client: true }
      , { name: 'ls', args: 'long', desc: 'lists all running processes detail', client: true }
      , { name: 'stop', args: 'all', desc: 'stops all processes', client: true }
      , { name: 'stop', args: 'proc', desc: 'stops the process with the given id or name', client: true }
      , { name: 'start', args: 'all', desc: 'starts all processes', client: true }
      , { name: 'start', args: 'proc', desc: 'starts the process with the given id or name', client: true }
      , { name: 'restart', args: 'all', desc: 'restarts all processes', client: true }
      , { name: 'restart', args: 'proc', desc: 'restarts the process with the given id or name', client: true }
      , { name: 'on', args: 'all', desc: 'turns on the output of all processes', client: true }
      , { name: 'on', args: 'proc', desc: 'turns on the output of a process', client: true }
      , { name: 'off', args: 'all', desc: 'turns off the output of all processes', client: true }
      , { name: 'off', args: 'proc', desc: 'turns off the output of a process', client: true }
      , { name: 'run', args: 'file', desc: 'runs all processes in a file' }
      , { name: 'version', args: null, desc: 'displays the current version' }
    ];

function makeHook (name, port) {
    return new Hook({
        name           : process.pid + '::' + name
      , silent         : true
      , configFilePath : 'mpr-config.json'
      , debug          : false
      , 'one-way'      : true
      , 'hook-port'    : port
    });
}

function getArgs (pre, filter) {
    return ARGS
       .filter(filter)
       .map(function (x) { return { text: argstr(pre, x), arg: x }; });
}

function makeUsage () {
    var colors     = require('colors')
      , clientArgs = getArgs('mpr', function (x) { return x.client; })
      , serverArgs = getArgs('mpr', function (x) { return !x.client; })
      , allText    = clientArgs.concat(serverArgs).map(function(x) { return x.text })
      , padLen     = maxLen(allText) + 2
      , usage      = [
            ''
          , ''
          , 'M'.cyan + 'ulti ' +
                'P'.cyan + 'rocess ' +
                'R'.cyan + 'unner'
          , ''
          , ''
          , 'Usage:'.cyan.underline
          , ''
          , 'mpr command <param1> <param2> ... [--port <port>]'.yellow
          , ''
          , 'Commands:'.cyan.underline
          , ''
        ];

    serverArgs.forEach(function (x) { usage.push(pad(x.text, padLen) + ' - ' + x.arg.desc); })
    usage.push('');
    clientArgs.forEach(function (x) { usage.push(pad(x.text, padLen) + ' - ' + x.arg.desc); });
    usage.push('');
    usage.push('');

    return usage;
}

function argstr (pre, arg) {
    return (pre ? pre + ' ' : '') + arg.name + (arg.args ? ' ' + arg.args : '');
}

function pad (str, len, ch) {
    var i = 0
        c = ch || ' ';

    for (i = str.length; i < len; i++) {
        str += c;
    }

    return str;
}

function maxLen (xs) {
    var max = 0;
    xs.forEach(function (x) {
        max = Math.max(max, x.length);
    });
    return max;
}

module.exports.maxLen = function(items) {
    return util.max(items.map(function(x) {
        return x.length;
    }));
};

module.exports.hook          = makeHook;
module.exports.NOT_FOUND     = 'not-found';
module.exports.NOT_OFF       = 'not-off';
module.exports.NOT_ON        = 'not-on';
module.exports.NOT_RUNNING   = 'not-running';
module.exports.NOT_STOPPED   = 'not-stopped';
module.exports.SUCCESS       = 'success';
module.exports.SERVER_OFF    = 'server-off';
module.exports.usage         = makeUsage;
module.exports.ARGS          = ARGS;
module.exports.getServerArgs = function (pre) {
    return getArgs(pre, function (x) { return !x.client; });
};
module.exports.getClientArgs = function (pre) {
    return getArgs(pre, function (x) { return x.client; });
};

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

function parseArgs (argv) {
    return {
        command : argv._[0],
        proc    : argv._[1],
        all     : argv.all || argv._[1] === 'all',
        long    : argv.long || argv._[1] === 'long',
        file    : argv._[1]
    };
}

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

function makeClientUsage (pre) {
    var args   = getArgs(pre, function (x) { return x.client; })
      , text   = args.map(function (x) { return x.text; })
      , padLen = maxLen(text) + 2;

    return args.map(function (x) { return util.str.rpad(x.text, padLen) + ' - ' + x.arg.desc; });
}

function makeUsage () {
    var colors     = require('colors')
      , clientArgs = getArgs('mpr', function (x) { return x.client; })
      , serverArgs = getArgs('mpr', function (x) { return !x.client; })
      , allText    = clientArgs.concat(serverArgs).map(function(x) { return x.text; })
      , padLen     = maxLen(allText) + 2
      , usage      = [
            ''
          , ''
          , 'M'.cyan + 'ulti ' + 'P'.cyan + 'rocess ' + 'R'.cyan + 'unner'
          , ''
          , ''
          , 'Usage:'.cyan.underline
          , ''
          , 'mpr command <param1> <param2> ... [--port <port>]'.yellow
          , ''
          , 'Commands:'.cyan.underline
          , ''
        ];

    serverArgs.forEach(function (x) { usage.push(util.str.rpad(x.text, padLen) + ' - ' + x.arg.desc); });
    usage.push('');
    clientArgs.forEach(function (x) { usage.push(util.str.rpad(x.text, padLen) + ' - ' + x.arg.desc); });
    usage.push('');
    usage.push('');

    return usage;
}

function argstr (pre, arg) {
    return (pre ? pre + ' ' : '') + arg.name + (arg.args ? ' ' + arg.args : '');
}

function maxLen (items) {
    return util.max(items.map(function(x) {
        return x.length;
    }));
}

module.exports.maxLen        = maxLen;
module.exports.parseArgs     = parseArgs;
module.exports.hook          = makeHook;
module.exports.NOT_FOUND     = 'not-found';
module.exports.NOT_OFF       = 'not-off';
module.exports.NOT_ON        = 'not-on';
module.exports.NOT_RUNNING   = 'not-running';
module.exports.NOT_STOPPED   = 'not-stopped';
module.exports.SUCCESS       = 'success';
module.exports.SERVER_OFF    = 'server-off';
module.exports.usage         = makeUsage;
module.exports.clientUsage   = makeClientUsage;
module.exports.ARGS          = ARGS;
module.exports.getServerArgs = function (pre) {
    return getArgs(pre, function (x) { return !x.client; });
};
module.exports.getClientArgs = function (pre) {
    return getArgs(pre, function (x) { return x.client; });
};

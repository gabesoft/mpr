/*
 * mpr.js: Top level include for the mpr module
 *
 * Gabriel Adomnicai
 * MIT LICENCE
 */

var flatiron = require('flatiron')
  , colors   = require('colors')
  , eyes     = require('eyes')
  , fs       = require('fs')
  , path     = require('path')
  , commands = require('./mpr/commands.js')
  , mpr      = flatiron.app;

// TODO: make hook port a parameter


// TODO: move process initialization in a better place
process.setMaxListeners(100);
process.on('uncaughtException', function(err) {
    // TODO: log to file
    console.log('error'.red.inverse + ':', err);
});

module.exports = mpr;

mpr.config.file({ file: path.join(__dirname, 'config', 'config.json') });

mpr.use(flatiron.plugins.cli, {
    version: true
  , usage: [
        ''
      , ''
      , 'M'.cyan + 'ulti '.blue + 
            'P'.cyan + 'rocess '.blue +
            'R'.cyan + 'unner'.blue
      , ''
      , ''
      , 'Usage:'.cyan
      , ''
      , 'mpr run file      - runs all processes in file'
      , ''
      , 'mpr ls            - lists all running processes'
      , 'mpr ls --long     - lists all running processes detail'
      , ''
      , 'mpr stop --all    - stops all processes'
      , 'mpr stop proc     - stops the process with the given id or name'
      , ''
      , 'mpr start --all   - starts all processes'
      , 'mpr start proc    - starts the process with the given id or name'
      , ''
      , 'mpr restart --all - restarts all processes'
      , 'mpr restart proc  - restarts the process with the given id or name'
      , ''
      , 'mpr off --all     - turns off the output of all processes'
      , 'mpr off proc      - turns off the output for the process with'
      , '                    the given id or name'
      , 'mpr on --all      - turns on the output of all processes'
      , 'mpr on proc       - turns on the output for the process with'
      , '                    the given id or name'
      , ''
      , 'mpr ll            - alias for mpr ls --long'
      , 'mpr sp proc       - alias for mpr stop proc'
      , 'mpr st proc       - alias for mpr start proc'
      , 'mpr re proc       - alias for mpr restart proc'
    ]
    // TODO: remove argv if not used
  , argv: {
        version: {
            alias: 'v'
          , description: 'print mpr version and exit'
          , string: true
        }
      , file: {
            alias: 'f'
          , description: 'a file that contains data about the processes to run'
          , string: true
        }
      , help: false
    }
});


var showOptions = mpr.showOptions
  , showHelp    = mpr.showHelp;

mpr.commands    = commands;
mpr.showOptions = function() {
    var title = 'Options:'.cyan
      , lines = showOptions().split('\n');
    lines.shift();
    lines.unshift(' ');
    lines.unshift(title);
    return lines.join('\n');
};

//mpr.showHelp = function() {
//console.log('HELP'.inverse);
//showHelp();
//process.exit(0);
//};

//mpr.cmd(/help ([^\s]+)?\s?([^\s]+)?/, mpr.showHelp);

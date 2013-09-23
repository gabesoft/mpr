/*
 * mpr.js: Top level include for the mpr module
 *
 * Gabriel Adomnicai
 * MIT LICENCE
 */

var flatiron = require('flatiron')
  , colors   = require('colors')
  , fs       = require('fs')
  , path     = require('path')
  , commands = require('./mpr/commands.js')
  , mpr      = flatiron.app;

process.setMaxListeners(100);

module.exports = mpr;

mpr.use(flatiron.plugins.cli, {
    version: true
  , usage: [
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
      , 'mpr run file      ' + '-'.cyan + ' runs all processes in file'
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
      , 'mpr version       ' + '-'.cyan + ' displays current version'
      , ''
      , 'mpr ll            - alias for mpr ls --long'
      , 'mpr ver           - alias for mpr version'
      , 'mpr sp proc       - alias for mpr stop proc'
      , 'mpr st proc       - alias for mpr start proc'
      , 'mpr re proc       - alias for mpr restart proc'
      , ''
    ]
});

mpr.commands    = commands;

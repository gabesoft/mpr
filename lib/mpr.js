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

module.exports = mpr;

mpr.config.file({ file: path.join(__dirname, 'config', 'config.json') });

mpr.use(flatiron.plugins.cli, {
    version: true
  , usage: [
        ''
      , ''
      , 'M'.cyan + 'ulti '.grey + 
            'P'.cyan + 'rocess '.grey +
            'R'.cyan + 'unner'.grey
      , ''
      , ''
      , 'Usage:'.cyan
      , ''
      , 'mpr run file   - runs all processes in file'
      , 'mpr ls         - lists all running processes'
    ]
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

mpr.commands = commands;

mpr.showHelp = mpr.showOptions;
mpr.showOptions = function() {
    var title = 'Options:'.cyan
      , lines = mpr.showHelp().split('\n');
    lines.shift();
    lines.unshift(' ');
    lines.unshift(title);
    return lines.join('\n');
};

/*
 * mpr.js: Top level include for the mpr module
 *
 * (C) 2012 Gabriel Adomnicai
 * MIT LICENCE
 *
 */

var flatiron = require('flatiron')
  , colors   = require('colors')
  , mpr      = flatiron.app;

module.exports = mpr;

//require('pkginfo')(module, 'version');

mpr.use(flatiron.plugins.cli, {
    version: true
  , usage: [
        'usage: mpr run-file'
      , ''
      , 'Runs all the processes specified in the run file'
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
    }
});

mpr.welcome = function() {
    mpr.log.info('Welcome to ' + 'MPR'.blue);
};

//mpr.start = function(callback) {
    //console.log('start');
    //mpr.welcome();
    //return;
//};

mpr.start();

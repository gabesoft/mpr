/*
 * mpr.js: Top level include for the mpr module
 *
 * Gabriel Adomnicai
 * MIT LICENCE
 */

var flatiron = require('flatiron')
  , fs       = require('fs')
  , path     = require('path')
  , commands = require('./mpr/commands.js')
  , config   = require('./mpr/config')
  , core     = require('./mpr/core')
  , mpr      = flatiron.app;

config.read(function (err, data) {
    if (data.ulimit) {
        require('posix').setrlimit('nofile', { soft: +data.ulimit });
    }
    process.setMaxListeners(+data.maxListeners || 100);
});

module.exports = mpr;

mpr.use(flatiron.plugins.cli, {
    version : true
  , usage   : core.usage(),
});

mpr.commands = commands;

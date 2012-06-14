/*
 * commands.js: Entry points for all commands provided by mpr
 */

var commands = module.exports
  , eyes     = require('eyes')
  , fs       = require('fs')
  , colors   = require('colors')
  , util     = require('./util')
  , Hook     = require('hook.io').Hook
  , Runner   = require('./runner')
  , Reader   = require('./run_file_reader')
  , runner   = new Runner()
  , Log      = require('./log')
  , hook     = new Hook({
        name: process.pid + '-server-hook'
      , silent: true
      , debug: false
      , 'hook-port': 5001
    });

hook.on('*::list', function(data, callback) {
    callback(null, runner.list());
});

hook.listen();

commands.ls = function() {
    var self = this
      , client = new Hook({
            name: process.pid + '-client-hook'
          , silent: true
          , debug: false
          , 'hook-port': 5001
        });

    client.on('*::error::*', function(data) {
        console.log('client-hook-error'.red, data);
    });

    client.on('*::disconnected', function(h) {
        console.log(h.name.blue + ' disconnected');
    });

    client.on('hook::ready', function() {
        client.emit('list', null, function(err, data) {
            var log = new Log();
            log.setNameMaxLen(data);
            log.ls(data);
            client.stop();
            process.exit(0);
        });
    });
    client.connect();
};

commands.run = function(file) {
    var reader = new Reader()
      , procs  = reader.read(file)
      , log    = new Log();

    runner.load(procs);
    runner.on('proc::*::*', function() {
        hook.emit(this.event, util.toArray(arguments));
    });

    log.setNameMaxLen(runner.list());

    hook.on('proc::*::out', function(data) {
        log.out(data[0], data[1] + '');
    });

    hook.on('proc::*::err', function(data) {
        log.err(data[0], data[1] + '');
    });

    hook.on('proc::*::exit', function(data) {
        log.exit(data[0], data[1] + '');
    });

    hook.on('proc::*::start', function(data) {
        log.start(data[0]);
    });

    runner.startAll();
};

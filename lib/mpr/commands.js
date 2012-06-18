/*
 * commands.js: Entry points for all commands provided by mpr
 */

var commands = module.exports
  , eyes     = require('eyes')
  , fs       = require('fs')
  , colors   = require('colors')
  , util     = require('./util')
  , core     = require('./core')
  , Runner   = require('./runner')
  , Server   = require('./server')
  , Reader   = require('./run_file_reader')
  , Log      = require('./log')

  , clientCommand = function(options, mpr, fn) {
        var args   = options.args
          , event  = options.event
          , log    = new Log()
          , port   = mpr.argv.port || mpr.config.port || 5002
          , server = core.hook('server', port)
          , client = core.hook('client', port);

        server.on('*::client::' + event, function(data, callback) {
            callback(null, { status: core.SERVER_OFF });
        });

        client.on('hook::ready', function() {
            client.emit(event, args, function(err, data) {
                fn(err, log, data);
                process.exit(0);
            });
        });

        server.listen();
        client.connect();
    };

commands.run = function(file) {
  var server = new Server(this);
  server.run(file);
};

commands.ls = function() {
    var self = this;

    clientCommand({ event: 'list' }, this, function(err, log, data) {
        log.setNameMaxLen(data.procs || []);
        log.ls(data.procs, data.status, { long: self.argv.long });
    });
};

commands.stopAll = function() {
    // TODO: implement
};

commands.restartAll = function() {
    // TODO: implement
};

commands.offAll = function() {
    // TODO: implement
};

commands.onAll = function() {
    // TODO: implement
};

commands.stop = function() {
    if (this.argv.all) {
        commands.stopAll.apply(this);
        return;
    }

    var id   = this.argv._[1]
      , opts = { event: 'stop', args: id };

    clientCommand(opts, this, function(err, log, data) {
        log.clientStop(data.proc, data.status);
    });
};

commands.start = function() {
    if (this.argv.all) {
        commands.restartAll.apply(this);
        return;
    }

    var id   = this.argv._[1]
      , opts = { event: 'start', args: id };

    clientCommand(opts, this, function(err, log, data) {
        log.clientStart(data.proc, data.status);
    });
};

commands.restart = function() {
    if (this.argv.all) {
        commands.restartAll.apply(this);
        return;
    }

    var id     = this.argv._[1]
      , opts = { event: 'restart', args: id };

    clientCommand(opts, this, function(err, log, data) {
        log.clientRestart(data.proc, data.status);
    });
};

commands.off = function() {
    // TODO: check for all
    var id     = this.argv._[1]
      , opts = { event: 'off', args: id };

    clientCommand(opts, this, function(err, log, data) {
        log.clientOff(data.proc, data.status);
    });
};

commands.on = function() {
    // TODO: check for all
    var id     = this.argv._[1]
      , opts = { event: 'on', args: id };

    clientCommand(opts, this, function(err, log, data) {
        log.clientOn(data.proc, data.status);
    });
};

commands.alias = function(alias, command, args) {
    var self = this;
    self[alias] = function() {
        if (util.exists(args)) {
            util.extend(this.argv, args);
        }
        self[command].apply(this);
    };
};

commands.alias('ll', 'ls', { long: true });
commands.alias('sp', 'stop');
commands.alias('st', 'start');
commands.alias('re', 'restart');

/*
 * commands.js: Entry points for all commands provided by mpr
 */

var commands    = module.exports
  , eyes        = require('eyes')
  , fs          = require('fs')
  , colors      = require('colors')
  , util        = require('./util')
  , Hook        = require('hook.io').Hook
  , Runner      = require('./runner')
  , Reader      = require('./run_file_reader')
  , Log         = require('./log')
  , NOT_FOUND   = 'not-found'
  , NOT_OFF     = 'not-off'
  , NOT_ON      = 'not-on'
  , NOT_RUNNING = 'not-running'
  , NOT_STOPPED = 'not-stopped'
  , SUCCESS     = 'success'
  , SERVER_OFF  = 'server-off'

  , makeHook = function(name, port) {
        return new Hook({
            name        : process.pid + '::' + name
          , silent      : true
          , debug       : false
          , 'one-way'   : true
          , 'hook-port' : port
        });
    }

  , clientCommand = function(options, mpr, fn) {
        var args   = options.args
          , event  = options.event
          , log    = new Log()
          , port   = mpr.argv.port || mpr.config.port || 5002
          , server = makeHook('server', port)
          , client = makeHook('client', port);

        server.on('*::client::' + event, function(data, callback) {
            callback(null, { status: SERVER_OFF });
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
    var reader = new Reader()
      , procs  = reader.read(file)
      , runner = new Runner()
      , log    = new Log()
      , port   = this.argv.port || this.config.port || 5002
      , server = makeHook('server', port)
      , off    = {};

    runner.load(procs);
    runner.on('proc::*::*', function() {
        server.emit(this.event, util.toArray(arguments));
    });

    log.setNameMaxLen(runner.list());

    server.on('*::client::list', function(data, callback) {
        var procs = runner.list();
        procs.forEach(function(proc) {
            proc.off = !!off[proc.name];
        });
        callback(null, { procs: procs, status: SUCCESS });
    });

    server.on('*::client::stop', function(name, callback) {
        var proc    = runner.find(name)
          , stopped = false;

        if (util.nil(proc)) {
            callback(null, { status: NOT_FOUND });
        } else {
            stopped = runner.stop(proc.name);
            callback(null, { 
                proc: proc
              , status: stopped ? SUCCESS : NOT_RUNNING
            });
        }
    });

    server.on('*::client::start', function(name, callback) {
        var proc    = runner.find(name)
          , running = false;

        if (util.nil(proc)) {
            callback(null, { status: NOT_FOUND });
        } else {
            running = runner.start(proc.name);
            callback(null, {
                proc: proc
              , status: running ? SUCCESS : NOT_STOPPED
            });
        }
    });

    server.on('*::client::restart', function(name, callback) {
        var proc = runner.find(name);

        if (util.nil(proc)) {
            callback(null, { status: NOT_FOUND });
        } else {
            running = runner.restart(proc.name);
            callback(null, { proc: proc, status: SUCCESS });
        }
    });

    server.on('*::client::off', function(name, callback) {
        var proc   = runner.find(name)
          , status = util.nil(proc) 
                ? NOT_FOUND 
                : (off[proc.name] ? NOT_ON : SUCCESS );

        if (util.exists(proc)) {
            off[proc.name] = true;
        }

        callback(null, { proc: proc, status: status });
    });

    server.on('*::client::on', function(name, callback) {
        var proc   = runner.find(name)
          , status = util.nil(proc) 
                ? NOT_FOUND 
                : (off[proc.name] ? SUCCESS : NOT_OFF );

        if (util.exists(proc)) {
            off[proc.name] = false;
        }

        callback(null, { proc: proc, status: status });
    });

    server.on('proc::*::out', function(data) {
        if (!off[data[0].name]) {
            log.out(data[0], data[1] + '');
        }
    });

    server.on('proc::*::err', function(data) {
        log.err(data[0], data[1] + '');
    });

    server.on('proc::*::exit', function(data) {
        log.exit(data[0], data[1] + '');
    });

    server.on('proc::*::start', function(data) {
        log.start(data[0]);
    });

    server.listen();
    runner.startAll();
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
    var id     = this.argv._[1]
      , opts = { event: 'off', args: id };

    clientCommand(opts, this, function(err, log, data) {
        log.clientOff(data.proc, data.status);
    });
};

commands.on = function() {
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

/*
 * server commands
 */

var commands = module.exports
  , eyes     = require('eyes')
  , fs       = require('fs')
  , colors   = require('colors')
  , util     = require('./util')
  , core     = require('./core')
  , Runner   = require('./runner')
  , Reader   = require('./run_file_reader')
  , Log      = require('./server_log')

  , procCommands = [ 'stop', 'start', 'restart'];


function Server (mpr) {
    if (!(this instanceof Server)) { return new Server(mpr); }
    this.mpr    = mpr;
    this.port   = mpr.argv.port || mpr.config.port || 5002;
    this.off    = {};
    this.log    = new Log();
    this.runner = new Runner();
}

module.exports = Server;

Server.prototype.onClientAction = function(event, action) {
    this.hook.on('*::client::' + event, function(data, callback) {
        callback(null, action(data));
    });
};

Server.prototype.onClientProcAction = function(event, action) {
    var self = this;
    this.onClientAction(event, function(name) {
        var proc = self.runner.find(name);
        return util.nil(proc)
            ? { proc: null, status: core.NOT_FOUND }
            : { proc: proc, status: action(proc) };
    });
};

Server.prototype.run = function(file) {
    var reader = new Reader()
      , self   = this
      , procs  = reader.read(file)
      , hook   = core.hook('server', this.port)
      , runner = this.runner
      , log    = this.log
      , off    = this.off;

    runner.load(procs);
    runner.on('proc::*::*', function() {
        hook.emit(this.event, util.toArray(arguments));
    });

    log.init(runner.list());

    this.hook = hook;

    procCommands.forEach(function(cmd) {
        self.onClientProcAction(cmd, function(proc) {
            return runner[cmd](proc.name)
                ? core.SUCCESS 
                : core.NOT_RUNNING;
        });

        self.onClientAction(cmd + '-all', function() {
            runner[cmd + 'All']();
            return { status: core.SUCCESS };
        });
    });

    this.onClientAction('list', function() {
        var procs = runner.list();
        procs.forEach(function(proc) {
            proc.off = !!off[proc.name];
        });
        return { procs: procs, status: core.SUCCESS };
    });

    this.onClientAction('off-all', function() {
        var procs = runner.list();
        procs.forEach(function(proc) {
            off[proc.name] = true;
        });
        return { status: core.SUCCESS };
    });

    this.onClientAction('on-all', function() {
        var procs = runner.list();
        procs.forEach(function(proc) {
            off[proc.name] = false;
        });
        return { status: core.SUCCESS };
    });

    this.onClientProcAction('off', function(proc) {
        var status = off[proc.name] ? core.NOT_ON : core.SUCCESS;
        off[proc.name] = true;
        return status;
    });

    this.onClientProcAction('on', function(proc) {
        var status = off[proc.name] ? core.SUCCESS : core.NOT_OFF;
        off[proc.name] = false;
        return status;
    });

    hook.on('proc::*::out', function(data) {
        if (!off[data[0].name]) {
            log.out(data[0], data[1] + '');
        }
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

    hook.listen();
    runner.startAll();
};

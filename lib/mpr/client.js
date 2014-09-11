/*
 * client commands
 */

var util         = require('./util')
  , core         = require('./core')
  , ClientLog    = require('./client_log')
  , procCommands = [ 'stop', 'start', 'restart', 'off', 'on' ];


function Client () {
    if (!(this instanceof Client)) { return new Client(); }
    this.log = new ClientLog();
}

module.exports = Client;

Client.prototype.initLocal = function (mpr, hook) {
    this.hook = hook;
};


Client.prototype.initRemote = function (mpr, cb) {
    var port   = mpr.argv.port || mpr.config.port || 5002
      , server = core.hook('server', port)
      , client = core.hook('client', port);

    server.on('*::client::*', function(data, callback) {
        callback(null, { status: core.SERVER_OFF });
    });

    client.on('hook::ready', cb);

    server.listen();
    client.connect();

    this.hook   = client;
    this.client = client;
    this.server = server;
};

Client.prototype.shutdown = function () {
    if (this.client) {
        this.client.stop();
    }
    if (this.server) {
        this.server.stop();
    }
};



Client.prototype.command = function(options, fn, done) {
    var args  = options.args
      , event = options.event;

    done = done || function() {};

    this.hook.emit(event, args, function (err, data) {
        try {
            fn(data);
        } catch (e) {
            if (e.stack) {
                console.log(e.stack);
            } else {
                console.log(e.message);
            }
        }
        done();
    });
};

Client.prototype.commandProc = function(args, command, cb) {
    var log = this.log;

    if (args.all) {
        this[command + 'All'](args, cb);
        return;
    } else {
        var id   = args.proc
          , opts = { event: command, args: id };
        this.command(opts, function(data) {
            log[command](data.status, data.proc);
        }, cb);
    }
};

Client.prototype.commandProcAll = function(args, command, cb) {
    var opts = { event: command + '-all', args: null }
      , log  = this.log;

    this.command(opts, function(data) {
        log[command + 'All'](data.status);
    }, cb);
};

Client.prototype.ls = function(args, cb) {
    var opts = { event: 'list', args: null }
      , log  = this.log;

    this.command(opts, function(data) {
        log.ls(data.status, data.procs, { long: args.long });
    }, cb);
};

procCommands.forEach(function(command) {
    Client.prototype[command] = function(args, cb) {
        this.commandProc(args, command, cb);
    };
    Client.prototype[command + 'All'] = function(args, cb) {
        this.commandProcAll(args, command, cb);
    };
});

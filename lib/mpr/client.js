/*
 * client commands
 */

var util = require('./util')
  , core = require('./core')
  , Log  = require('./log')
  , log  = new Log();

function Client () {
    if (!(this instanceof Client)) { return new Client(); }
}

module.exports = Client;

Client.prototype.command = function(mpr, options, fn) {
    var args   = options.args
      , event  = options.event
      , port   = mpr.argv.port || mpr.config.port || 5002
      , server = core.hook('server', port)
      , client = core.hook('client', port);

    server.on('*::client::' + event, function(data, callback) {
        callback(null, { status: core.SERVER_OFF });
    });

    client.on('hook::ready', function() {
        client.emit(event, args, function(err, data) {
            fn(data);
            process.exit(0);
        });
    });

    server.listen();
    client.connect();
};

Client.prototype.commandProc = function(mpr, command, fn) {
    if (mpr.argv.all) {
        this[command + 'All'](mpr);
        return;
    } else {
        var id   = mpr.argv._[1]
          , opts = { event: command, args: id };
        this.command(mpr, opts, fn);
    }
};

Client.prototype.stopAll = function(mpr) {
    var opts = { event: 'stop-all', args: null };
    this.command(mpr, opts, function(data) {
        log.clientStopAll(data.status);
    });
};

Client.prototype.startAll = function(mpr) {
    var opts = { event: 'start-all', args: null };
    this.command(mpr, opts, function(data) {
        log.clientStartAll(data.status);
    });
};

Client.prototype.restartAll = function(mpr) {
    var opts = { event: 'restart-all', args: null };
    this.command(mpr, opts, function(data) {
        log.clientRestartAll(data.status);
    });
};

Client.prototype.offAll = function(mpr) {
    var opts = { event: 'off-all', args: null };
    this.command(mpr, opts, function(data) {
        log.clientOffAll(data.status);
    });
};

Client.prototype.onAll = function(mpr) {
    var opts = { event: 'on-all', args: null };
    this.command(mpr, opts, function(data) {
        log.clientOnAll(data.status);
    });
};

Client.prototype.stop = function(mpr) {
    this.commandProc(mpr, 'stop', function(data) {
        log.clientStop(data.proc, data.status);
    });
};

Client.prototype.start = function(mpr) {
    this.commandProc(mpr, 'start', function(data) {
        log.clientStart(data.proc, data.status);
    });
};

Client.prototype.restart = function(mpr) {
    this.commandProc(mpr, 'restart', function(data) {
        log.clientRestart(data.proc, data.status);
    });
};

Client.prototype.off = function(mpr) {
    this.commandProc(mpr, 'off', function(data) {
        log.clientOff(data.proc, data.status);
    });
};

Client.prototype.on = function(mpr) {
    this.commandProc(mpr, 'on', function(data) {
        log.clientOn(data.proc, data.status);
    });
};

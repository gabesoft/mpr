/*
 * client commands
 */

var util      = require('./util')
  , core      = require('./core')
  , ClientLog = require('./client_log')
  , log       = new ClientLog()

  , procCommands = [ 'stop', 'start', 'restart', 'off', 'on' ];


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
            client.stop(); // TODO: remove line
            process.exit(0);
        });
    });

    server.listen();
    client.connect();
};

Client.prototype.commandProc = function(mpr, command) {
    if (mpr.argv.all) {
        this[command + 'All'](mpr);
        return;
    } else {
        var id   = mpr.argv._[1]
          , opts = { event: command, args: id };
        this.command(mpr, opts, function(data) {
            log[command](data.status, data.proc);
        });
    }
};

Client.prototype.commandProcAll = function(mpr, command) {
    var opts = { event: command + '-all', args: null };
    this.command(mpr, opts, function(data) {
        log[command + 'All'](data.status);
    });
};

Client.prototype.ls = function(mpr) {
    var opts = { event: 'list', args: null };
    this.command(mpr, opts, function(data) {
        log.ls(data.status, data.procs, { long: mpr.argv.long });
    });
};

procCommands.forEach(function(command) {
    Client.prototype[command] = function(mpr) {
        this.commandProc(mpr, command);
    };
    Client.prototype[command + 'All'] = function(mpr) {
        this.commandProcAll(mpr, command);
    };
});

/*
 * commands.js: Entry points for all commands provided by mpr
 */

var commands = module.exports
  , eyes     = require('eyes')
  , util     = require('./util')
  , core     = require('./core')
  , Server   = require('./server')
  , Client   = require('./client')
  , client   = new Client()
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
    client.stop(this);
};

commands.start = function() {
    client.start(this);
};

commands.restart = function() {
    client.restart(this);
};

commands.off = function() {
    client.off(this);
};

commands.on = function() {
    client.on(this);
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

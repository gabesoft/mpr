/*
 * commands.js: Entry points for all commands provided by mpr
 */

var commands = module.exports
  , eyes     = require('eyes')
  , util     = require('./util')
  , core     = require('./core')
  , Server   = require('./server')
  , Client   = require('./client')
  , client   = new Client();

commands.run = function(file) {
    var server = new Server(this);

    server.run(file);

    process.on('uncaughtException', function(err) {
        var pad = server.log.labelLen;
        if (err.code === 'EPIPE') {
            console.log(util.str.rpad('warn', labelLen).yellow.inverse + err.message);
        } else {
            throw err;
        }
    });
};

commands.ls = function() {
    client.ls(this);
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

commands.version = function() {
    var pkg = require('../../package.json');
    console.log('Version ' + pkg.version.green);
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
commands.alias('ver', 'version');

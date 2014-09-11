/*
 * commands.js: Entry points for all commands provided by mpr
 */

var commands = module.exports
  , util     = require('./util')
  , core     = require('./core')
  , Server   = require('./server')
  , Client   = require('./client');

function runRemote (mpr, cmd) {
    var client = new Client()
      , args   = core.parseArgs(mpr.argv);

    client.initRemote(mpr, function () {
        client[cmd](args, function () {
            client.shutdown();
            process.exit(0);
        });
    });
}

function runLocal (mpr, argv, cmd, server) {
    var client = new Client()
      , args   = core.parseArgs(argv);

    client.initLocal(server.hook);
    client[cmd](args);
}

commands.run = function(file) {
    var server = new Server(this);

    server.run(file);

    server.hook.emit('list-test', { a: 1 }, function (err, data) {
        console.log('event fired', data);
    });

    // TODO: implement the cmd readline + local client functionality
};

commands.ls = function() {
    runRemote(this, 'ls');
};

commands.stop = function() {
    runRemote(this, 'stop');
};

commands.start = function() {
    runRemote(this, 'start');
};

commands.restart = function() {
    runRemote(this, 'restart');
};

commands.off = function() {
    runRemote(this, 'off');
};

commands.on = function() {
    runRemote(this, 'on');
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

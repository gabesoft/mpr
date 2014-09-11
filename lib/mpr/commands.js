/*
 * commands.js: Entry points for all commands provided by mpr
 */

var commands = module.exports
  , colors   = require('colors')
  , util     = require('./util')
  , readline = require('readline')
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

function runLocal (mpr, argv, server) {
    var client = new Client()
      , args   = core.parseArgs(argv)
      , cmd    = args.command
      , usage  = core.clientUsage();

    if (!client[cmd]) {
        mpr.log.help('Usage:'.cyan.underline);
        mpr.log.help('');
        usage.forEach(function (line) {
            mpr.log.help(line);
        });
    } else {
        client.initLocal(mpr, server.hook);
        client[cmd](args);
    }
}

commands.run = function(file) {
  var mpr    = this
    , server = new Server(this)
    , rl     = readline.createInterface({
          input  : process.stdin
        , output : process.stdout
      });

    server.run(file);

    rl.on('line', function (line) {
        runLocal(mpr, { _: line.split(/\s+/) }, server);
    });

    rl.on('SIGINT', function () {
        rl.close();
        process.kill('SIGINT');
    });
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

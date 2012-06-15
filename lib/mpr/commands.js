/*
 * commands.js: Entry points for all commands provided by mpr
 */

var commands = module.exports
  , eyes     = require('eyes')
  , fs       = require('fs')
  , colors   = require('colors')
  , util     = require('./util')
  , Hook     = require('hook.io').Hook
  , Runner   = require('./runner')
  , Reader   = require('./run_file_reader')
  , Log      = require('./log')
  , makeHook = function(name, port) {
        return new Hook({
            name        : process.pid + '-' + name
          , silent      : true
          , debug       : false
          , 'hook-port' : port
        });
    };

commands.ls = function() {
    var self = this
      , port = this.argv.port || this.config.port || 5002
      , server = makeHook('server', port)
      , client = makeHook('client', port);

    server.on('*::list', function(data, callback) {
        callback(null, []);
    });

    client.on('hook::ready', function() {
        client.emit('list', null, function(err, data) {
            var log = new Log();
            log.setNameMaxLen(data);
            log.ls(data, { long: self.argv.long });
            client.stop();
            process.exit(0);
        });
    });

    server.listen();
    client.connect();
};

commands.ll = function() {
    this.argv.long = true;
    commands.ls.apply(this);
};

commands.run = function(file) {
    var reader = new Reader()
      , procs  = reader.read(file)
      , runner = new Runner()
      , log    = new Log()
      , port   = this.argv.port || this.config.port || 5002
      , server = makeHook('server', port);

    runner.load(procs);
    runner.on('proc::*::*', function() {
        server.emit(this.event, util.toArray(arguments));
    });

    log.setNameMaxLen(runner.list());

    server.on('*::list', function(data, callback) {
        callback(null, runner.list());
    });

    server.on('*::stop', function(name, callback) {
        var proc    = runner.find(name)
          , stopped = false;

        if (util.nil(proc)) {
            callback(null, { 
                name: null
              , status: 'not-found' 
            });
        } else {
            stopped = runner.stop(proc.name);
            callback(null, { 
                name: proc.name
              , status: stopped ? 'success' : 'not-running' 
            });
        }
    });

    server.on('proc::*::out', function(data) {
        log.out(data[0], data[1] + '');
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

commands.stopAll = function() {
    // TODO: implement
};

commands.stop = function() {
    if (this.argv.all) {
        commands.stopAll.apply(this);
        return;
    }

    var id     = this.argv._[1]
      , self   = this
      , port   = this.argv.port || this.config.port || 5002
      , server = makeHook('server', port)
      , client = makeHook('client', port);

    server.on('*::find', function(data, callback) {
        callback(null, null);
    });

    client.on('hook::ready', function() {
        client.emit('stop', id, function(err, data) {

            // TODO: use the logger here
            console.log(data.name + ' ' + data.status);

            client.stop();
            process.exit(0);
        });
    });

    server.listen();
    client.connect();
};

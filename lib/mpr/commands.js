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

  , makeHook = function(name, port) {
        return new Hook({
            name        : process.pid + '::' + name
          , silent      : true
          , debug       : false
          , 'one-way'   : true
          , 'hook-port' : port
        });
    };

commands.ls = function() {
    var self   = this
      , log    = new Log()
      , port   = this.argv.port || this.config.port || 5002
      , server = makeHook('server', port)
      , client = makeHook('client', port);

    server.on('*::client::list', function(data, callback) {
        callback(null, []);
    });

    client.on('hook::ready', function() {
        client.emit('list', null, function(err, data) {
            log.setNameMaxLen(data);
            log.ls(data, { long: self.argv.long });
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
        callback(null, procs);
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

    //this.clientMessage('stop', function(err, data) {
        //log.clientStop(data.proc, data.status);
    //});

    var id     = this.argv._[1]
      , self   = this
      , log    = new Log()
      , port   = this.argv.port || this.config.port || 5002
      , server = makeHook('server', port)
      , client = makeHook('client', port);

    server.on('*::client::stop', function(data, callback) {
        callback(null, { status: NOT_FOUND });
    });

    client.on('hook::ready', function() {
        client.emit('stop', id, function(err, data) {
            log.clientStop(data.proc, data.status);
            process.exit(0);
        });
    });

    server.listen();
    client.connect();
};

commands.start = function() {
    if (this.argv.all) {
        commands.restartAll.apply(this);
        return;
    }

    var id     = this.argv._[1]
      , self   = this
      , log    = new Log()
      , port   = this.argv.port || this.config.port || 5002
      , server = makeHook('server', port)
      , client = makeHook('client', port);

    server.on('*::client::start', function(data, callback) {
        callback(null, { status: NOT_FOUND });
    });

    client.on('hook::ready', function() {
        client.emit('start', id, function(err, data) {
            log.clientStart(data.proc, data.status);
            client.stop();
            process.exit(0);
        });
    });

    server.listen();
    client.connect();
};

commands.restart = function() {
    if (this.argv.all) {
        commands.restartAll.apply(this);
        return;
    }

    var id     = this.argv._[1]
      , self   = this
      , log    = new Log()
      , port   = this.argv.port || this.config.port || 5002
      , server = makeHook('server', port)
      , client = makeHook('client', port);

    server.on('*::client::restart', function(data, callback) {
        callback(null, { status: NOT_FOUND });
    });

    client.on('hook::ready', function() {
        client.emit('restart', id, function(err, data) {
            log.clientRestart(data.proc, data.status);
            process.exit(0);
        });
    });

    server.listen();
    client.connect();
};

commands.off = function() {
    var id     = this.argv._[1]
      , self   = this
      , log    = new Log()
      , port   = this.argv.port || this.config.port || 5002
      , server = makeHook('server', port)
      , client = makeHook('client', port);

    server.on('*::client::off', function(data, callback) {
        callback(null, { status: NOT_FOUND });
    });

    client.on('hook::ready', function() {
        client.emit('off', id, function(err, data) {
            log.clientOff(data.proc, data.status);
            process.exit(0);
        });
    });

    server.listen();
    client.connect();
};

commands.on = function() {
    var id     = this.argv._[1]
      , self   = this
      , log    = new Log()
      , port   = this.argv.port || this.config.port || 5002
      , server = makeHook('server', port)
      , client = makeHook('client', port);

    server.on('*::client::on', function(data, callback) {
        callback(null, { status: NOT_FOUND });
    });

    client.on('hook::ready', function() {
        client.emit('on', id, function(err, data) {
            log.clientOn(data.proc, data.status);
            process.exit(0);
        });
    });

    server.listen();
    client.connect();

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

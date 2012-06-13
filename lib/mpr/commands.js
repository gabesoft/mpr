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
  , runner   = new Runner()
  , Log      = require('./log')
  , log      = new Log()
  , hook     = new Hook({
        name: process.pid + '-server-hook'
      , silent: true
      , debug: false
      , 'hook-port': 5001
    });

hook.on('*::list', function(data, callback) {
    callback(null, runner.list());
});

hook.on('proc::*::out', function(data) {
    log.out(data[0], data[1] + '');
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

commands.ls = function() {
    var self = this
      , client = new Hook({
            name: process.pid + '-client-hook'
          , silent: true
          , debug: false
          , 'hook-port': 5001
        });

    client.on('*::error::*', function(data) {
        console.log('client-hook-error'.red, data);
    });

    client.on('*::disconnected', function(h) {
        console.log(h.name.blue + ' disconnected');
    });

    client.on('hook::ready', function() {
        client.emit('list', null, function(err, data) {
            // TODO: don't use info - use a custom logger
            log.setNameMaxLen(data);
            log.ls(data); // TODO: pass params --all, --long

            //if (util.nil(data) || data.length === 0) {
                //self.log.info('no processes were started'.cyan);
            //} else {
                //self.log.info('');
                //self.log.info('process list'.cyan.underline);
                //self.log.info('');
                //data.forEach(function(p) {
                    //self.log.info((p.running ? '⨀ '.green : '⨂ '.red)
                        //+ p.name + ' \t' 
                        //+ p.command + '      \t('
                        //+ (p.running ? (p.pid + '') : 'stopped') + ')');
                //});
                //self.log.info('');
            //}
            client.stop();
            process.exit(0);
        });
    });
    client.connect();
};

commands.run = function(file) {
    var data   = fs.readFileSync(file)
      , self   = this
      , procs  = JSON.parse(data)
      , lens   = null;

    // TODO: move to run file parser
    Object.keys(procs).forEach(function(name) {
        var proc = procs[name]
          , all  = [];
        proc.args = proc.args || [];
        proc.args.forEach(function(args) {
            all = all.concat(args.split(/\s+/g));
        });
        proc.args = all;
    });

    runner.load(procs);
    runner.on('proc::*::*', function() {
        hook.emit(this.event, util.toArray(arguments));
    });

    log.setNameMaxLen(runner.list());

    runner.startAll();
};

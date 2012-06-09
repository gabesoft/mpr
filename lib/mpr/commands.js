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
            //log.ls(data); // TODO: pass params --all, --long

            if (util.nil(data) || data.length === 0) {
                self.log.info('no processes were started'.cyan);
            } else {
                self.log.info('');
                self.log.info('process list'.cyan.underline);
                self.log.info('');
                data.forEach(function(p) {
                    self.log.info(p.name + ' \t' 
                        + p.command + '      \t('
                        + (p.running ? (p.pid + '') : 'stopped') + ')');
                });
                self.log.info('');
            }
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

    runner.load(procs);
    runner.on('proc::*::*', function() {
        hook.emit(this.event, util.toArray(arguments));
    });

    lens = runner.list().map(function(proc) {
        return proc.name.length;
    });
    log.setNameMaxLen(util.max(lens) + 1);

    runner.startAll();

    //Object.keys(pdata).forEach(function(name) {
    //var raw  = pdata[name]
    //, opts = util.extend({ name: name }, raw)
    //, proc = new Proc(opts);

    //proc.on('*::out', function(p, data) {
    //var lines = (data + '').split('\n').filter(Boolean);
    //lines.forEach(function(line) {
    //console.log(p.name[p.color] + '> '.red + line);
    //});
    //});
    //proc.on('*::err', function(p, data) {
    //console.log(p.name[p.color] + '> '.red + '(error) '.red + util.str.trim(data));
    //});
    //proc.on('*::exit', function(p, code) {
    //console.log(p.name[p.color] + '>'.red 
    //+ ' '
    //+ 'exited with code '.inverse 
    //+ (util.nil(code) ? '0'.inverse : (code + '').inverse));
    //});
    //proc.once('*::start', function(p) {
    //console.log(p.name[p.color] + '> '.red 
    //+ 'started '.green
    //+ p.command.green
    //+ (' (' + p.pid + ')').green);
    //});
    //proc.start();

    //procs.push(proc);

    //});

    // TODO: align all output
    // TODO: kill all procs on exit
};

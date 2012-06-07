/*
 * commands.js: Entry points for all commands provided by mpr
 */

var commands = module.exports
  , eyes     = require('eyes')
  , fs       = require('fs')
  , colors   = require('colors')
  , util     = require('./util')
  , Proc     = require('./proc');

commands.ls = function() {
    this.log.info('list all processes here');
};

commands.run = function(file) {
    var data  = fs.readFileSync(file)
      , me    = this
      , pdata = JSON.parse(data)
      , procs = [];

    Object.keys(pdata).forEach(function(name) {
        var raw  = pdata[name]
          , opts = util.extend({ name: name }, raw)
          , proc = new Proc(opts);

        proc.on('*::out', function(p, data) {
            var lines = (data + '').split('\n').filter(Boolean);
            lines.forEach(function(line) {
                console.log(p.name[p.color] + '> '.red + line);
            });
        });
        proc.on('*::err', function(p, data) {
            console.log(p.name.red + '> '.red + util.str.trim(data));
        });
        proc.on('*::exit', function(p, code) {
            console.log(p.name.grey.underline + '>'.red 
                + ' exited with code '.yellow.underline 
                + (util.nil(code) ? 'NULL'.grey : (code + '').yellow.underline));
        });
        proc.start();

        procs.push(proc);

        // TODO: align all output
        // TODO: kill all procs on exit
    });
};

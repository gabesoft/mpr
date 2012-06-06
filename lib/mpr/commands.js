/*
 * commands.js: Entry points for all commands provided by mpr
 */

var commands = module.exports
  , fs       = require('fs');

commands.ls = function() {
    this.log.info('list all processes here');
};

commands.run = function(file) {
    var data  = fs.readFileSync(file)
      , me    = this
      , procs = JSON.parse(data);

    Object.keys(procs).forEach(function(proc) {
        me.log.info('Process to run: ' + proc.blue.bold);
    });
};

/*
 * multiple processes runner
 */

var util         = require('./util.js')
  , Proc         = require('./proc')
  , EventEmitter = require('eventemitter2').EventEmitter2
  , fs           = require('fs')
  , procCommands = [ 'start', 'stop', 'restart' ];

function Runner (options) {
    if (!(this instanceof Runner)) { return new Runner(options); }
    this.procs = {};

    EventEmitter.call(this, {
        delimiter: '::'
      , wildcard: true
    });
}

util.inherits(Runner, EventEmitter);

module.exports = Runner;

Runner.prototype.load = function(procs) {
    var self = this
      , id   = 1;

    Object.keys(procs).forEach(function(name) {
        var opts = util.extend({ name: name, id: id }, procs[name])
          , proc = new Proc(opts);

        id += 1;
        proc.onAny(function() {
            var args = util.toArray(arguments);
            args.unshift(this.event);
            self.emit.apply(self, args);
        });

        self.procs[name] = proc;
    });
};

Runner.prototype.map = function(fn) {
    var procs = this.procs;
    return Object.keys(procs).map(function(name) {
        return fn(procs[name]);
    });
};

Runner.prototype.list = function() {
    return this.map(function (p) { return p.toJSON(); });
};

procCommands.forEach(function(cmd) {
    Runner.prototype[cmd] = function(pName, fnName) {
        if (util.nil(pName)) {
            this[cmd + 'All']();
            return true;
        } else {
            return this.procs[pName][cmd]();
        }
    };

    Runner.prototype[cmd + 'All'] = function() {
        return this.map(function (p) { return p[cmd](); });
    };
});

Runner.prototype.find = function(name) {
    if (util.nil(name)) { return null; }

    var id    = util.isString(name) ? parseInt(name, 10) : name
      , procs = this.procs
      , proc  = procs[name];

    if (util.exists(proc)) { return proc.toJSON(); }

    procs = this.list();

    proc = procs.filter(function(p) {
        return p.id === id;
    });
    if (util.exists(proc[0])) { return proc[0]; }

    proc = procs.filter(function(p) {
        return p.pid === id;
    });
    if (util.exists(proc[0])) { return proc[0]; }

    return null;
};

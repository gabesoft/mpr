/*
 * multiple processes runner
 */

var util         = require('./util.js')
  , Proc         = require('./proc')
  , EventEmitter = require('EventEmitter2').EventEmitter2
  , fs           = require('fs');

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

Runner.prototype.list = function() {
    var self = this;
    return Object.keys(self.procs).map(function(name) {
        return self.procs[name].toJSON();
    });
};

Runner.prototype.startAll = function() {
    this.each(function(proc) { proc.start(); });
};

Runner.prototype.stopAll = function() {
    this.each(function(proc) { proc.stop(); });
};

Runner.prototype.restartAll = function() {
    this.each(function(proc) { proc.restart(); });
};

Runner.prototype.start = function(name) {
    return this.runfn(name, 'start');
};

Runner.prototype.stop = function(name) {
    return this.runfn(name, 'stop');
};

Runner.prototype.restart = function(name) {
    return this.runfn(name, 'restart');
};

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

Runner.prototype.runfn = function(pName, fnName) {
    if (util.nil(pName)) {
        this[fnName + 'All']();
        return true;
    } else {
        return this.procs[pName][fnName]();
    }
};

Runner.prototype.each = function(fn) {
    var self  = this
      , procs = this.procs;
    Object.keys(procs).forEach(function(name) {
        fn(procs[name]);
    });
};

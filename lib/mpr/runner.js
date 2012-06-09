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
    var self = this;

    Object.keys(procs).forEach(function(name) {
        var opts = util.extend({ name: name }, procs[name])
          , proc = new Proc(opts);

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
    this.runfn(name, 'start');
};

Runner.prototype.stop = function(name) {
    this.runfn(name, 'stop');
};

Runner.prototype.restart = function(name) {
    this.runfn(name, 'restart');
};

Runner.prototype.runfn = function(pName, fnName) {
    if (util.nil(pName)) {
        this[fnName + 'All']();
    } else {
        this.procs[pName][fnName]();
    }
};

Runner.prototype.each = function(fn) {
    var self  = this
      , procs = this.procs;
    Object.keys(procs).forEach(function(name) {
        fn(procs[name]);
    });
};

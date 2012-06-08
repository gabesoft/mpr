/*
 * multiple processes manager
 */

var util         = require('./util.js')
  , Proc         = require('./proc')
  , EventEmitter = require('EventEmitter2').EventEmitter2
  , fs           = require('fs')
  , eyes         = require('eyes');

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
            self.emit(this.event, arguments);
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

Runner.prototype.each = function(fn) {
    var self  = this
      , procs = this.procs;
    Object.keys(procs).forEach(function(name) {
        fn(procs[name]);
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
    if (util.nil(name)) {
        this.startAll();
    } else {
        this.procs[name].start();
    }
};

Runner.prototype.stop = function(name) {
    if (util.nil(name)) {
        this.stopAll();
    } else {
        this.procs[name].stop();
    }
};

Runner.prototype.restart = function(name) {
    if (util.nil(name)) {
        this.restartAll();
    } else {
        this.procs[name].restart();
    }
};

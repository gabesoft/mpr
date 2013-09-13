/*
 * single process runner
 */

var util         = require('./util')
  , eyes         = require('eyes')
  , spawn        = require('child_process').spawn
  , EventEmitter = require('eventemitter2').EventEmitter2
  , DELIMITER    = '::'
  , NOT_STARTED  = 'not-started'
  , RUNNING      = 'running'
  , STOPPED      = 'stopped';

function Proc (options) {
    if (!(this instanceof Proc)) { return new Proc(options); }

    var self = this;

    this.name       = options.name;
    this.color      = options.color || 'grey';
    this.command    = options.command;
    this.args       = options.args || [];
    this.id         = options.id || 0;
    this.cwd        = options.cwd;
    this.env        = util.extend({}, process.env, options.env || {});
    this.status     = NOT_STARTED;
    this.proc       = null;
    this.killSignal = options.killSignal || 'SIGTERM';
    this.ev         = function(eventName) { 
        return util.str.sprintf('proc::%s::%s', self.name, eventName);
    }

    process.once('exit', util.bind(this.stop, this));

    EventEmitter.call(this, {
        delimiter: DELIMITER
      , wildcard: true
    });
}

util.inherits(Proc, EventEmitter);

module.exports = Proc;

Proc.prototype.start = function() {
    var self = this;
    if (this.proc === null) {
        this.proc = spawn(this.command, this.args, { cwd: this.cwd, env: this.env });
        this.status = RUNNING;

        this.proc.stdout.on('data', function(data) {
            self.emit(self.ev('out'), self.toJSON(), data);
        });
        this.proc.stderr.on('data', function(data) {
            self.emit(self.ev('err'), self.toJSON(), data);
        });
        this.proc.once('exit', function(code) {
            self.status = STOPPED;
            self.emit(self.ev('exit'), self.toJSON(), code);
            self.proc.removeAllListeners();
            self.proc = null;
        });

        this.emit(self.ev('start'), self.toJSON());

        return true;
    }  else {
        return false;
    }
};

Proc.prototype.stop = function() {
    if (this.proc !== null) {
        this.proc.kill(this.killSignal);
        return true;
    } else {
        return false;
    }
};

Proc.prototype.restart = function() {
    var self = this;

    if (this.proc !== null) {
        this.proc.once('exit', function(code) {
            self.start();
        });
        this.stop();
    } else {
        this.start();
    }

    return true;
};

Proc.prototype.toJSON = function() {
    return {
        name    : this.name
      , color   : this.color
      , command : this.command + ' ' + (this.args.join(' '))
      , running : this.status === RUNNING
      , status  : this.status
      , args    : this.args
      , id      : this.id
      , cwd     : this.cwd || ''
      , env     : this.env
      , pid     : util.nil(this.proc) ? 0 : this.proc.pid
    };
};

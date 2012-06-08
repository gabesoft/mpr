/*
 * single process runner
 */

var util         = require('./util')
  , eyes         = require('eyes')
  , spawn        = require('child_process').spawn
  , EventEmitter = require('EventEmitter2').EventEmitter2
  , DELIMITER    = '::';

function Proc (options) {
    if (!(this instanceof Proc)) { return new Proc(options); }

    var self = this;

    this.name    = options.name;
    this.color   = options.color || 'grey';
    this.command = options.command;
    this.args    = options.args || [];
    this.cwd     = options.cwd;
    this.env     = util.extend(options.env || {}, process.env);
    this.running = false;
    this.proc    = null;
    this.evname  = function(eventName) { 
        return util.str.sprintf('%s::%s', self.name, eventName);
    }

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
        this.running = true;

        this.proc.stdout.on('data', function(data) {
            self.emit(self.evname('out'), self.toJSON(), data);
        });
        this.proc.stderr.on('data', function(data) {
            self.emit(self.evname('err'), self.toJSON(), data);
        });
        this.proc.on('exit', function(code) {
            self.running = false;
            self.emit(self.evname('exit'), self.toJSON(), code);
        });

        this.emit(self.evname('start'), self.toJSON());

        process.on('exit', function() {
            self.stop();
        });
    } 
};

Proc.prototype.stop = function() {
    if (this.proc !== null) {
        this.proc.kill();
    }
};

Proc.prototype.restart = function() {
    this.stop();
    this.start();
};

Proc.prototype.toJSON = function() {
    return {
        name: this.name
      , color: this.color
      , command: this.command
      , running: this.running
      , args: this.args
      , cwd: this.cwd || ''
      , env: this.env
      , pid: util.nil(this.proc) ? 0 : this.proc.pid
    };
};
/*
 * logger for client activity
 */

var util = require('./util')
  , Log  = require('./log')
  , Text = require('./text_item')
  , log  = new Log()
  , pad  = '   '
  , core = require('./core')

  , levels = {
        error     : { text: 'error', color: 'red' }
      , errorLoud : { text: 'error', color: [ 'red', 'inverse' ] }
      , info      : { text: 'info',  color: 'green' }
      , warn      : { text: 'warn',  color: 'yellow' }
    }

  , levelLen = core.maxLen(util.pluck(Object
        .keys(levels)
        .map(function(k) { return levels[k]; }), 'text'))

  , addNewLines = function(lines, count, inFront) {
        var i = 0;
        for (i = 0; i < count; i += 1) {
            lines[inFront ? 'unshift' : 'push']([ new Text() ]);
        }
    };


function ClientLog (options) {
    if (!(this instanceof ClientLog)) { return new ClientLog(options); }
}

module.exports = ClientLog;

ClientLog.prototype.makeLabel = function(level) {
    return [
        new Text(levels[level].text, levels[level].color)
      , new Text(util.str.rpad(':', levelLen))
    ];
};

ClientLog.prototype.makeLines = function(line, verticalPad) {
    var lines = [], i = 0;
    verticalPad = verticalPad || 0;

    for (i = 0; i < verticalPad; i += 1) {
        lines.push([ new Text() ]);
    }

    lines.push(util.isArray(line) ? line : [ line ]);

    for (i = 0; i < verticalPad; i += 1) {
        lines.push([ new Text() ]);
    }

    return lines;
};

ClientLog.prototype.write = function(status, lines, label, proc) {
    var output = {};
    switch(status) {
        case core.SERVER_OFF:
            output.label = this.makeLabel('error');
            output.lines = this.makeLines(new Text('No processes were started.'), 2);
            break;
        case core.NOT_FOUND:
            output.label = this.makeLabel('error');
            output.lines = this.makeLines(new Text('A process with the specified id or name was not found.'), 2);
            break;
        case core.NOT_RUNNING:
            output.label = this.makeLabel('warn');
            output.lines = this.makeLines([
                new Text('Process ')
              , new Text(proc.name, 'blue')
              , new Text(' is not running.')
            ] , 2);
            break;
        case core.NOT_STOPPED:
            output.label = this.makeLabel('warn');
            output.lines = this.makeLines([
                new Text('Process ')
              , new Text(proc.name, 'blue')
              , new Text(' is already running.')
            ] , 2);
            break;
        case core.NOT_OFF:
            output.label = this.makeLabel('warn');
            output.lines = this.makeLines([
                new Text('The output of process ')
              , new Text(proc.name, 'blue')
              , new Text(' is already on.')
            ] , 2);
            break;
        case core.NOT_ON:
            output.label = this.makeLabel('warn');
            output.lines = this.makeLines([
                new Text('The output of process ')
              , new Text(proc.name, 'blue')
              , new Text(' is already off.')
            ] , 2);
            break;
        case core.SUCCESS:
            output.label = label || this.makeLabel('info');
            output.lines = util.isFunction(lines) ? lines() : lines;
            break;
        default:
            output.label = this.makeLabel('errorLoud');
            output.lines = this.makeLines([
                new Text('Unknown status ')
              , new Text(status)
            ] , 2);
    }
    log.write(output);
};

ClientLog.prototype.writeln = function(status, msg, label, proc) {
    var text  = util.isString(msg) ? new Text(msg) : msg
      , lines = this.makeLines(text, 2);
    this.write(status, lines, label, proc);
};

ClientLog.prototype.list = function(procs, options) {
    var opts    = options || { long : false }
      , long    = opts.long
      , pidLen  = core.maxLen(util.pluck(procs, 'pid')) + 2
      , nameLen = core.maxLen(util.pluck(procs, 'name'))
      , lines   = [];

    procs.forEach(function(proc) {
        lines.push( [
            new Text(proc.id + ' ')
          , new Text(util.str.rpad(proc.name, nameLen), 'yellow')
          , new Text(proc.running ? ' running ' : ' stopped', proc.running ? 'green' : 'magenta')
          , new Text(util.str.rpad(proc.running ? '(' + proc.pid + ')' : '', pidLen), long ? 'green' : 'grey')
          , new Text(proc.running ? ' output ' : '')
          , new Text(proc.running ? (proc.off ? 'off' : 'on') : '', proc.off ? 'red' : 'green')
        ]);

        if (long) {
            lines.push(new Text(proc.command, 'grey'));
        }
    });

    addNewLines(lines, 1, true);

    lines.unshift([ new Text('Process', 'underline'), new Text(' '), new Text('List', 'underline') ]);

    addNewLines(lines, 2, true);
    addNewLines(lines, 2);

    return lines;
};

ClientLog.prototype.ls = function(status, procs, options) {
    var self = this;
    this.write(status
      , function() { return self.list(procs, options); }
      , new Text(pad));
};

ClientLog.prototype.stopAll = function(status) {
    this.writeln(status, 'Sent the kill signal to all running processes.');
};

ClientLog.prototype.startAll = function(status) {
    this.writeln(status, 'Attempted to start all stopped processes.');
};

ClientLog.prototype.restartAll = function(status) {
    this.writeln(status, 'Attempted to restart all processes.');
};

ClientLog.prototype.offAll = function(status) {
    this.writeln(status, [
        new Text('The output of all processes has been turned ' )
      , new Text('off', 'red')
    ]);
};

ClientLog.prototype.onAll = function(status) {
    this.writeln(status, [
        new Text('The output of all processes has been turned ' )
      , new Text('on', 'green')
    ]);
};

ClientLog.prototype.stop = function(status, proc) {
    proc = proc || {};
    this.writeln(status, [
        new Text('Process ')
      , new Text(proc.name, 'blue')
      , new Text(' was sent the kill signal.')
    ], null, proc);
};

ClientLog.prototype.start = function(status, proc) {
    proc = proc || {};
    this.writeln(status, [
        new Text('Attempted to start process ')
      , new Text(proc.name, 'blue')
      , new Text('.')
    ], null, proc);
};

ClientLog.prototype.restart = function(status, proc) {
    proc = proc || {};
    this.writeln(status, [
        new Text('Attempted to restart process ')
      , new Text(proc.name, 'blue')
      , new Text('.')
    ], null, proc);
};

ClientLog.prototype.on = function(status, proc) {
    proc = proc || {};
    this.writeln(status, [
        new Text('The output of process ')
      , new Text(proc.name, 'blue')
      , new Text(' is now turned ')
      , new Text('on', 'green')
      , new Text('.')
    ], null, proc);
};

ClientLog.prototype.off = function(status, proc) {
    proc = proc || {};
    this.writeln(status, [
        new Text('The output of process ')
      , new Text(proc.name, 'blue')
      , new Text(' is now turned ')
      , new Text('off', 'red')
      , new Text('.')
    ], null, proc);
};

/*
 * command data logger
 */

var util   = require('./util')
  , pad    = '   '
  , eyes   = require('eyes')
  , colors = require('colors')
  , codes  = { 
        '1'   : 'general error'
      , '2'   : 'missing keyword or command'
      , '126' : 'command cannot execute'
      , '127' : 'command not found'
      , '128' : 'invalid argument to exit'
      , '130' : 'script terminated by user'
    }
  , levels = {
        error: { text: 'error', label: 'error'.red }
      , errorLoud: { text: 'error', label: 'error'.red.inverse }
      , info: { text: 'info', label: 'info'.green }
      , warn: { text: 'warn', label: 'warn'.yellow }
    }

  , maxlen = function(names) {
        return util.max(names.map(function(n) {
            return n.length;
        }));
    }

  , levelMax = maxlen(util.pluck(Object
        .keys(levels)
        .map(function(k) { return levels[k]; }), 'text'))

  , logln = function(label, color, msg) {
        console.log(label[color] + ' ' + msg + ' ' + '¬'[color]);
    }

  , emptyln = function(count) {
        var i = 0, len = count || 0;
        for (i = 0; i < len; i += 1) {
            console.log('');
        }
    }

  , loglv = function(level, msg, verticalPad) {
        var i     = 0
          , lv    = levels[level]
          , label = lv.label + util.str.rpad(':', levelMax - lv.text.length) + pad
          , vpad  = verticalPad || 0;

        for (i = 0; i < vpad; i += 1) {
            console.log(label);
        }

        console.log(label + msg);

        for (i = 0; i < vpad; i += 1) {
            console.log(label);
        }
    };

function Log (options) {
    if (!(this instanceof Log)) { return new Log(options); }
    options         = options || {};
    this.nameMaxLen = options.nameMaxLen || 0;
}

module.exports = Log;

Log.prototype.setNameMaxLen = function(procs) {
    this.nameMaxLen = maxlen(util.pluck(procs, 'name'));
};

Log.prototype.out = function(proc, data) {
    var lines = util.str.lines(data).filter(Boolean)
      , name  = proc.name
      , color = proc.color
      , label = util.str.rpad(name, this.nameMaxLen);

    lines.forEach(function(line) {
        logln(label, color, util.str.trim(line));
    });
};

Log.prototype.err = function(proc, data) {
    var lines = util.str.lines(data).filter(Boolean)
      , name  = proc.name
      , color = proc.color
      , label = util.str.rpad(name, this.nameMaxLen);

    lines.forEach(function(line) {
        var ln = util.str.trim(line);
        if (ln.length > 0) {
            logln(label, color, 'error: '.red + ln);
        }
    });
};

Log.prototype.exit = function(proc, code) {
    var name     = proc.name
      , color    = proc.color
      , label    = util.str.rpad(name ,this.nameMaxLen)
      , noCode   = util.nil(code) || code.length === 0
      , codeDesc = noCode ? '' : codes[code]
      , codeStr  = noCode ? '' : code + (codeDesc ? ' (' + codeDesc + ')' : '')
      , line     = util.nil(code) ? 'exited' : 'exited with code ' + codeStr;

    console.log(label[color] + ' ' + line.inverse);
};

Log.prototype.start = function(proc) {
    var name  = proc.name
      , color = proc.color
      , label = util.str.rpad(name, this.nameMaxLen)
      , cmd   = proc.command
      , pid   = proc.pid
      , line  = pid + ' ' + cmd;

    console.log(label[color] + ' ' + 'started: '.green + line);
};

Log.prototype.ls = function(procs, options) {
    var self = this
      , opts = options || { long: false }
      , pids = util.toMap(procs
          , function(p) { return p.name; }
          , function(p) { 
                return { 
                    color: p.running ? 'green' : 'magenta'
                  , text : p.running ? ('running (' + p.pid + ')') : 'stopped' };
            })
      , pidlen = maxlen(util.pluck(pids, 'text'));

    emptyln(2);

    console.log(pad + 'Process'.cyan.underline + ' ' + 'List'.cyan.underline);

    emptyln();

    if (procs.length === 0) {
        console.log(pad + 'No processes were started.');
    } else {
        procs.forEach(function(proc) {
            var name    = proc.name
              , id      = proc.id + ''
              , label   = util.str.rpad(name, self.nameMaxLen)
              , pid     = pids[name]
              , pidText = util.str.rpad(pid.text, pidlen)[pid.color];

            console.log(pad + id + ' ' + label.yellow + ' ' + pidText);

            if (opts.long) {
                console.log(pad + pad + proc.command.grey);
            }
        });
    }

    emptyln(2);
};

Log.prototype.clientStop = function(proc, status) {
    switch(status) {
        case 'not-found':
            loglv('error', 'A process with the specified id or name was not found.', 2);
            break;
        case 'not-running':
            loglv('warn', 'Process ' + proc.name.blue  + ' is not running.', 2);
            break;
        case 'success':
            loglv('info', 'Process ' + proc.name.blue + ' was sent the kill signal.', 2);
            break;
        default:
            loglv('errorLoud', 'Unknown status.', 2);
    }
};

Log.prototype.clientStart = function(proc, status) {
    switch(status) {
        case 'not-found':
            loglv('error', 'A process with the specified id or name was not found.', 2);
            break;
        case 'not-stopped':
            loglv('warn', 'Process ' + proc.name.blue  + ' is already running.', 2);
            break;
        case 'success':
            loglv('info', 'Attempted to start process ' + proc.name.blue + '.', 2);
            break;
        default:
            loglv('errorLoud', 'Unknown status.', 2);
    }
};

Log.prototype.clientRestart = function(proc, status) {
    switch(status) {
        case 'not-found':
            loglv('error', 'A process with the specified id or name was not found.', 2);
            break;
        case 'success':
            loglv('info', 'Attempted to restart process ' + proc.name.blue + '.', 2);
            break;
        default:
            loglv('errorLoud', 'Unknown status.', 2);
    }
};

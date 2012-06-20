/*
 * command data logger
 */

var util   = require('./util')
  , core   = require('./core')
  , pad    = '   '
  , eyes   = require('eyes')
  , colors = require('colors')
  , codes  = { 
        '2'   : 'missing keyword or command'
      , '126' : 'command cannot execute'
      , '127' : 'command not found'
      , '128' : 'invalid argument to exit'
      , '130' : 'script terminated by user'
    }
  , levels = {
        error     : { text: 'error', label: 'error'.red }
      , errorLoud : { text: 'error', label: 'error'.red.inverse }
      , info      : { text: 'info',  label: 'info'.green }
      , warn      : { text: 'warn',  label: 'warn'.yellow }
    }

  , levelMax = core.maxLen(util.pluck(Object
        .keys(levels)
        .map(function(k) { return levels[k]; }), 'text'))

  , logln = function(label, color, msg) {
        // TODO: don't add end markers for empty lines
        console.log(label[color] + ' ' + msg + ' ' + '¬'[color]);
    }

  , emptyln = function(count) {
        var i = 0, len = count || 1;
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

Log.prototype.write = function(output) {
    var lines = util.exists(output.line) ? [ output.line ] : output.lines
      , toStr = function(items) {
            items = util.isArray(items) ? items : [ items ];
            var parts = items.map(function(item) {
                    return item.str();
                });
            return parts.join(output.separator || '');
        };
    lines.forEach(function(items) {
        console.log(toStr(output.label) + toStr(items));
    });
};

Log.prototype.setNameMaxLen = function(procs) {
    this.nameMaxLen = core.maxLen(util.pluck(procs, 'name'));
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

Log.prototype.ls = function(procs, status, options) {
    switch(status) {
        case core.SERVER_OFF:
            loglv('error', 'No processes were started.', 2);
            break;
        case core.SUCCESS: 
            // TODO: move to a separate function
            //       make pids grey (but keep running status green)
            var self = this
              , opts = options || { long: false }
              , pids = util.toMap(procs
                  , function(p) { return p.name; }
                  , function(p) { 
                        return { 
                            color: p.running ? 'green' : 'magenta'
                          , text : p.running ? ('running (' + p.pid + ')') : 'stopped' };
                    })
              , pidlen = core.maxLen(util.pluck(pids, 'text'));

            emptyln(2);

            console.log(pad + 'Process'.underline + ' ' + 'List'.underline);

            emptyln(1);

            procs.forEach(function(proc) {
                var name    = proc.name
                  , id      = proc.id + ''
                  , label   = util.str.rpad(name, self.nameMaxLen)
                  , pid     = pids[name]
                  , pidText = util.str.rpad(pid.text, pidlen)[pid.color]
                  , outText = proc.off ? 'off'.red : 'on'.green
                  , output  = proc.running ? ' output ' + outText : '';

                console.log(pad + id + ' ' + label.yellow + ' ' + pidText + output);

                if (opts.long) {
                    console.log(pad + pad + proc.command.grey);
                }
            });

            emptyln(2);
            break;
        default:
            loglv('errorLoud', 'Unknown status ' + (status || ''), 2);
    }
};

Log.prototype.clientStopAll = function(status) {
    switch(status) {
        case core.SUCCESS:
            loglv('info', 'Sent the kill signal to all running processes.', 2);
            break;
        default:
            loglv('errorLoud', 'Unknown status ' + (status || ''), 2);
    }
};

Log.prototype.clientStartAll = function(status) {
    switch(status) {
        case core.SUCCESS:
            loglv('info', 'Attempted to start all stopped processes.', 2);
            break;
        default:
            loglv('errorLoud', 'Unknown status ' + (status || ''), 2);
    }
};

Log.prototype.clientRestartAll = function(status) {
    switch(status) {
        case core.SUCCESS:
            loglv('info', 'Attempted to restart all running processes.', 2);
            break;
        default:
            loglv('errorLoud', 'Unknown status ' + (status || ''), 2);
    }
};

Log.prototype.clientOffAll = function(status) {
    switch(status) {
        case core.SUCCESS:
            loglv('info', 'The output of all processes has been turned ' + 'off'.red + '.', 2);
            break;
        default:
            loglv('errorLoud', 'Unknown status ' + (status || ''), 2);
    }
};

Log.prototype.clientOnAll = function(status) {
    switch(status) {
        case core.SUCCESS:
            loglv('info', 'The output of all processes has been turned ' + 'on'.green + '.', 2);
            break;
        default:
            loglv('errorLoud', 'Unknown status ' + (status || ''), 2);
    }
};

Log.prototype.clientStop = function(proc, status) {
    switch(status) {
        case core.SERVER_OFF:
            loglv('error', 'No processes were started.', 2);
            break;
        case core.NOT_FOUND:
            loglv('error', 'A process with the specified id or name was not found.', 2);
            break;
        case core.NOT_RUNNING:
            loglv('warn', 'Process ' + proc.name.blue  + ' is not running.', 2);
            break;
        case core.SUCCESS:
            loglv('info', 'Process ' + proc.name.blue + ' was sent the kill signal.', 2);
            break;
        default:
            loglv('errorLoud', 'Unknown status ' + (status || ''), 2);
    }
};

Log.prototype.clientStart = function(proc, status) {
    switch(status) {
        case core.SERVER_OFF:
            loglv('error', 'No processes were started.', 2);
            break;
        case core.NOT_FOUND:
            loglv('error', 'A process with the specified id or name was not found.', 2);
            break;
        case core.NOT_STOPPED:
            loglv('warn', 'Process ' + proc.name.blue  + ' is already running.', 2);
            break;
        case core.SUCCESS:
            loglv('info', 'Attempted to start process ' + proc.name.blue + '.', 2);
            break;
        default:
            loglv('errorLoud', 'Unknown status ' + (status || ''), 2);
    }
};

Log.prototype.clientRestart = function(proc, status) {
    switch(status) {
        case core.SERVER_OFF:
            loglv('error', 'No processes were started.', 2);
            break;
        case core.NOT_FOUND:
            loglv('error', 'A process with the specified id or name was not found.', 2);
            break;
        case core.SUCCESS:
            loglv('info', 'Attempted to restart process ' + proc.name.blue + '.', 2);
            break;
        default:
            loglv('errorLoud', 'Unknown status ' + (status || ''), 2);
    }
};

Log.prototype.clientOn = function(proc, status) {
    switch(status) {
        case core.SERVER_OFF:
            loglv('error', 'No processes were started.', 2);
            break;
        case core.NOT_FOUND:
            loglv('error', 'A process with the specified id or name was not found.', 2);
            break;
        case core.NOT_OFF:
            loglv('warn', 'The output of process ' + proc.name.blue + ' is already on.', 2);
            break;
        case core.SUCCESS:
            loglv('info', 'The output of process ' + proc.name.blue + ' is now turned ' + 'on'.green + '.', 2);
            break;
        default:
            loglv('errorLoud', 'Unknown status ' + (status || ''), 2);
    }
};

Log.prototype.clientOff = function(proc, status) {
    switch(status) {
        case core.SERVER_OFF:
            loglv('error', 'No processes were started.', 2);
            break;
        case core.NOT_FOUND:
            loglv('error', 'A process with the specified id or name was not found.', 2);
            break;
        case core.NOT_ON:
            loglv('warn', 'The output of process ' + proc.name.blue + ' is already off.', 2);
            break;
        case core.SUCCESS:
            loglv('info', 'The output of process ' + proc.name.blue + ' is now turned ' + 'off'.red + '.', 2);
            break;
        default:
            loglv('errorLoud', 'Unknown status ' + (status || ''), 2);
    }
};

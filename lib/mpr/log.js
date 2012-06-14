/*
 * command data logger
 */

var util   = require('./util')
  , colors = require('colors')
  , codes  = { 
        '1'   : 'general error'
      , '2'   : 'missing keyword or command'
      , '126' : 'command cannot execute'
      , '127' : 'command not found'
      , '128' : 'invalid argument to exit'
      , '130' : 'script terminated by user'
    }
  , maxlen = function(names) {
        return util.max(names.map(function(n) {
            return n.length;
        }));
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
        var l = util.str.trim(line);
        console.log(label[color] + ' ' + l);
    });
};

Log.prototype.err = function(proc, data) {
    var lines = util.str.lines(data).filter(Boolean)
      , name  = proc.name
      , color = proc.color
      , label = util.str.rpad(name, this.nameMaxLen);

    lines.forEach(function(line) {
        var l = util.str.trim(line)
          , e = 'error: '.red;
        console.log(label[color] + ' ' + e + l);
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

Log.prototype.ls = function(procs) {
    var self = this
      , pad  = '    '
      , pids = util.toMap(procs
          , function(p) { return p.name; }
          , function(p) { 
                return { 
                    color: p.running ? 'green' : 'magenta'
                  , text : p.running ? ('running (' + p.pid + ')') : 'stopped' };
            })
      , pidlen = maxlen(util.pluck(pids, 'text'));

    console.log('');
    console.log('');
    console.log(pad + 'Process'.cyan.underline + ' ' + 'List'.cyan.underline);
    console.log('');

    if (procs.length === 0) {
        console.log(pad + 'No processes were started.');
    } else {
        procs.forEach(function(proc) {
            var name    = proc.name
              , id      = proc.id + ''
              , label   = util.str.rpad(name, self.nameMaxLen)
              , pid     = pids[name]
              , pidText = util.str.rpad(pid.text, pidlen)[pid.color]
              , command = proc.command;

            console.log(pad + id + ' ' + label.yellow + ' ' + pidText + ' ' + command);
        });
    }

    console.log('');
    console.log('');
};

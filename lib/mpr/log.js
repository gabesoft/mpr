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
    };


function Log (options) {
    if (!(this instanceof Log)) { return new Log(options); }
    options         = options || {};
    this.nameMaxLen = options.nameMaxLen || 0;
}

module.exports = Log;

Log.prototype.setNameMaxLen = function(len) {
    this.nameMaxLen = len;
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

/*
 * logger for server activity
 */

var util  = require('./util')
  , Log   = require('./log')
  , log   = new Log()
  , core  = require('./core')
  , Text  = require('./text_item')
  , codes = {
        '2'   : 'missing keyword or command'
      , '126' : 'command cannot execute'
      , '127' : 'command not found'
      , '128' : 'invalid argument to exit'
      , '130' : 'script terminated by user'
    };

function ServerLog (options) {
    if (!(this instanceof ServerLog)) { return new ServerLog(options); }
}

module.exports = ServerLog;

ServerLog.prototype.init = function(procs) {
    this.labelLen = core.maxLen(util.pluck(procs, 'name')) + 1;
};

ServerLog.prototype.out = function(proc, data) {
    var lines  = util.str.lines(data).filter(Boolean)
      , output = {
            label: this.makeLabel(proc)
          , lines: lines.map(function(line) {
                var text = util.str.trim(line)
                  , ws   = text.length === 0;
                return [ new Text(text) ];
            })
        };
    log.write(output);
};

ServerLog.prototype.err = function(proc, data) {
    var lines  = util.str.lines(data).filter(Boolean)
      , output = {
            label: this.makeLabel(proc)
          , lines: lines.map(function(line) {
                var text = util.str.trim(line)
                  , ws   = text.length === 0;
                return [
                    new Text(ws ? '' : 'error', 'red')
                  , new Text(ws ? '' : ': ')
                  , new Text(text)
                ];
            })
        };
    log.write(output);
};

ServerLog.prototype.exit = function(proc, exitCode) {
    var hasCode = util.exists(exitCode) && exitCode.length > 0
      , desc    = hasCode ? codes[exitCode] : ''
      , hasDesc = util.exists(desc)
      , code    = hasCode ? (exitCode + (hasDesc ? '(' + desc + ')' : '')) : ''
      , line    = hasCode ? ('exited with code ' + code) : 'exited'
      , output  = {
            label: this.makeLabel(proc)
          , line: [ new Text(line, 'inverse') ]
        };
    log.write(output);
};

ServerLog.prototype.start = function(proc, data) {
    var output = {
            label: this.makeLabel(proc)
          , line: [
                new Text('started', 'green')
              , new Text(': ')
              , new Text(proc.pid + ' ' + proc.command)
            ]
        };
    log.write(output);
};

ServerLog.prototype.makeLabel = function(proc) {
    return new Text(util.str.rpad(proc.name, this.labelLen), proc.color);
};

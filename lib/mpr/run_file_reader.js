/*
 * run processes file reader
 */

var fs   = require('fs')
  , eyes = require('eyes')
  , jmin = require('../vendor/minify.json')
  , util = require('./util');

function RunFileReader (options) {
    if (!(this instanceof RunFileReader)) { return new RunFileReader(options); }
}

module.exports = RunFileReader;

RunFileReader.prototype.parse = function(data) {
    var min = jmin.JSON.minify(data + '');
    return JSON.parse(min);
};

RunFileReader.prototype.read = function(path) {
    var file = fs.readFileSync(path)
      , data = this.parse(file);

    Object.keys(data).forEach(function(name) {
        var proc = data[name]
          , args = [];

        proc.args = proc.args || [];
        proc.args.forEach(function(arg) {
            args = args.concat(arg.split(/\s+/g));
        });

        proc.args = args;
    });

    return data;
};

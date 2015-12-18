/*
 * representation of a text item
 */

var util = require('./util');
var chalk = require('chalk');

function TextItem (text, color) {
    color      = color || [];
    color      = util.isArray(color) ? color : [color];
    this.text  = text || '';
    this.color = color;
}

module.exports = TextItem;

TextItem.prototype.str = function() {
    var out = this.text;
    var chk = null;
    this.color.filter(Boolean).forEach(function(c) {
        chk = chk ? chk[c] : chalk[c];
    });
    return chk ? chk(out) : out;
};

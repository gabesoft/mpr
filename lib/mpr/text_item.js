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
    var chk = chalk.reset;
    this.color.forEach(function(c) {
        chk = (c in chk) ? chk[c].bind(chalk) : chk.reset.bind(chalk);
    });
    return chk(out);
};

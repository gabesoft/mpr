/*
 * representation of a text item
 */

var util   = require('./util');

function TextItem (text, color) {
    color      = color || [];
    color      = util.isArray(color) ? color : [color];
    this.text  = text || '';
    this.color = color;
}

module.exports = TextItem;

TextItem.prototype.str = function() {
    var out = this.text;
    this.color.forEach(function(c) {
        out = out[c];
    });
    return out;
};

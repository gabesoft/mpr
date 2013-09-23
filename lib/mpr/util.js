/*
 * util.js: Utility functions
 */

var util = require('util')
  , _und = require('underscore')
  , _str = require('underscore.string')
  , cont = function(arr, index, end, fn) {
        if (index >= arr.length) {
            if (_und.isFunction(end)) {
                end();
            }
        } else {
            fn(arr[index], function() {
                cont(arr, index + 1, end, fn);
            });
        }
    };

/*
 * Iterates through an array asynchronously passing a continuation on each element.
 * - endfn will be called when there are no more elements in the array
 * - example call
 *   util.cont(arr, endfn, function(item, cont) {
 *     // do something with item
 *     cont();
 *   });
 */
module.exports.cont = function(arr, end, fn) {
    cont(arr, 0, end, fn);
};

/*
 * Returns true if the specified object is not null or undefined.
 */
module.exports.exists = function(obj) {
    return !module.exports.nil(obj);
};

/*
 * Returns true if the specified object is null or undefined.
 */
module.exports.nil = function(obj) {
    return module.exports.isNull(obj) || module.exports.isUndefined(obj);
};

/*
 * Returns a unique numeric value.
 */
module.exports.uniqInt = function() {
    return Math.round(new Date().valueOf() * (1 + Math.random()));
};

/*
 * Returns a unique string value.
 */
module.exports.uniqStr = function() {
    return module.exports.uniqInt() + '';
};

/*
 * Converts the given array into a hash map where the keys are
 * the items of the array (converted to string with the specified function)
 * and the values are given by the toVal function or set to true.
 */
module.exports.toMap = function(arr, toStrFn, toValFn, addFn) {
    var hash  = {}
      , obj   = null
      , key   = null
      , i     = 0
      , toStr = _und.isFunction(toStrFn) ? toStrFn : function(obj) { return obj; }
      , toVal = _und.isFunction(toValFn) ? toValFn : function() { return true; }
      , add   = _und.isFunction(addFn)   ? addFn   : function() { return true; };

    for (i = 0; i < arr.length; i += 1) {
        obj = arr[i];
        if (add(obj)) {
            key       = toStr(obj);
            hash[key] = toVal(obj);
        }
    }

    return hash;
};

/*
 * Returns a given number of elements from an array and skips over the remainder.
 */
module.exports.take = function(obj, count) {
    var nil     = module.exports.nil,
        isArray = module.exports.isArray;

    if (nil(obj) || !isArray(obj)) { return []; }

    return obj.slice(0, count);
};

/*
 * Skips over a given number o elements in an array and returns the remainder.
 */
module.exports.skip = function(obj, count) {
    var nil     = module.exports.nil,
        isArray = module.exports.isArray;

    if (nil(obj) || !isArray(obj)) { return []; }

    return obj.slice(count, obj.length);
};

/*
 * Maps a list of objects by fetching several properties.
 */
module.exports.pluck2 = function(/* obj, keys */) {
    if (arguments.length === 0) { return []; }

    var obj  = arguments[0]
      , i    = 0
      , len  = arguments.length
      , keys = [];

    for (i = 1; i < len; i += 1) {
        keys.push(arguments[i]);
    }

    return obj.map(function(o) {
        return keys.map(function(k) {
            return o[k];
        });
    });
};

/*
 * Returns a sorted copy of list, ranked in ascending order by the results of
 * running each value through iterator. Iterator may also be the string name
 * of the property to sort by (eg. date).
 */
module.exports.sortBy = function(obj, fieldOrIterator, context) {
    var iterator = _und.isFunction(fieldOrIterator)
            ? fieldOrIterator
            : function(obj) { return obj[fieldOrIterator]; };
    return _und.sortBy(obj, iterator, context);
};


/*
 * Call the specified function, if possible, with the given arguments.
 */
module.exports.call = function(/*fn, args*/) {
    if (arguments.length === 0) { return; }

    var fn   = arguments[0]
      , args = []
      , i    = 0
      , len  = arguments.length;

    for (i = 1; i < len; i += 1) {
        args.push(arguments[i]);
    }

    if (module.exports.isFunction(fn)) {
        fn.apply(this, args);
    }
};

_und.mixin({
    take  : module.exports.take
  , skip  : module.exports.skip
  , pluck2: module.exports.pluck2
});

/*
 * base util functions
 */
module.exports.format   = util.format;
module.exports.print    = util.print;
module.exports.puts     = util.puts;
module.exports.debug    = util.debug;
module.exports.error    = util.error;
module.exports.inspect  = util.inspect;
module.exports.isArray  = util.isArray;
module.exports.isRegExp = util.isRegExp;
module.exports.isDate   = util.isDate;
module.exports.isError  = util.isError;
module.exports.log      = util.log;
module.exports.exec     = util.exec;
module.exports.pump     = util.pump;
module.exports.inherits = util.inherits;

/*
 * underscore core
 */
module.exports.each        = _und.each;
module.exports.map         = _und.map;
module.exports.reduce      = _und.reduce;
module.exports.foldl       = _und.reduce;
module.exports.reduceRight = _und.reduceRight;
module.exports.foldr       = _und.reduceRight;
module.exports.find        = _und.find;
module.exports.filter      = _und.filter;
module.exports.reject      = _und.reject;
module.exports.all         = _und.all;
module.exports.any         = _und.any;
module.exports.include     = _und.include;
module.exports.invoke      = _und.invoke;
module.exports.pluck       = _und.pluck;
module.exports.max         = _und.max;
module.exports.min         = _und.min;
module.exports.groupBy     = _und.groupBy;
module.exports.sortedIndex = _und.sortedIndex;
module.exports.shuffle     = _und.shuffle;
module.exports.toArray     = _und.toArray;
module.exports.size        = _und.size;

/*
 * underscore arrays
 */
module.exports.first        = _und.first;
module.exports.initial      = _und.initial;
module.exports.last         = _und.last;
module.exports.rest         = _und.rest;
module.exports.compact      = _und.compact;
module.exports.flatten      = _und.flatten;
module.exports.without      = _und.without;
module.exports.union        = _und.union;
module.exports.intersection = _und.intersection;
module.exports.difference   = _und.difference;
module.exports.uniq         = _und.uniq;
module.exports.zip          = _und.zip;
module.exports.indexOf      = _und.indexOf;
module.exports.lastIndexOf  = _und.lastIndexOf;
module.exports.range        = _und.range;

/*
 * underscore functions
 */
module.exports.bind     = _und.bind;
module.exports.bindAll  = _und.bindAll;
module.exports.memoize  = _und.memoize;
module.exports.delay    = _und.delay;
module.exports.defer    = _und.defer;
module.exports.throttle = _und.throttle;
module.exports.debounce = _und.debounce;
module.exports.once     = _und.once;
module.exports.after    = _und.after;
module.exports.wrap     = _und.wrap;
module.exports.compose  = _und.compose;

/*
 * underscore objects
 */
module.exports.keys        = _und.keys;
module.exports.values      = _und.values;
module.exports.functions   = _und.functions;
module.exports.extend      = _und.extend;
module.exports.defaults    = _und.defaults;
module.exports.clone       = _und.clone;
module.exports.tap         = _und.tap;
module.exports.has         = _und.has;
module.exports.isEqual     = _und.isEqual;
module.exports.isEmpty     = _und.isEmpty;
module.exports.isElement   = _und.isElement;
module.exports.isArguments = _und.isArguments;
module.exports.isFunction  = _und.isFunction;
module.exports.isString    = _und.isString;
module.exports.isNumber    = _und.isNumber;
module.exports.isBoolean   = _und.isBoolean;
module.exports.isNaN       = _und.isNaN;
module.exports.isNull      = _und.isNull;
module.exports.isObject    = _und.isObject;
module.exports.isUndefined = _und.isUndefined;

/*
 * underscore utility
 */
module.exports.noConflict = _und.noConflict;
module.exports.identity   = _und.identity;
module.exports.times      = _und.times;
module.exports.mixin      = _und.mixin;
module.exports.uniqueId   = _und.uniqueId;
module.exports.escape     = _und.escape;
module.exports.template   = _und.template;

/*
 * underscore chaining
 */
module.exports.chain = _und.chain;
module.exports.value = _und.value;

/*
 * string functions
 */
module.exports.str = {
    isBlank: _str.isBlank
  , capitalize: _str.capitalize
  , stripTags: _str.stripTags
  , chop: _str.chop
  , clean: _str.clean
  , count: _str.count
  , chars: _str.chars
  , escapeHTML: _str.escapeHTML
  , unescapeHTML: _str.unescapeHTML
  , escapeRegExp: _str.escapeRegExp
  , insert: _str.insert
  , include: _str.include
  , join: _str.join
  , lines: _str.lines
  , reverse: _str.reverse
  , splice: _str.splice
  , startsWith: _str.startsWith
  , endsWith: _str.endsWith
  , succ: _str.succ
  , titleize: _str.titleize
  , camelize: _str.camelize
  , underscored: _str.underscored
  , dasherize: _str.dasherize
  , classify: _str.classify
  , humanize: _str.humanize
  , trim: _str.trim
  , ltrim: _str.ltrim
  , rtrim: _str.rtrim
  , truncate: _str.truncate
  , prune: _str.prune
  , words: _str.words
  , pad: _str.pad
  , lpad: _str.lpad
  , rpad: _str.rpad
  , lrpad: _str.lrpad
  , sprintf: _str.sprintf
  , vsprintf: _str.vsprintf
  , toNumber: _str.toNumber
  , strRight: _str.strRight
  , strRightBack: _str.strRightBack
  , strLeft: _str.strLeft
  , strLeftBack: _str.strLeftBack
  , toSentence: _str.toSentence
  , slugify: _str.slugify
  , exports: _str.exports
  , repeat: _str.repeat
  , strip: _str.strip
  , lstrip: _str.lstrip
  , rstrip: _str.rstrip
  , center: _str.center
  , rjust: _str.rjust
  , ljust: _str.ljust
  , contains: _str.contains

  /*
   * Converts a string value to boolean.
   * String values of 'true' and 'TRUE' get converted to true, all others to false.
   * Non-string values don't get converted.
   */
  , toBoolean: function(value) {
        if (_und.isString(value)) {
            return value === 'true' || value === 'TRUE';
        } else {
            return value;
        }
    }
};

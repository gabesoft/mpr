/*
 * config.js: Config file utility
 */

var fs    = require('fs')
  , _     = require('underscore')
  , path  = require('path')
  , name  = '.mprrc.json'
  , paths = [ path.join(process.env.HOME, name), path.join(process.cwd(), name) ];

exports.read = function (cb) {
    var config = {};
    paths.forEach(function (p) {
        if (fs.existsSync(p)) {
          _.extend(config, require(p));
        }
    });
    cb(null, config);
};

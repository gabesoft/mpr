var should = require('should')
  , eyes   = require('eyes')
  , util   = require('../lib/mpr/util')
  , fs     = require('fs')
  , Reader = require('../lib/mpr/run_file_reader')
  , sut    = null;

describe('run file', function() {
    beforeEach(function() {
        sut = new Reader();
    });

    it('should read all processes from run file', function(done) {
        var procs = sut.read(__dirname + '/support/procs.json');
        Object.keys(procs).length.should.equal(4);
        done();
    });

    it('should read json files with comments', function(done) {
        var procs = sut.read(__dirname + '/support/procs_with_comments.json');
        Object.keys(procs).length.should.equal(4);
        done();
    });
});

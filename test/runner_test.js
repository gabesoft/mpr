var should = require('should')
  , eyes   = require('eyes')
  , util   = require('../lib/mpr/util')
  , fs     = require('fs')
  , Runner = require('../lib/mpr/runner')
  , sut    = null;

describe('runner', function() {
    beforeEach(function() {
        sut = new Runner();
    });

    it('should load processes from file', function(done) {
        var file  = fs.readFileSync(__dirname + '/support/procs.json')
          , procs = JSON.parse(file)
          , list  = null;

        sut.load(procs);

        list = sut.list();
        list.length.should.equal(4);

        done();
    });
});

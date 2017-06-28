var parser = require('../');
var assert = require('assert');

var EJSON = require('mongodb-extended-json');
var bson = require('bson');
var debug = require('debug')('mongodb-query-parser:test');

function convert(string) {
  var res = parser.parseFilter(string);
  var ret = EJSON.serialize(res);
  debug('converted', { input: string, parsed: res, encoded: ret });
  return ret;
}

describe('mongodb-query-parser', function() {
  describe('filter', function() {
    context('when no new keyword is provided', function() {
      it('returns the filter', function() {
        var res = parser.parseFilter(
          '{_id: ObjectId("58c33a794d08b991e3648fd2")}'
        );
        assert.deepEqual(res, {
          _id: new bson.ObjectId('58c33a794d08b991e3648fd2')
        });
      });
    });

    context('when a new keyword is provided', function() {
      it('returns the filter', function() {
        var res = parser.parseFilter(
          '{_id: new ObjectId("58c33a794d08b991e3648fd2")}'
        );
        assert.deepEqual(res, {
          _id: new bson.ObjectId('58c33a794d08b991e3648fd2')
        });
      });
    });

    describe('shell helpers', function() {
      it('should support Date', function() {
        assert.deepEqual(convert('Date("2017-01-01T12:35:31.000Z")'), {
          $date: '2017-01-01T12:35:31.000Z'
        });
      });

      it('should support new Date', function() {
        assert.deepEqual(convert('new Date("2017-01-01T12:35:31.000Z")'), {
          $date: '2017-01-01T12:35:31.000Z'
        });
      });

      it('should support ISODate', function() {
        assert.deepEqual(convert('ISODate("2017-01-01T12:35:31.000Z")'), {
          $date: '2017-01-01T12:35:31.000Z'
        });
      });

      it('should support new ISODate', function() {
        assert.deepEqual(convert('new ISODate("2017-01-01T12:35:31.000Z")'), {
          $date: '2017-01-01T12:35:31.000Z'
        });
      });

      it('should support Timestamp', function() {
        assert.deepEqual(convert('Timestamp(15, 31)'), {
          $timestamp: { t: 15, i: 31 }
        });
      });

      it('should support new Timestamp', function() {
        assert.deepEqual(convert('new Timestamp(15, 31)'), {
          $timestamp: { t: 15, i: 31 }
        });
      });

      it('should support inline regex', function() {
        assert.deepEqual(convert('/some.*regex+/i'), {
          $regex: 'some.*regex+',
          $options: 'i'
        });
      });

      it('should support RegExp', function() {
        assert.deepEqual(convert("RegExp('some.*regex+', 'i')"), {
          $regex: 'some.*regex+',
          $options: 'i'
        });
      });

      it('should support new RegExp', function() {
        assert.deepEqual(convert("new RegExp('some.*regex+', 'i')"), {
          $regex: 'some.*regex+',
          $options: 'i'
        });
      });

      it('should support ObjectId', function() {
        assert.deepEqual(convert('ObjectId("58c33a794d08b991e3648fd2")'), {
          $oid: '58c33a794d08b991e3648fd2'
        });
      });

      it('should support new ObjectId', function() {
        assert.deepEqual(convert('new ObjectId("58c33a794d08b991e3648fd2")'), {
          $oid: '58c33a794d08b991e3648fd2'
        });
      });

      it('should support ObjectID', function() {
        assert.deepEqual(convert('ObjectID("58c33a794d08b991e3648fd2")'), {
          $oid: '58c33a794d08b991e3648fd2'
        });
      });

      it('should support new ObjectID', function() {
        assert.deepEqual(convert('new ObjectID("58c33a794d08b991e3648fd2")'), {
          $oid: '58c33a794d08b991e3648fd2'
        });
      });

      it('should support NumberLong', function() {
        assert.deepEqual(convert('NumberLong("1234567890")'), {
          $numberLong: '1234567890'
        });
      });

      it('should support new NumberLong', function() {
        assert.deepEqual(convert('new NumberLong("1234567890")'), {
          $numberLong: '1234567890'
        });
      });

      it('should support NumberDecimal', function() {
        assert.deepEqual(convert('NumberDecimal("10.99")'), {
          $numberDecimal: '10.99'
        });
      });

      it('should support new NumberDecimal', function() {
        assert.deepEqual(convert('new NumberDecimal("10.99")'), {
          $numberDecimal: '10.99'
        });
      });

      it('should support MixKey', function() {
        assert.deepEqual(convert('MinKey()'), { $minKey: 1 });
      });

      it('should support MaxKey', function() {
        assert.deepEqual(convert('MaxKey()'), { $maxKey: 1 });
      });
    });
  });

  describe('stringify', function() {
    it('should work', function() {
      var res = parser.parseFilter(
        '{_id: ObjectId("58c33a794d08b991e3648fd2")}'
      );
      var stringified = parser.stringify(res);
      assert.equal(stringified, "{_id: ObjectId('58c33a794d08b991e3648fd2')}");
    });
    it('should not added extra space when nesting', function() {
      assert.equal(
        parser.stringify({ a: { $exists: true } }),
        '{a: {$exists: true}}'
      );
    });
  });

  describe('project', function() {
    it('should default to null', function() {
      assert.equal(parser.parseProject(''), null);
      assert.equal(parser.parseProject('      '), null);
      assert.equal(parser.parseProject('{}'), null);
    });
    it('should parse valid project strings', function() {
      assert.deepEqual(parser.parseProject('{_id: 1}'), { _id: 1 });
      assert.deepEqual(parser.parseProject('{_id: -1}'), { _id: -1 });
    });
    it('should detect invalid project strings', function() {
      assert.equal(parser.isProjectValid('{_id: "a"}'), false);
      assert.equal(parser.isProjectValid('{_id: "1"}'), false);
      assert.equal(parser.isProjectValid('{grabage'), false);
    });
  });

  describe('sort', function() {
    it('should default to null', function() {
      assert.equal(parser.parseSort(''), null);
      assert.equal(parser.parseSort('      '), null);
      assert.equal(parser.parseSort('{}'), null);
    });
    it('should work', function() {
      assert.deepEqual(parser.parseSort('{_id: 1}'), { _id: 1 });
      assert.deepEqual(parser.parseSort('{_id: -1}'), { _id: -1 });

      assert.equal(parser.isSortValid('{_id: "a"}'), false);
      assert.equal(parser.isSortValid('{_id: "1"}'), false);
      assert.equal(parser.isSortValid('{grabage'), false);
    });
  });

  describe('skip', function() {
    it('should work', function() {
      assert.equal(parser.isSkipValid('{skip: "a"}'), false);
      assert.equal(parser.isSkipValid('0'), 0);
      assert.equal(parser.isSkipValid(1), 1);
      assert.equal(parser.isSkipValid('   '), parser.DEFAULT_SKIP);
    });
  });

  describe('limit', function() {
    it('should work', function() {
      assert.equal(parser.isLimitValid('{limit: "a"}'), false);
      assert.equal(parser.isLimitValid('0'), 0);
      assert.equal(parser.isLimitValid(1), 1);
      assert.equal(parser.isLimitValid('   '), parser.DEFAULT_LIMIT);
    });
  });
});

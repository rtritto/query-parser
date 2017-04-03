var parse = require('../');
var assert = require('assert');

var EJSON = require('mongodb-extended-json');
var bson = require('bson');
var debug = require('debug')('mongodb-query-parser:test');

function convert(string) {
  var res = parse(string);
  var ret = EJSON.serialize(res);
  debug('converted', { input: string, parsed: res, encoded: ret });
  return ret;
}

describe('mongodb-query-parser', function() {
  describe('js', function() {
    describe('parse', function() {
      it('should work', function() {
        var res = parse('{_id: ObjectId("58c33a794d08b991e3648fd2")}');
        assert.deepEqual(res, {
          _id: new bson.ObjectId('58c33a794d08b991e3648fd2')
        });
      });

      describe('shell helpers', function() {
        it('should support Date', function() {
          assert.deepEqual(convert('Date("2017-01-01T12:35:31.000Z")'), {
            $date: '2017-01-01T12:35:31.000Z'
          });
        });

        it('should support ISODate', function() {
          assert.deepEqual(convert('ISODate("2017-01-01T12:35:31.000Z")'), {
            $date: '2017-01-01T12:35:31.000Z'
          });
        });

        it('should support Timestamp', function() {
          assert.deepEqual(convert('Timestamp(15, 31)'), {
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

        it('should support ObjectID', function() {
          assert.deepEqual(convert('ObjectID("58c33a794d08b991e3648fd2")'), {
            $oid: '58c33a794d08b991e3648fd2'
          });
        });
        it('should support NumberLong', function() {
          assert.deepEqual(convert('NumberLong("1234567890")'), {
            $numberLong: '1234567890'
          });
        });

        it('should support NumberDecimal', function() {
          assert.deepEqual(convert('NumberDecimal("10.99")'), {
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
        var res = parse('{_id: ObjectId("58c33a794d08b991e3648fd2")}');
        var stringified = parse.toJavascriptString(res);
        debug('stringified', { res: res, stringified: stringified });
      });
    });
  });
});

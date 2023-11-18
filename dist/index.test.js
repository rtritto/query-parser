"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const sinon_1 = __importDefault(require("sinon"));
const bson_1 = __importDefault(require("bson"));
const debug_1 = __importDefault(require("debug"));
const index_1 = require("./index");
const debug = (0, debug_1.default)('mongodb-query-parser:test');
function convert(string) {
    const res = (0, index_1.parseFilter)(string);
    const ret = bson_1.default.EJSON.serialize(res, { legacy: true, relaxed: false });
    debug('converted', { input: string, parsed: res, encoded: ret });
    return ret;
}
describe('mongodb-query-parser', function () {
    describe('filter', function () {
        context('when no new keyword is provided', function () {
            it('returns the filter', function () {
                const res = (0, index_1.parseFilter)('{_id: ObjectId("58c33a794d08b991e3648fd2")}');
                assert_1.default.deepEqual(res, {
                    _id: new bson_1.default.ObjectId('58c33a794d08b991e3648fd2'),
                });
            });
        });
        context('when a new keyword is provided', function () {
            it('returns the filter', function () {
                const res = (0, index_1.parseFilter)('{_id: new ObjectId("58c33a794d08b991e3648fd2")}');
                assert_1.default.deepEqual(res, {
                    _id: new bson_1.default.ObjectId('58c33a794d08b991e3648fd2'),
                });
            });
        });
        describe('shell helpers', function () {
            it('should support Code', function () {
                assert_1.default.deepEqual(convert('Code("return true", {})'), {
                    $code: 'return true',
                    $scope: {},
                });
            });
            it('should support new Date', function () {
                assert_1.default.deepEqual(convert('new Date("2017-01-01T12:35:31.123Z")'), {
                    $date: '2017-01-01T12:35:31.123Z',
                });
            });
            it('should support new Date (0 ms)', function () {
                assert_1.default.deepEqual(convert('new Date("2017-01-01T12:35:31.000Z")'), {
                    $date: '2017-01-01T12:35:31Z',
                });
            });
            it('should support ISODate', function () {
                assert_1.default.deepEqual(convert('ISODate("2017-01-01T12:35:31.123Z")'), {
                    $date: '2017-01-01T12:35:31.123Z',
                });
            });
            it('should support ISODate (0 ms)', function () {
                assert_1.default.deepEqual(convert('ISODate("2017-01-01T12:35:31.000Z")'), {
                    $date: '2017-01-01T12:35:31Z',
                });
            });
            it('should support new ISODate', function () {
                assert_1.default.deepEqual(convert('new ISODate("2017-01-01T12:35:31.123Z")'), {
                    $date: '2017-01-01T12:35:31.123Z',
                });
            });
            it('should support new ISODate (0 ms)', function () {
                assert_1.default.deepEqual(convert('new ISODate("2017-01-01T12:35:31.000Z")'), {
                    $date: '2017-01-01T12:35:31Z',
                });
            });
            it('should support BinData', function () {
                assert_1.default.deepEqual(convert(`new BinData(${bson_1.default.Binary.SUBTYPE_BYTE_ARRAY}, "OyQRAeK7QlWMr0E2xWapYg==")`), {
                    $binary: 'OyQRAeK7QlWMr0E2xWapYg==',
                    $type: `0${bson_1.default.Binary.SUBTYPE_BYTE_ARRAY}`,
                });
            });
            it('should support UUID', function () {
                assert_1.default.deepEqual(convert('UUID("3b241101-e2bb-4255-8caf-4136c566a962")'), {
                    $binary: 'OyQRAeK7QlWMr0E2xWapYg==',
                    $type: `0${bson_1.default.Binary.SUBTYPE_UUID}`,
                });
            });
            it('should support functions', function () {
                assert_1.default.deepEqual(convert('{$match: () => true}'), {
                    $match: '() => true',
                });
                assert_1.default.deepEqual(convert(`{
            $expr: {
              $function: {
                body: function(name) { return hex_md5(name) == "15b0a220baa16331e8d80e15367677ad"; },
                args: [ "$name" ],
                lang: "js"
              }
            }
          }`), {
                    $expr: {
                        $function: {
                            body: 'function(name) { return hex_md5(name) == "15b0a220baa16331e8d80e15367677ad"; }',
                            args: ['$name'],
                            lang: 'js',
                        },
                    },
                });
                assert_1.default.deepEqual(convert('{$match: function() { return this.x === 2; }}'), {
                    $match: 'function() { return this.x === 2; }',
                });
            });
            context('for Date() and ISODate() without argument', function () {
                // mock a specific timestamp with sinon.useFakeTimers
                const now = 1533789516225;
                const nowStr = '2018-08-09T04:38:36.225Z';
                let clock;
                beforeEach(function () {
                    clock = sinon_1.default.useFakeTimers(now);
                });
                afterEach(function () {
                    clock.restore();
                });
                it('should support new Date', function () {
                    assert_1.default.deepEqual(convert('new Date()'), {
                        $date: nowStr,
                    });
                });
                it('should support ISODate', function () {
                    assert_1.default.deepEqual(convert('ISODate()'), {
                        $date: nowStr,
                    });
                });
                it('should support new ISODate', function () {
                    assert_1.default.deepEqual(convert('new ISODate()'), {
                        $date: nowStr,
                    });
                });
            });
            it('should support Timestamp', function () {
                assert_1.default.deepEqual(convert('{t: Timestamp(0, 0)}'), {
                    t: { $timestamp: { i: 0, t: 0 } },
                });
            });
            it('should support new Timestamp', function () {
                assert_1.default.deepEqual(convert('{t: new Timestamp(0, 0)}'), {
                    t: { $timestamp: { i: 0, t: 0 } },
                });
            });
            it('should support inline regex', function () {
                assert_1.default.deepEqual(convert('/some.*regex+/i'), {
                    $regex: 'some.*regex+',
                    $options: 'i',
                });
            });
            it('should support RegExp', function () {
                assert_1.default.deepEqual(convert("RegExp('some.*regex+', 'i')"), {
                    $regex: 'some.*regex+',
                    $options: 'i',
                });
            });
            it('should support new RegExp', function () {
                assert_1.default.deepEqual(convert("new RegExp('some.*regex+', 'i')"), {
                    $regex: 'some.*regex+',
                    $options: 'i',
                });
            });
            it('should support ObjectId', function () {
                assert_1.default.deepEqual(convert('ObjectId("58c33a794d08b991e3648fd2")'), {
                    $oid: '58c33a794d08b991e3648fd2',
                });
            });
            it('should support new ObjectId', function () {
                assert_1.default.deepEqual(convert('new ObjectId("58c33a794d08b991e3648fd2")'), {
                    $oid: '58c33a794d08b991e3648fd2',
                });
            });
            it('should support ObjectID', function () {
                assert_1.default.deepEqual(convert('ObjectID("58c33a794d08b991e3648fd2")'), {
                    $oid: '58c33a794d08b991e3648fd2',
                });
            });
            it('should support new ObjectID', function () {
                assert_1.default.deepEqual(convert('new ObjectID("58c33a794d08b991e3648fd2")'), {
                    $oid: '58c33a794d08b991e3648fd2',
                });
            });
            it('should support NumberLong', function () {
                assert_1.default.deepEqual(convert('NumberLong("1234567890")'), {
                    $numberLong: '1234567890',
                });
            });
            it('should support NumberLong > MAX_SAFE_INTEGER', function () {
                assert_1.default.deepEqual(convert('NumberLong("345678654321234552")'), {
                    $numberLong: '345678654321234552',
                });
            });
            it('should support new NumberLong', function () {
                assert_1.default.deepEqual(convert('new NumberLong("1234567890")'), {
                    $numberLong: '1234567890',
                });
            });
            it('should support NumberInt', function () {
                assert_1.default.deepEqual(convert('NumberInt("1234567890")'), {
                    $numberInt: '1234567890',
                });
            });
            it('should support NumberInt with number', function () {
                assert_1.default.deepEqual(convert('NumberInt(1234567890)'), {
                    $numberInt: '1234567890',
                });
            });
            it('should support NumberDecimal', function () {
                assert_1.default.deepEqual(convert('NumberDecimal("10.99")'), {
                    $numberDecimal: '10.99',
                });
            });
            it('should support new NumberDecimal', function () {
                assert_1.default.deepEqual(convert('new NumberDecimal("10.99")'), {
                    $numberDecimal: '10.99',
                });
            });
            it('should support MixKey', function () {
                assert_1.default.deepEqual(convert('MinKey()'), { $minKey: 1 });
            });
            it('should support MaxKey', function () {
                assert_1.default.deepEqual(convert('MaxKey()'), { $maxKey: 1 });
            });
        });
    });
    describe('isFilterValid', function () {
        context('when the string contains a NumberLong', function () {
            const query = '{value: NumberLong(1)}';
            const parsed = (0, index_1.isFilterValid)(query);
            it('returns the bson long value', function () {
                assert_1.default.equal(parsed.value.toNumber(), 1);
            });
        });
        context('when turning off validation', function () {
            context('when the query is a valid object', function () {
                const query = '{value: NumberLong(1)}';
                const parsed = (0, index_1.isFilterValid)(query);
                it('returns truthy', function () {
                    assert_1.default.equal(parsed.value.toNumber(), 1);
                });
            });
            context('when the query is not a valid object', function () {
                const query = '{value: NumberLong(1)';
                const parsed = (0, index_1.isFilterValid)(query);
                it('returns false', function () {
                    assert_1.default.equal(parsed, false);
                });
            });
        });
    });
    describe('stringify', function () {
        it('should work', function () {
            const res = (0, index_1.parseFilter)('{_id: ObjectId("58c33a794d08b991e3648fd2")}');
            const stringified = (0, index_1.stringify)(res);
            assert_1.default.equal(stringified, "{_id: ObjectId('58c33a794d08b991e3648fd2')}");
        });
        it('should not added extra space when nesting', function () {
            assert_1.default.equal((0, index_1.stringify)({ a: { $exists: true } }), '{a: {$exists: true}}');
        });
        context('when providing a long', function () {
            it('correctly converts to NumberLong', function () {
                const stringified = (0, index_1.stringify)({ test: bson_1.default.Long.fromNumber(5) });
                assert_1.default.equal(stringified, '{test: NumberLong(5)}');
            });
        });
        context('when providing a decimal128', function () {
            it('correctly converts to NumberDecimal', function () {
                const stringified = (0, index_1.stringify)({
                    test: bson_1.default.Decimal128.fromString('5.5'),
                });
                assert_1.default.equal(stringified, "{test: NumberDecimal('5.5')}");
            });
        });
        context('when providing an int32', function () {
            it('correctly converts to Int32', function () {
                const stringified = (0, index_1.stringify)({
                    test: new bson_1.default.Int32(123),
                });
                assert_1.default.equal(stringified, "{test: NumberInt('123')}");
            });
        });
        context('when providing a Double', function () {
            it('correctly converts to Double', function () {
                const stringified = (0, index_1.stringify)({
                    test: new bson_1.default.Double(0.8),
                });
                assert_1.default.equal(stringified, "{test: Double('0.8')}");
            });
        });
        context('when providing a geo query', function () {
            const query = {
                coordinates: {
                    $geoWithin: {
                        $centerSphere: [[-79, 28], 0.04],
                    },
                },
            };
            it('correctly replaces nested tabs with single spaces', function () {
                const stringified = (0, index_1.stringify)(query);
                assert_1.default.equal(stringified, '{coordinates: {$geoWithin: { $centerSphere: [ [ -79, 28 ], 0.04 ]}}}');
            });
        });
        context('when providing a Date', function () {
            it('correctly converts to an ISODate', function () {
                const res = (0, index_1.parseFilter)("{test: new Date('2017-01-01T12:35:31.000Z')}");
                const stringified = (0, index_1.stringify)(res);
                assert_1.default.equal(stringified, "{test: ISODate('2017-01-01T12:35:31.000Z')}");
            });
        });
        context('when providing an ISODate', function () {
            it('correctly converts to an ISODate', function () {
                const res = (0, index_1.parseFilter)("{test: ISODate('2017-01-01T12:35:31.000Z')}");
                const stringified = (0, index_1.stringify)(res);
                assert_1.default.equal(stringified, "{test: ISODate('2017-01-01T12:35:31.000Z')}");
            });
        });
        context('when providing a DBRef with (collection, oid)', function () {
            it('correctly converts to a DBRef', function () {
                const res = (0, index_1.parseFilter)("{dbref: DBRef('col', 1)}");
                const stringified = (0, index_1.stringify)(res);
                assert_1.default.equal(stringified, "{dbref: DBRef('col', '1')}");
            });
        });
        context('when providing a DBRef with (db.collection, oid)', function () {
            it('correctly converts to a DBRef', function () {
                const res = (0, index_1.parseFilter)("{dbref: DBRef('db.col', 1)}");
                const stringified = (0, index_1.stringify)(res);
                assert_1.default.equal(stringified, "{dbref: DBRef('col', '1', 'db')}");
            });
        });
        context('when providing a DBRef with (collection, oid, db)', function () {
            it('correctly converts to a DBRef', function () {
                const res = (0, index_1.parseFilter)("{dbref: DBRef('col', 1, 'db')}");
                const stringified = (0, index_1.stringify)(res);
                assert_1.default.equal(stringified, "{dbref: DBRef('col', '1', 'db')}");
            });
        });
        context('when provided a RegExp', function () {
            it('correctly formats the options', function () {
                const res = (0, index_1.parseFilter)('{name: /foo/i}');
                const stringified = (0, index_1.stringify)(res);
                assert_1.default.equal(stringified, '{name: RegExp("foo", \'i\')}');
            });
            it('escapes quotes', function () {
                const res = (0, index_1.parseFilter)("{name: /'/}");
                const stringified = (0, index_1.stringify)(res);
                assert_1.default.equal(stringified, '{name: RegExp("\'")}');
            });
        });
        context('when provided a Binary', function () {
            it('should support BinData', function () {
                const res = (0, index_1.parseFilter)(`{name: new BinData(${bson_1.default.Binary.SUBTYPE_BYTE_ARRAY}, "OyQRAeK7QlWMr0E2xWapYg==")}`);
                const stringified = (0, index_1.stringify)(res);
                assert_1.default.equal(stringified, `{name: BinData(${bson_1.default.Binary.SUBTYPE_BYTE_ARRAY}, 'OyQRAeK7QlWMr0E2xWapYg==')}`);
            });
            it('should support UUID', function () {
                const res = (0, index_1.parseFilter)('{name: UUID("3b241101-e2bb-4255-8caf-4136c566a962")}');
                const stringified = (0, index_1.stringify)(res);
                assert_1.default.equal(stringified, "{name: UUID('3b241101-e2bb-4255-8caf-4136c566a962')}");
            });
        });
    });
    describe('project', function () {
        it('should default to null', function () {
            assert_1.default.equal((0, index_1.parseProject)(''), null);
            assert_1.default.equal((0, index_1.parseProject)('      '), null);
            assert_1.default.equal((0, index_1.parseProject)('{}'), null);
        });
        it('should parse valid project strings', function () {
            assert_1.default.deepEqual((0, index_1.parseProject)('{_id: 1}'), { _id: 1 });
            assert_1.default.deepEqual((0, index_1.parseProject)('{_id: -1}'), { _id: -1 });
            assert_1.default.deepEqual((0, index_1.parseProject)('{comments: { $slice: -1 }}'), {
                comments: { $slice: -1 },
            });
        });
        it('should allow any project strings', function () {
            assert_1.default.deepEqual((0, index_1.isProjectValid)('{_id: "a"}'), { _id: 'a' });
            assert_1.default.deepEqual((0, index_1.isProjectValid)('{_id: "1"}'), { _id: '1' });
        });
        it('should reject broken project strings', function () {
            assert_1.default.equal((0, index_1.isProjectValid)('{grabage'), false);
        });
        it('should reject non object project values', function () {
            assert_1.default.equal((0, index_1.isProjectValid)('true'), false);
            assert_1.default.equal((0, index_1.isProjectValid)('123'), false);
            assert_1.default.equal((0, index_1.isProjectValid)('"something"'), false);
            assert_1.default.equal((0, index_1.isProjectValid)('null'), false);
        });
    });
    describe('collation', function () {
        it('should default to null', function () {
            assert_1.default.equal((0, index_1.parseCollation)(''), null);
            assert_1.default.equal((0, index_1.parseCollation)('      '), null);
            assert_1.default.equal((0, index_1.parseCollation)('{}'), null);
        });
        it('should parse valid collation strings', function () {
            assert_1.default.deepEqual((0, index_1.parseCollation)('{locale: "simple"}'), {
                locale: 'simple',
            });
            assert_1.default.deepEqual((0, index_1.parseCollation)('{locale: "en_US", strength: 1}'), {
                locale: 'en_US',
                strength: 1,
            });
        });
        it('should detect invalid collation strings', function () {
            assert_1.default.equal((0, index_1.isCollationValid)('{invalid: "simple"}'), false);
            assert_1.default.equal((0, index_1.isCollationValid)('{locale: ""}'), false);
            assert_1.default.equal((0, index_1.isCollationValid)('{locale: "invalid"}'), false);
        });
    });
    describe('sort', function () {
        it('should default to null', function () {
            assert_1.default.equal((0, index_1.parseSort)(''), null);
            assert_1.default.equal((0, index_1.parseSort)('      '), null);
            assert_1.default.equal((0, index_1.parseSort)('{}'), null);
        });
        it('should work', function () {
            assert_1.default.deepEqual((0, index_1.parseSort)('{_id: 1}'), { _id: 1 });
            assert_1.default.deepEqual((0, index_1.parseSort)('{_id: -1}'), { _id: -1 });
        });
        it('should allow objects and arrays as values', function () {
            assert_1.default.deepEqual((0, index_1.isSortValid)(''), null);
            assert_1.default.deepEqual((0, index_1.isSortValid)('{_id: 1}'), { _id: 1 });
            assert_1.default.deepEqual((0, index_1.isSortValid)('{_id: -1}'), { _id: -1 });
            assert_1.default.deepEqual((0, index_1.isSortValid)('{_id: "asc"}'), { _id: 'asc' });
            assert_1.default.deepEqual((0, index_1.isSortValid)('{_id: "desc"}'), { _id: 'desc' });
            assert_1.default.deepEqual((0, index_1.isSortValid)('{ score: { $meta: "textScore" } }'), {
                score: { $meta: 'textScore' },
            });
            assert_1.default.deepEqual((0, index_1.isSortValid)('[["123", -1]]'), [['123', -1]]);
            assert_1.default.deepEqual((0, index_1.isSortValid)('[["bar", 1]]'), [['bar', 1]]);
        });
        it('should reject unsupported sort values', function () {
            assert_1.default.equal((0, index_1.isSortValid)('{_id: "a"}'), false);
            assert_1.default.equal((0, index_1.isSortValid)('{_id: "1"}'), false);
            assert_1.default.equal((0, index_1.isSortValid)('{grabage'), false);
            assert_1.default.equal((0, index_1.isSortValid)('[1]'), false);
            assert_1.default.equal((0, index_1.isSortValid)('["foo"]'), false);
            assert_1.default.equal((0, index_1.isSortValid)('[["foo", "bar"]]'), false);
            assert_1.default.equal((0, index_1.isSortValid)('[[123, -1]]'), false);
        });
        it('should handle empty, null, and undefined', function () {
            assert_1.default.equal((0, index_1.isSortValid)(''), null);
            assert_1.default.equal((0, index_1.isSortValid)('null'), null);
            assert_1.default.equal((0, index_1.isSortValid)('undefined'), null);
        });
    });
    describe('skip', function () {
        it('should work', function () {
            assert_1.default.equal((0, index_1.isSkipValid)('{skip: "a"}'), false);
            assert_1.default.equal((0, index_1.isSkipValid)('0'), 0);
            assert_1.default.equal((0, index_1.isSkipValid)(1), 1);
            assert_1.default.equal((0, index_1.isSkipValid)('   '), index_1.DEFAULT_SKIP);
        });
    });
    describe('limit', function () {
        it('should work', function () {
            assert_1.default.equal((0, index_1.isLimitValid)('{limit: "a"}'), false);
            assert_1.default.equal((0, index_1.isLimitValid)('0'), 0);
            assert_1.default.equal((0, index_1.isLimitValid)(1), 1);
            assert_1.default.equal((0, index_1.isLimitValid)('   '), index_1.DEFAULT_LIMIT);
        });
    });
    describe('maxTimeMS', function () {
        it('Validates as a number', function () {
            assert_1.default.equal((0, index_1.isMaxTimeMSValid)('{maxTimeMS: "a"}'), false);
            assert_1.default.equal((0, index_1.isMaxTimeMSValid)('0'), 0);
            assert_1.default.equal((0, index_1.isMaxTimeMSValid)(1), 1);
            assert_1.default.equal((0, index_1.isMaxTimeMSValid)('   '), index_1.DEFAULT_MAX_TIME_MS);
        });
    });
    describe('validate', function () {
        it('calls the other validation functions', function () {
            assert_1.default.deepEqual((0, index_1.isSortValid)(''), null);
            assert_1.default.deepEqual((0, index_1.validate)('sort', ''), null);
            assert_1.default.deepEqual((0, index_1.validate)('Sort', ''), null);
            assert_1.default.deepEqual((0, index_1.validate)('sort', '[["123", -1]]'), [['123', -1]]);
            assert_1.default.deepEqual((0, index_1.validate)('limit', '   '), index_1.DEFAULT_LIMIT);
        });
    });
});
//# sourceMappingURL=index.test.js.map
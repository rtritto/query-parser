var EJSON = require('mongodb-extended-json');
var bson = require('bson');
var Context = require('context-eval');
var toJavascriptString = require('javascript-stringify');
/**
 * Does a string look like extended JSON or javascript?
 */
function detect() {
  return 'javascript';
}

function parseJavascript(string) {
  var sandbox = {
    RegExp: RegExp,
    Binary: bson.Binary,
    Code: bson.Code,
    DBRef: bson.DBRef,
    Decimal128: bson.Decimal128,
    NumberDecimal: function(s) {
      return bson.Decimal128.fromString(s);
    },
    Double: bson.Double,
    Int32: bson.Int32,
    Long: bson.Long,
    NumberLong: bson.Long,
    Int64: bson.Long,
    Map: bson.Map,
    MaxKey: bson.MaxKey,
    MinKey: bson.MinKey,
    ObjectID: bson.ObjectID,
    ObjectId: bson.ObjectId,
    Symbol: bson.Symbol,
    Timestamp: bson.Timestamp,
    ISODate: function(s) {
      return new Date(s);
    },
    Date: function(s) {
      return new Date(s);
    }
  };

  sandbox.__result = {};
  var ctx = new Context(sandbox);
  var res = ctx.evaluate('__result = ' + string);
  ctx.destroy();
  return res;
}

function parseExtendedJSON(string) {
  return EJSON.parse(string);
}

module.exports = function(string) {
  var mode = detect(string);
  if (mode === 'javascript') {
    return parseJavascript(string);
  }
  return parseExtendedJSON(string);
};

module.exports.detect = detect;
module.exports.toJavascriptString = function(obj) {
  return toJavascriptString(obj);
};

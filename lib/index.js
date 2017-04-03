var EJSON = require('mongodb-extended-json');
var bson = require('bson');
var Context = require('context-eval');
var toJavascriptString = require('javascript-stringify');
var isJSON = require('is-json');

var mTypes = require('mongodb-extended-json/lib/types');
var getMongoDBType = mTypes.type;

var BSON_TO_JS_STRING = {
  ObjectID: function(v) {
    return `ObjectId('${v.toHexString()}')`;
  },
  Binary: function(v) {
    return `Binary('${v.buffer.toString('base64')}', '${v.sub_type.toString(16)}')`;
  },
  DBRef: function(v) {
    return `DBRef('${v.namespace}', '${v.oid}')`;
  },
  Timestamp: function(v) {
    return `Timestamp(${v.low_}, ${v.high_})`;
  },
  Long: function(v) {
    return {
      $numberLong: v.toString()
    };
  },
  Decimal128: function(v) {
    return `Decimal128(${v.toString()})`;
  },
  MaxKey: function() {
    return 'MaxKey()';
  },
  MinKey: function() {
    return 'MinKey()';
  },
  Date: function(v) {
    return `Date('${v.toISOString()}')`;
  },
  ISODate: function(v) {
    return `ISODate('${v.toISOString()}')`;
  },
  RegExp: function(v) {
    var o = '';
    var hasOptions = false;

    if (v.global) {
      hasOptions = true;
      o += 'g';
    }
    if (v.ignoreCase) {
      hasOptions = true;
      o += 'i';
    }
    if (v.multiline) {
      hasOptions = true;
      o += 'm';
    }

    return `RegExp('${v.source}'${hasOptions ? `, ${o}` : ''})`;
  }
};

/**
 * Does a string look like extended JSON or javascript?
 * @param {String} string
 * @return {String} `json` or `javascript`
 */
function detect(string) {
  if (isJSON(string)) {
    return 'json';
  }
  // TODO (imlucas) test here if it's just an object id hex or csv of them?
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
  return toJavascriptString(obj, function(value, indent, stringify) {
    var toJs = BSON_TO_JS_STRING[getMongoDBType(value)];
    if (!toJs) {
      return stringify(value);
    }
    return toJs(value);
  });
};

const EJSON = require('mongodb-extended-json');
const bson = require('bson');
const debug = require('debug')('mongodb-query-parser');
const Context = require('context-eval');
const toJavascriptString = require('javascript-stringify');
const _ = require('lodash');
const queryLanguage = require('mongodb-language-model');

// const LRU = require('lru-cache');

const getMongoDBType = require('mongodb-extended-json/lib/types').type;

const BSON_TO_JS_STRING = {
  ObjectID: function(v) {
    return `ObjectId('${v.toHexString()}')`;
  },
  Binary: function(v) {
    return `Binary('${v.buffer.toString('base64')}', '${v.sub_type.toString(
      16
    )}')`;
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

// TODO Cache parsing.
// const createLRUCache = require('lru-cache');
// const parseProjectCache = createLRUCache({max: 100});
// const parseFilterCache = createLRUCache({max: 100});

function executeJavascript(input, sandbox) {
  sandbox = sandbox || {};

  sandbox.__result = {};
  var ctx = new Context(sandbox);
  var res = ctx.evaluate('__result = ' + input);
  ctx.destroy();
  return res;
}

function parseProject(input) {
  return executeJavascript(input, {});
}

function parseSort(input) {
  return executeJavascript(input, {});
}

function getFilterSandbox() {
  return {
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
}

function parseFilter(input) {
  var sandbox = getFilterSandbox();
  return executeJavascript(input, sandbox);
}

module.exports = function(filter = '', project = '') {
  return {
    filter: parseFilter(filter),
    project: parseProject(project)
  };
};

module.exports.parseFilter = function(input) {
  if (_.trim(input) === '' || input === '{}') {
    return {};
  }
  return parseFilter(input);
};

/**
 * Validation function for a query `filter`. Must be a valid MongoDB query
 * according to the query language.
 *
 * @param {String} input   the input to validate.
 *
 * @return {Boolean|Object}   false if not valid, otherwise the cleaned-up filter.
 */
module.exports.isFilterValid = function(input) {
  try {
    var parsed = parseFilter(input);

    // is it a valid MongoDB query according to the language?
    return queryLanguage.accepts(EJSON.stringify(parsed)) ? parsed : false;
  } catch (e) {
    debug('Filter "%s" is invalid', input, e);
    return false;
  }
};

module.exports.parseProject = function(input) {
  if (_.trim(input) === '' || input === '{}') {
    return null;
  }
  return parseProject(input);
};

function isValueOkforProject(val) {
  return _.isNumber(val) && (val === 0 || val === 1);
}

function isValueOkforSort(val) {
  return _.isNumber(val) && (val === 1 || val === -1);
}

module.exports.isProjectValid = function(input) {
  if (_.trim(input) === '' || input === '{}') {
    return null;
  }

  try {
    var parsed = parseProject(input);
    if (!_.every(parsed, isValueOkforProject)) {
      debug('Project "%s" is invalid bc of its values', input);
      return false;
    }
    return parsed;
  } catch (e) {
    debug('Project "%s" is invalid', input, e);
    return false;
  }
};

module.exports.parseSort = function(input) {
  if (_.trim(input) === '' || input === '{}') {
    return null;
  }
  return parseSort(input);
};

module.exports.isSortValid = function(input) {
  try {
    var parsed = parseSort(input);
    if (!_.every(parsed, isValueOkforSort)) {
      debug('Sort "%s" is invalid bc of its values', input);
      return false;
    }
    return parsed;
  } catch (e) {
    debug('Sort "%s" is invalid', input, e);
    return false;
  }
};

module.exports.stringify = function(obj) {
  return toJavascriptString(
    obj,
    function(value, indent, stringify) {
      var toJs = BSON_TO_JS_STRING[getMongoDBType(value)];
      if (!toJs) {
        return stringify(value);
      }
      return toJs(value);
    },
    ' '
  ).replace(/ ?\n ?/g, '');
};

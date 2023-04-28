/**
 * TODO: lucas: this is now used in several modules (import-export, query-parser, probably others). Refactor into 1 shared place. bson?
 */
const toJavascriptString = require('javascript-stringify').stringify;

/**
 * [`Object.prototype.toString.call(value)`, `string type name`]
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString#Using_toString_to_detect_object_class
 */
const TYPE_FOR_TO_STRING = new Map([
  ['[object Array]', 'Array'],
  ['[object Object]', 'Object'],
  ['[object String]', 'String'],
  ['[object Date]', 'Date'],
  ['[object Number]', 'Number'],
  ['[object Function]', 'Function'],
  ['[object RegExp]', 'RegExp'],
  ['[object Boolean]', 'Boolean'],
  ['[object Null]', 'Null'],
  ['[object Undefined]', 'Undefined']
]);

function detectType(value) {
  return TYPE_FOR_TO_STRING.get(Object.prototype.toString.call(value));
}

function getTypeDescriptorForValue(value) {
  const t = detectType(value);
  const _bsontype = t === 'Object' && value._bsontype;
  return {
    type: _bsontype || t,
    isBSON: !!_bsontype
  };
}

const BSON_TO_JS_STRING = {
  Code: function(v) {
    if (v.scope) {
      return `Code('${v.code}',${JSON.stringify(v.scope)})`;
    }
    return `Code('${v.code}')`;
  },
  ObjectID: function(v) {
    return `ObjectId('${v.toString('hex')}')`;
  },
  ObjectId: function(v) {
    return `ObjectId('${v.toString('hex')}')`;
  },
  Binary: function(v) {
    const subType = v.sub_type;
    if (subType === 4 && v.buffer.length === 16) {
      const uuidHex = v.buffer.toString('hex');
      return `UUID("${uuidHex.slice(0, 8)}-${uuidHex.slice(8, 12)}-${uuidHex.slice(12, 16)}-${uuidHex.slice(16, 20)}-${uuidHex.slice(20, 32)}")`;
    }
    return `BinData(${subType.toString(16)}, '${v.buffer.toString('base64')}')`;
  },
  DBRef: function(v) {
    if (v.db) {
      return `DBRef('${v.collection}', '${v.oid}', '${v.db}')`;
    }

    return `DBRef('${v.collection}', '${v.oid}')`;
  },
  Timestamp: function(v) {
    return `Timestamp({ t: ${v.high}, i: ${v.low} })`;
  },
  Long: function(v) {
    return `NumberLong(${v.toString()})`;
  },
  Decimal128: function(v) {
    return `NumberDecimal('${v.toString()}')`;
  },
  Double: function(v) {
    return `Double('${v.toString()}')`;
  },
  Int32: function(v) {
    return `NumberInt('${v.toString()}')`;
  },
  MaxKey: function() {
    return 'MaxKey()';
  },
  MinKey: function() {
    return 'MinKey()';
  },
  Date: function(v) {
    return `ISODate('${v.toISOString()}')`;
  },
  ISODate: function(v) {
    return `ISODate('${v.toISOString()}')`;
  },
  RegExp: function(v) {
    let o = '';
    let hasOptions = false;

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

    return `RegExp(${JSON.stringify(v.source)}${hasOptions ? `, '${o}'` : ''})`;
  }
};

function toJSString(obj, ind) {
  return toJavascriptString(
    obj,
    function(value, indent, stringify) {
      const t = getTypeDescriptorForValue(value);
      const toJs = BSON_TO_JS_STRING[t.type];
      if (!toJs) {
        return stringify(value);
      }
      return toJs(value);
    },
    ind || ' '
  );
}

module.exports.toJSString = toJSString;

module.exports.stringify = function(obj) {
  return toJSString(obj)
    .replace(/ ?\n ? ?/g, '')
    .replace(/ {2,}/g, ' ');
};

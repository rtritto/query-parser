# mongodb-query-parser [![travis][travis_img]][travis_url] [![npm][npm_img]][npm_url]

> Safe parsing and validation for MongoDB queries (filters), projections, and more.

## Example

Turn some JS code as a string into a real JS object safely and with no bson type loss:

```javascript
require('mongodb-query-parser')('{_id: ObjectId("58c33a794d08b991e3648fd2")}');
// >>> {_id: ObjectId('58c33a794d08b991e3648fd2'x)}
```

### Usage with codemirror

```javascript
var parser = require('mongodb-query-parser');
var query = '{_id: ObjectId("58c33a794d08b991e3648fd2")}';
// What is this highlighting/language mode for this string?
parser.detect(query);
// >>> `javascript`

var queryAsJSON = '{"_id":{"$oid":"58c33a794d08b991e3648fd2"}}';
// What is this highlighting/language mode for this string?
parser.detect(queryAsJSON);
// >>> `json`

// Turn it into a JS string that looks pretty in codemirror:
parser.toJavascriptString(parse(query));
// >>> '{_id:ObjectId(\'58c33a794d08b991e3648fd2\')}'
```

### Extended JSON Support

```javascript
var parser = require('mongodb-query-parser');
var EJSON = require('mongodb-extended-json');
var queryAsAnObjectWithTypes = parser.parseFilter(query);

// Use extended json to prove types are intact
EJSON.stringify(queryAsAnObjectWithTypes);
// >>> '{"_id":{"$oid":"58c33a794d08b991e3648fd2"}}'

var queryAsJSON = '{"_id":{"$oid":"58c33a794d08b991e3648fd2"}}';
parser.detect(queryAsJSON);
// >>> `json`
```

## License

Apache 2.0

[travis_img]: https://img.shields.io/travis/mongodb-js/query-parser.svg
[travis_url]: https://travis-ci.org/mongodb-js/query-parser
[npm_img]: https://img.shields.io/npm/v/mongodb-query-parser.svg
[npm_url]: https://npmjs.org/package/mongodb-query-parser

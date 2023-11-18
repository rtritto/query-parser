import assert from 'assert';
import { Binary } from 'bson';

import { toJSString } from './stringify';

describe('stringify', function () {
  it('should convert BinData to string', function () {
    const test = { bin: new Binary(new TextEncoder().encode('test'), 80) };
    const result = toJSString(test);
    assert.deepEqual(result, '{\n bin: BinData(80, \'dGVzdA==\')\n}');
  });
});
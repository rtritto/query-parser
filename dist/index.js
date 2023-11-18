"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MAX_TIME_MS = exports.DEFAULT_COLLATION = exports.DEFAULT_PROJECT = exports.DEFAULT_SKIP = exports.DEFAULT_LIMIT = exports.DEFAULT_SORT = exports.DEFAULT_FILTER = exports.QUERY_PROPERTIES = exports.toJSString = exports.stringify = exports.validate = exports.isLimitValid = exports.isSkipValid = exports.isMaxTimeMSValid = exports.isSortValid = exports.isProjectValid = exports.parseProject = exports.isCollationValid = exports.isFilterValid = exports.parseCollation = exports.parseFilter = exports.parseSort = void 0;
const ejson_shell_parser_1 = __importStar(require("ejson-shell-parser"));
const lodash_1 = __importDefault(require("lodash"));
const debug_1 = __importDefault(require("debug"));
const constants_1 = require("./constants");
const stringify_1 = require("./stringify");
Object.defineProperty(exports, "stringify", { enumerable: true, get: function () { return stringify_1.stringify; } });
Object.defineProperty(exports, "toJSString", { enumerable: true, get: function () { return stringify_1.toJSString; } });
const debug = (0, debug_1.default)('mongodb-query-parser');
/** @public */
const DEFAULT_FILTER = {};
exports.DEFAULT_FILTER = DEFAULT_FILTER;
/** @public */
const DEFAULT_SORT = null;
exports.DEFAULT_SORT = DEFAULT_SORT;
/** @public */
const DEFAULT_LIMIT = 0;
exports.DEFAULT_LIMIT = DEFAULT_LIMIT;
/** @public */
const DEFAULT_SKIP = 0;
exports.DEFAULT_SKIP = DEFAULT_SKIP;
/** @public */
const DEFAULT_PROJECT = null;
exports.DEFAULT_PROJECT = DEFAULT_PROJECT;
/** @public */
const DEFAULT_COLLATION = null;
exports.DEFAULT_COLLATION = DEFAULT_COLLATION;
/** @public */
const DEFAULT_MAX_TIME_MS = 60000; // 1 minute in ms
exports.DEFAULT_MAX_TIME_MS = DEFAULT_MAX_TIME_MS;
/** @public */
const QUERY_PROPERTIES = ['filter', 'project', 'sort', 'skip', 'limit'];
exports.QUERY_PROPERTIES = QUERY_PROPERTIES;
function isEmpty(input) {
    if (input === null || input === undefined) {
        return true;
    }
    const s = lodash_1.default.trim(typeof input === 'number' ? `${input}` : input);
    if (s === '{}') {
        return true;
    }
    return lodash_1.default.isEmpty(s);
}
function isNumberValid(input) {
    if (isEmpty(input)) {
        return 0;
    }
    return /^\d+$/.test(`${input}`) ? parseInt(`${input}`, 10) : false;
}
function _parseProject(input) {
    return (0, ejson_shell_parser_1.default)(input, { mode: ejson_shell_parser_1.ParseMode.Loose });
}
function _parseCollation(input) {
    return (0, ejson_shell_parser_1.default)(input, { mode: ejson_shell_parser_1.ParseMode.Loose });
}
/** @public */
function parseSort(input) {
    if (isEmpty(input)) {
        return DEFAULT_SORT;
    }
    return (0, ejson_shell_parser_1.default)(input, { mode: ejson_shell_parser_1.ParseMode.Loose });
}
exports.parseSort = parseSort;
function _parseFilter(input) {
    return (0, ejson_shell_parser_1.default)(input, { mode: ejson_shell_parser_1.ParseMode.Loose });
}
/** @public */
function parseFilter(input) {
    if (isEmpty(input)) {
        return DEFAULT_FILTER;
    }
    return _parseFilter(input);
}
exports.parseFilter = parseFilter;
/** @public */
function parseCollation(input) {
    if (isEmpty(input)) {
        return DEFAULT_COLLATION;
    }
    return _parseCollation(input);
}
exports.parseCollation = parseCollation;
/**
 * Validation function for a query `filter`. Must be a valid MongoDB query
 * according to the query language.
 * @public
 *
 * @return {Boolean|Object} false if not valid, or the parsed filter.
 */
function isFilterValid(input) {
    if (isEmpty(input)) {
        return DEFAULT_FILTER;
    }
    try {
        return _parseFilter(input);
    }
    catch (e) {
        debug('Filter "%s" is invalid', input, e);
        return false;
    }
}
exports.isFilterValid = isFilterValid;
/**
 * Validation of collation object keys and values.
 * @public
 *
 * @param {Object} collation
 * @return {Boolean|Object} false if not valid, otherwise the parsed project.
 */
function _isCollationValid(collation) {
    for (const [key, value] of Object.entries(collation)) {
        if (!constants_1.COLLATION_OPTIONS[key]) {
            debug('Collation "%s" is invalid bc of its keys', collation);
            return false;
        }
        if (constants_1.COLLATION_OPTIONS[key].includes(value) === false) {
            debug('Collation "%s" is invalid bc of its values', collation);
            return false;
        }
    }
    return collation;
}
/**
 * Validation function for a query `collation`.
 * @public
 *
 * @return {Boolean|Object} false if not valid, or the parsed filter.
 */
function isCollationValid(input) {
    if (isEmpty(input)) {
        return DEFAULT_COLLATION;
    }
    try {
        const parsed = _parseCollation(input);
        return _isCollationValid(parsed);
    }
    catch (e) {
        debug('Collation "%s" is invalid', input, e);
        return false;
    }
}
exports.isCollationValid = isCollationValid;
function isValueOkForProject() {
    /**
     * Since server 4.4, project in find queries supports everything that
     * aggregations $project supports (which is basically anything at all) so we
     * effectively allow everything as a project value and keep this method for
     * the context
     *
     * @see {@link https://docs.mongodb.com/manual/release-notes/4.4/#projection}
     */
    return true;
}
/** @public */
function parseProject(input) {
    if (isEmpty(input)) {
        return DEFAULT_PROJECT;
    }
    return _parseProject(input);
}
exports.parseProject = parseProject;
/**
 * Validation function for a query `project`. Must only have 0 or 1 as values.
 * @public
 *
 * @return {Boolean|Object} false if not valid, otherwise the parsed project.
 */
function isProjectValid(input) {
    if (isEmpty(input)) {
        return DEFAULT_PROJECT;
    }
    try {
        const parsed = _parseProject(input);
        if (!lodash_1.default.isObject(parsed)) {
            debug('Project "%s" is invalid. Only documents are allowed', input);
            return false;
        }
        if (!lodash_1.default.every(parsed, isValueOkForProject)) {
            debug('Project "%s" is invalid bc of its values', input);
            return false;
        }
        return parsed;
    }
    catch (e) {
        debug('Project "%s" is invalid', input, e);
        return false;
    }
}
exports.isProjectValid = isProjectValid;
const ALLOWED_SORT_VALUES = [1, -1, 'asc', 'desc'];
function isValueOkForSortDocument(val) {
    return (lodash_1.default.includes(ALLOWED_SORT_VALUES, val) ||
        !!(lodash_1.default.isObject(val) && val.$meta));
}
function isValueOkForSortArray(val) {
    return (lodash_1.default.isArray(val) &&
        val.length === 2 &&
        lodash_1.default.isString(val[0]) &&
        isValueOkForSortDocument(val[1]));
}
/**
 * Validation function for a query `sort`. Must only have -1 or 1 as values.
 * @public
 *
 * @return {Boolean|Object} false if not valid, otherwise the cleaned-up sort.
 */
function isSortValid(input) {
    try {
        const parsed = parseSort(input);
        if (isEmpty(parsed)) {
            return DEFAULT_SORT;
        }
        if (lodash_1.default.isArray(parsed) && lodash_1.default.every(parsed, isValueOkForSortArray)) {
            return parsed;
        }
        if (lodash_1.default.isObject(parsed) &&
            !lodash_1.default.isArray(parsed) &&
            lodash_1.default.every(parsed, isValueOkForSortDocument)) {
            return parsed;
        }
        debug('Sort "%s" is invalid bc of its values', input);
        return false;
    }
    catch (e) {
        debug('Sort "%s" is invalid', input, e);
        return false;
    }
}
exports.isSortValid = isSortValid;
/**
 * Validation function for a query `maxTimeMS`. Must be digits only.
 * @public
 *
 * Returns false if not valid, otherwise the cleaned-up max time ms.
 */
function isMaxTimeMSValid(input) {
    if (isEmpty(input)) {
        return DEFAULT_MAX_TIME_MS;
    }
    return isNumberValid(input);
}
exports.isMaxTimeMSValid = isMaxTimeMSValid;
/**
 * Validation function for a query `skip`. Must be digits only.
 * @public
 *
 * Returns false if not valid, otherwise the cleaned-up skip.
 */
function isSkipValid(input) {
    if (isEmpty(input)) {
        return DEFAULT_SKIP;
    }
    return isNumberValid(input);
}
exports.isSkipValid = isSkipValid;
/**
 * Validation function for a query `limit`. Must be digits only.
 * @public
 *
 * Returns false if not valid, otherwise the cleaned-up limit.
 */
function isLimitValid(input) {
    if (isEmpty(input)) {
        return DEFAULT_LIMIT;
    }
    return isNumberValid(input);
}
exports.isLimitValid = isLimitValid;
const validatorFunctions = {
    isMaxTimeMSValid,
    isFilterValid,
    isProjectValid,
    isSortValid,
    isLimitValid,
    isSkipValid,
    isCollationValid,
    isNumberValid,
};
/** @public */
function validate(what, input) {
    const validator = validatorFunctions[`is${lodash_1.default.upperFirst(what)}Valid`];
    if (!validator) {
        debug('Do not know how to validate `%s`. Returning false.', what);
        return false;
    }
    return validator(input);
}
exports.validate = validate;
/** @public */
function queryParser(filter, project = DEFAULT_PROJECT) {
    if (arguments.length === 1) {
        if (lodash_1.default.isString(filter)) {
            return _parseFilter(filter);
        }
    }
    return {
        filter: _parseFilter(filter),
        project: project !== DEFAULT_PROJECT ? _parseProject(project) : project,
    };
}
exports.default = queryParser;
//# sourceMappingURL=index.js.map
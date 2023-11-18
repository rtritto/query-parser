import { stringify, toJSString } from './stringify';
/** @public */
declare const DEFAULT_FILTER: {};
/** @public */
declare const DEFAULT_SORT: null;
/** @public */
declare const DEFAULT_LIMIT = 0;
/** @public */
declare const DEFAULT_SKIP = 0;
/** @public */
declare const DEFAULT_PROJECT: null;
/** @public */
declare const DEFAULT_COLLATION: null;
/** @public */
declare const DEFAULT_MAX_TIME_MS = 60000;
/** @public */
declare const QUERY_PROPERTIES: string[];
/** @public */
export declare function parseSort(input: string): any;
/** @public */
export declare function parseFilter(input: string): any;
/** @public */
export declare function parseCollation(input: string): any;
/**
 * Validation function for a query `filter`. Must be a valid MongoDB query
 * according to the query language.
 * @public
 *
 * @return {Boolean|Object} false if not valid, or the parsed filter.
 */
export declare function isFilterValid(input: string): any;
/**
 * Validation function for a query `collation`.
 * @public
 *
 * @return {Boolean|Object} false if not valid, or the parsed filter.
 */
export declare function isCollationValid(input: string): any;
/** @public */
export declare function parseProject(input: string): any;
/**
 * Validation function for a query `project`. Must only have 0 or 1 as values.
 * @public
 *
 * @return {Boolean|Object} false if not valid, otherwise the parsed project.
 */
export declare function isProjectValid(input: string): false | object | null;
/**
 * Validation function for a query `sort`. Must only have -1 or 1 as values.
 * @public
 *
 * @return {Boolean|Object} false if not valid, otherwise the cleaned-up sort.
 */
export declare function isSortValid(input: string): false | object | null;
/**
 * Validation function for a query `maxTimeMS`. Must be digits only.
 * @public
 *
 * Returns false if not valid, otherwise the cleaned-up max time ms.
 */
export declare function isMaxTimeMSValid(input: string | number): number | false;
/**
 * Validation function for a query `skip`. Must be digits only.
 * @public
 *
 * Returns false if not valid, otherwise the cleaned-up skip.
 */
export declare function isSkipValid(input: string | number): number | false;
/**
 * Validation function for a query `limit`. Must be digits only.
 * @public
 *
 * Returns false if not valid, otherwise the cleaned-up limit.
 */
export declare function isLimitValid(input: string | number): number | false;
/** @public */
export declare function validate(what: string, input: string): any;
/** @public */
export default function queryParser(filter: string, project?: string | null): any;
export { stringify, toJSString, QUERY_PROPERTIES, DEFAULT_FILTER, DEFAULT_SORT, DEFAULT_LIMIT, DEFAULT_SKIP, DEFAULT_PROJECT, DEFAULT_COLLATION, DEFAULT_MAX_TIME_MS, };
//# sourceMappingURL=index.d.ts.map
/** @public */
export declare const DEFAULT_COLLATION: null;

/** @public */
export declare const DEFAULT_FILTER: {};

/** @public */
export declare const DEFAULT_LIMIT = 0;

/** @public */
export declare const DEFAULT_MAX_TIME_MS = 60000;

/** @public */
export declare const DEFAULT_PROJECT: null;

/** @public */
export declare const DEFAULT_SKIP = 0;

/** @public */
export declare const DEFAULT_SORT: null;

/**
 * Validation function for a query `collation`.
 * @public
 *
 * @return {Boolean|Object} false if not valid, or the parsed filter.
 */
export declare function isCollationValid(input: string): any;

/**
 * Validation function for a query `filter`. Must be a valid MongoDB query
 * according to the query language.
 * @public
 *
 * @return {Boolean|Object} false if not valid, or the parsed filter.
 */
export declare function isFilterValid(input: string): any;

/**
 * Validation function for a query `limit`. Must be digits only.
 * @public
 *
 * Returns false if not valid, otherwise the cleaned-up limit.
 */
export declare function isLimitValid(input: string | number): number | false;

/**
 * Validation function for a query `maxTimeMS`. Must be digits only.
 * @public
 *
 * Returns false if not valid, otherwise the cleaned-up max time ms.
 */
export declare function isMaxTimeMSValid(input: string | number): number | false;

/**
 * Validation function for a query `project`. Must only have 0 or 1 as values.
 * @public
 *
 * @return {Boolean|Object} false if not valid, otherwise the parsed project.
 */
export declare function isProjectValid(input: string): false | object | null;

/**
 * Validation function for a query `skip`. Must be digits only.
 * @public
 *
 * Returns false if not valid, otherwise the cleaned-up skip.
 */
export declare function isSkipValid(input: string | number): number | false;

/**
 * Validation function for a query `sort`. Must only have -1 or 1 as values.
 * @public
 *
 * @return {Boolean|Object} false if not valid, otherwise the cleaned-up sort.
 */
export declare function isSortValid(input: string): false | object | null;

/** @public */
export declare function parseCollation(input: string): any;

/** @public */
export declare function parseFilter(input: string): any;

/** @public */
export declare function parseProject(input: string): any;

/** @public */
export declare function parseSort(input: string): any;

/** @public */
export declare const QUERY_PROPERTIES: string[];

/** @public */
declare function queryParser(filter: string, project?: string | null): any;
export default queryParser;

/** @public */
export declare function stringify(obj: unknown): string | undefined;

/** @public */
export declare function toJSString(obj: unknown, ind?: Parameters<typeof JSON.stringify>[2]): string | undefined;

/** @public */
export declare function validate(what: string, input: string): any;

export { }

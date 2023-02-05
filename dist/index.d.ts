/**
 * Get Auth headers
 */
/**
 * Download as csv
 */
declare function exportToCsv({ data, fileName }: {
    data: any[];
    fileName?: string;
}): void;
/**
 * fetch single endpoint data
 */
declare function fetchData({ url, query, limit, offset, dataKey, authToken, authHeaders }: {
    url: string;
    query?: string;
    limit?: number;
    offset?: number;
    dataKey?: string;
    authToken?: string;
    authHeaders?: Record<string, string>;
}): Promise<any>;
/**
 * fetch all available data from an endpoint by auto-generated endpoint then http request
 */
declare function fetchAllData({ url, query, limit, promiseLimit, total, countKey, dataKey, dataListKey, authToken, authHeaders }: {
    url: string;
    query?: string;
    limit?: number;
    promiseLimit?: number;
    total?: number;
    countKey?: string;
    dataKey?: string;
    dataListKey?: string;
    authToken?: string;
    authHeaders?: Record<string, string>;
}): Promise<any>;
export { fetchData, fetchAllData, exportToCsv };

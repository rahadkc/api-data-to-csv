"use strict";
/**
 * Get Auth headers
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportToCsv = exports.fetchAllData = exports.fetchData = void 0;
const getHeader = (token, headers) => ({
    method: 'GET',
    headers: headers || {
        'Content-Type': 'application/json',
        'access-control-allow-origin': '*',
        Authorization: `${token}`
    }
});
/**
 * Limit concurrent promise
 */
async function limitedPromise({ urls, limit = 10, dataKey, dataListKey, authToken, authHeaders }) {
    const data = [];
    while (urls.length) {
        const _chunk = urls.splice(0, limit).map(url => fetch(url, getHeader(authToken, authHeaders)));
        const responses = await Promise.all(_chunk);
        const _arr = await Promise.all(responses.map(async (res) => {
            const json = await res.json();
            const data = await json[dataKey];
            const list = data[dataListKey];
            return list;
        }));
        data.push(_arr);
    }
    return data.flat(Infinity);
}
/**
 * Endpoint Query format
 */
function formatedQuery({ url, query, offset, limit }) {
    return query
        ? `${url}?${query}&offset=${offset}&limit=${limit}`
        : `${url}?offset=${offset}&limit=${limit}`;
}
/**
 * Endpoint generate based on 'total' or 'count' number
 * Generate URLs based on return data on first API call
 */
function generateUrls({ url, query, total, limit }) {
    const pages = Math.ceil(total / limit);
    const urls = [];
    for (let i = 0; i <= pages; i++) {
        const offset = i;
        urls.push(formatedQuery({
            url,
            query,
            offset,
            limit
        }));
    }
    return urls;
}
/**
 * Convert data as Blob to download
 */
const downloadFile = ({ data, fileName, fileType }) => {
    const blob = new Blob([data], { type: fileType });
    const a = document.createElement('a');
    a.download = fileName;
    a.href = window.URL.createObjectURL(blob);
    const clickEvt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    });
    a.dispatchEvent(clickEvt);
    a.remove();
};
/**
 * Download as csv
 */
function exportToCsv({ data, fileName }) {
    const headers = ('No.,' + Object.keys(data[0]).join(',')).split('+');
    let row = 0;
    const _data = data.reduce((acc, item) => {
        row = row + 1;
        const values = Object.values(item);
        acc.push([row, ...values].join(','));
        return acc;
    }, []);
    downloadFile({
        data: [...headers, ..._data].join('\n'),
        fileName: `${fileName || 'data'}.csv`,
        fileType: 'text/csv'
    });
}
exports.exportToCsv = exportToCsv;
/**
 * fetch single endpoint data
 */
async function fetchData({ url, query, limit = 50, offset = 0, dataKey = 'data', authToken, authHeaders }) {
    const _url = formatedQuery({ url, query, limit, offset });
    try {
        const res = await fetch(_url, getHeader(authToken, authHeaders));
        const json = await res.json();
        return json[dataKey];
    }
    catch (error) {
        console.log(error);
    }
}
exports.fetchData = fetchData;
/**
 * fetch all available data from an endpoint by auto-generated endpoint then http request
 */
async function fetchAllData({ url, query, limit = 200, promiseLimit = 10, total, countKey = 'count', dataKey = 'data', dataListKey = 'rows', authToken, authHeaders }) {
    try {
        let _total = 0;
        if (!total) {
            const _data = await fetchData({ url, query, authToken, authHeaders });
            _total = _data[countKey];
            if (_total <= limit) {
                return _data[dataListKey];
            }
        }
        const urls = generateUrls({ url, query, total: total | _total, limit });
        const requests = [...urls];
        const _allData = await limitedPromise({
            urls: requests,
            limit: promiseLimit,
            dataKey,
            dataListKey,
            authToken,
            authHeaders
        });
        return _allData;
    }
    catch (error) {
        console.error(error);
    }
}
exports.fetchAllData = fetchAllData;
//# sourceMappingURL=index.js.map
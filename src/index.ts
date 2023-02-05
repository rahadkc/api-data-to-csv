/**
 * Get Auth headers
 */

const getHeader = (token: string, headers?: Record<string, string>) => ({
  method: 'GET',
  headers: headers || {
    'Content-Type': 'application/json',
    Origin: '',
    'access-control-allow-origin': '*',
    Authorization: `${token}`
  }
})

/**
 * Limit concurrent promise
 */
async function limitedPromise({
  urls,
  limit = 10,
  dataKey,
  dataListKey,
  authToken,
  authHeaders
}: {
  urls: string[]
  limit?: number
  dataKey?: string
  dataListKey?: string
  authToken?: string
  authHeaders?: Record<string, string>
}) {
  const data: Record<string, any> = []
  while (urls.length) {
    const _chunk = urls.splice(0, limit).map(url => fetch(url, getHeader(authToken, authHeaders)))
    const responses = await Promise.all(_chunk)
    const _arr = await Promise.all(
      responses.map((res: any) => {
        console.log(res.json(), 'res.json()')
        const json = res.json()
        const data = json[dataKey][dataListKey]
        return data
      })
    )
    data.push(_arr)
  }
  return data.flat(Infinity)
}

/**
 * Endpoint Query format
 */
function formatedQuery({
  url,
  query,
  offset,
  limit
}: {
  url: string
  query?: string
  offset: number
  limit: number
}) {
  return query
    ? `${url}?${query}&offset=${offset}&limit=${limit}`
    : `${url}?offset=${offset}&limit=${limit}`
}

/**
 * Endpoint generate based on 'total' or 'count' number
 * Generate URLs based on return data on first API call
 */
function generateUrls({
  url,
  query,
  total,
  limit
}: {
  url: string
  query?: string
  total: number
  limit: number
}) {
  const pages = Math.ceil(total / limit)
  const urls = []
  for (let i = 1; i <= pages; i++) {
    const offset = (i - 1) * limit
    urls.push(
      formatedQuery({
        url,
        query,
        offset,
        limit
      })
    )
  }
  return urls
}

/**
 * Convert data as Blob to download
 */
const downloadFile = ({
  data,
  fileName,
  fileType
}: {
  data: string
  fileName: string
  fileType: string
}) => {
  const blob = new Blob([data as BlobPart], { type: fileType })

  const a = document.createElement('a')
  a.download = fileName
  a.href = window.URL.createObjectURL(blob)
  const clickEvt = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true
  })
  a.dispatchEvent(clickEvt)
  a.remove()
}

/**
 * Download as csv
 */
function exportToCsv({ data, fileName }: { data: any[]; fileName?: string }) {
  const headers = ('No.,' + Object.keys(data[0]).join(',')).split('+')

  let row = 0
  const csvData = data.reduce((acc: any, item: any) => {
    row = row + 1
    const values = Object.values(item)
    acc.push([row, ...values].join(','))
    return acc
  }, [])

  downloadFile({
    data: [...headers, ...csvData].join('\n'),
    fileName: `${fileName || 'data'}.csv`,
    fileType: 'text/csv'
  })
}

/**
 * fetch single endpoint data
 */
async function fetchData({
  url,
  query,
  limit = 50,
  offset = 0,
  dataKey = 'data',
  authToken,
  authHeaders
}: {
  url: string
  query?: string
  limit?: number
  offset?: number
  dataKey?: string
  authToken?: string
  authHeaders?: Record<string, string>
}) {
  const _url = formatedQuery({ url, query, limit, offset })
  try {
    const res = await fetch(_url, getHeader(authToken, authHeaders))
    const json = await res.json()
    return json[dataKey]
  } catch (error) {
    console.log(error)
  }
}

/**
 * fetch all available data from an endpoint by auto-generated endpoint then http request
 */
async function fetchAllData({
  url,
  query,
  limit = 200,
  promiseLimit = 10,
  total,
  countKey = 'count',
  dataKey = 'data',
  dataListKey = 'rows',
  authToken,
  authHeaders
}: {
  url: string
  query?: string
  limit?: number
  promiseLimit?: number
  total?: number
  countKey?: string
  dataKey?: string
  dataListKey?: string
  authToken?: string
  authHeaders?: Record<string, string>
}) {
  try {
    let _total = 0
    if (!total) {
      const getData = await fetchData({ url, query, authToken, authHeaders })
      _total = getData[countKey]
    }

    const urls = generateUrls({ url, query, total: total | _total, limit })
    const requests = [...urls]
    const _allData = await limitedPromise({
      urls: requests,
      limit: promiseLimit,
      dataKey,
      dataListKey,
      authToken,
      authHeaders
    })
    return _allData
  } catch (error) {
    console.error(error)
  }
}

export { fetchData, fetchAllData, exportToCsv }

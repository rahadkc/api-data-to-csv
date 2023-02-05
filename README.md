# API Data to CSV file generator

#### Get all the data from an API endpoint. If API endpoint has Ex: 50,000 data  `apiDataToCsv` will automatically generate endpoints to get 50,000 data and make asynchronous request, gather the data and export data to a CSV file.


## **How it works**

Suppose you have an API endpoint 
```js
https://example.com/api/vi/users
```
In this endpoint you have 50,000 data. And you want to export all 50k data in a single CSV file with single click. But your backend send paginated data like this -

```js
https://example.com/api/vi/users?offset=0&limit=200
```
 Only 200 data you'll get from single HTTP request and you've to make 250 HTTP request to get all 50k data. 

 `apiDataToCsv` won't reduce the HTTP request but it'll make 250 HTTP request for you and it'll automatically generate all the endpoints itself based on the response `total` of first HTTP response.


Let assume this is your first API response with 10 data limit 


```js
https://example.com/api/vi/users?offset=0&limit=10

{
  "success": true,
  "message": "Data fetch succeeded.",
  "data": {
    "count": 500,
    "rows": [
      {
        "id": 1,
        "email": "example@mail.com",
        "isEmailVerified": true,
        "createdAt": "2023-01-16T19:18:34.000Z",
        "updatedAt": "2023-01-16T19:18:34.000Z"
      },
      ....
      ....
      ....,
      {
        "id": 10,
        "email": "example@mail.com",
        "isEmailVerified": true,
        "createdAt": "2023-01-16T19:18:49.000Z",
        "updatedAt": "2023-01-16T19:18:49.000Z"
      }
    ]
  }
}
```

`apiDataToCsv` will calculate `count` with `limit` and make it's own endpoint for getting all 500 data and export in a single csv file


## **Example**


### Install
```js 
npm i api-data-to-csv
```


For multiple HTTP request. Use if want to export all the data available in this endpoint. 

```js
fetchAllData({
    url: string, 
    query?: string, 
    limit?: number, 
    promiseLimit?: number, 
    total?: number, 
    countKey?: string, 
    listKey?: string
})
```

Example values: 
```js
{
    url: `https://example.com/ap/endpoint`, 
    query: "query={"id": 1}&include={"model": "ExampleModel", "as": "exampleModel"}", // Any query. Note: Don't add 'limit' and 'offset' with query
    limit = 200, // Data limit per request. Default: 200
    total = 5000, // Total number of data. if not defined package will get the data from the first API call 
    dataKey = , // data key for API response object. default: 'data'
    dataListKey = 'rows', // Data list 'key' in API response. Default: 'rows'
    countKey = 'count' // Total number of data defined in API response data 'key'. Default: 'count'
    promiseLimit = 10, // Promise concurrency limit Default: 10
}
```


For signle HTTP request. Use if want to export only the passed Endpoint data.

```js
fetchData({
    url: string, 
    query?: string, 
    limit?: number, 
    offset?: number
})
```

Example values: 
```js
{
    url: `https://example.com/ap/endpoint`, 
    query: "query={"id": 1}&include={"model": "ExampleModel", "as": "exampleModel"}", // Any query. Note: Don't add 'limit' and 'offset' with query
    limit = 50, // Default: 50 
    offset = 0, // Default: 0 
    dataKey = , // data key for API response object. default: 'data'
    dataListKey = 'rows', // Data list 'key' in API response. Default: 'rows'
    countKey = 'count' // Total number of data defined in API response data 'key'. Default: 'count'
}
```

### **ReactJs example**

[Codesandbox Demo](https://codesandbox.io/s/automatic-api-data-to-csv-export-xxmv3p)

```js
import { fetchData, fetchAllData, exportToCsv } from 'apiDataToCsv'

function App() {

    const handleAllDownload = async () => {
        setLoading(true)
        try {
            const data = await fetchAllData({
                url: 'https://example.com/api/endpoint',
                limit: 100,
                // offset: 0,
                // total: 500,
                // query: ''
            })
            exportToCsv({data}) 
            setLoading(false)
        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    }

    const handleDownload = async () => {
        setLoading(true)
        try {
            const data = await fetchAllData({
                url: 'https://example.com/api/endpoint',
                limit: 100,
                offset: 0,
                // query: '',
            })
            exportToCsv({ data }) 
            setLoading(false)
        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    }

    return (
        <div>
            <button onClick={handleAllDownload}>Export to CSV</button>
            <button onClick={handleDownload}>Export to CSV</button>
        </div>
    )
}
```

### Only from object array `exportToCsv`


```js
const data = [
    { id: 1, name: "a", title: "title", complete: false, position: "C" },
    { id: 2, name: "a", title: "title", complete: false, position: "C" },
    { id: 3, name: "a", title: "title", complete: false, position: "C" },
    { id: 4, name: "a", title: "title", complete: false, position: "C" },
    { id: 5, name: "a", title: "title", complete: false, position: "C" }
  ];


  exportToCsv({ data, fileName: 'my_user_data' })
```




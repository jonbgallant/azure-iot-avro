/*
MIT License

Copyright (c) 2017 Jon Gallant, Justine Cocchi, James Trott, and Bryan Hughes

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
require('dotenv').config()
var DocumentDBClient = require('documentdb').DocumentClient
var express = require('express')
var app = express()

// Set up Cosmos connection
var docDbClient = new DocumentDBClient(process.env.HOST, {
  masterKey: process.env.AUTH_KEY
})
var databaseUrl = `dbs/${process.env.DATABASE_ID}`
var collectionUrl = `${databaseUrl}/colls/${process.env.COLLECTION_ID}`

app.get('/api/schema', function (req, res) {
  var parts = req.query.schemaId.split(':')
  var querySpec

  // We got both a name and a version
  if (parts.length > 1) {
    querySpec = {
      query: 'SELECT * FROM root r WHERE r.name=@name AND r.version=@version',
      parameters: [{
        name: '@name',
        value: parts[0]
      }, {
        name: '@version',
        value: parts[1]
      }]
    }
  } else { // Request was malformed
    res.sendStatus(400)
  }

  docDbClient.queryDocuments(collectionUrl, querySpec).toArray(function (err, results) {
    if (err || results.length !== 1) {
      res.sendStatus(500)
    } else {
      res.send(results[0].schema)
    }
  })
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

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
const DocumentDBClient = require('documentdb').DocumentClient
const express = require('express')
const path = require('path')
const fs = require('fs')
const app = express()

// Configure dynamic port assignment
const SERVICE_FABRIC_CONFIG = path.join(__dirname, '..', 'SchemasPkg.Endpoints.txt')
var sfConfExists = fs.existsSync(SERVICE_FABRIC_CONFIG)
var sfPort = -1
var defaultFallBackPort = 3000
var port = process.env.PORT || defaultFallBackPort
if (sfConfExists) {
  const endpointsFile = fs.readFileSync(SERVICE_FABRIC_CONFIG, 'utf8')
  sfPort = endpointsFile.split(';')[3]
  port = sfPort
}

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

app.get('/api/allSchemas', function (req, res) {
  var querySpec = {
    query: 'SELECT * FROM root r'
  }

  docDbClient.queryDocuments(collectionUrl, querySpec).toArray(function (err, results) {
    if (err) {
      res.sendStatus(500)
    } else {
      var schemas = []

      results.forEach(s => {
        var schema = {
          schemaId: s.name + ':' + s.version,
          schema: s.schema
        }
        schemas.push(schema)
      })

      res.send({
        schemas: schemas
      })
    }
  })
})

app.listen(port, function () {
  console.log('listening on ' + port)
})

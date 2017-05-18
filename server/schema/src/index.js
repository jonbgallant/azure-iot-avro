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

require('dotenv').config();

const common = require('common');
const DocumentDBClient = require('documentdb').DocumentClient;
const waterfall = require('async-waterfall');
const express = require('express');
const app = express();

// Stored prodedure definitions
const allSchemasStoredProc = require('./storedProcedures/allSchemasStoredProc');
const schemaStoredProc = require('./storedProcedures/schemaStoredProc');

function handleError (err) {
  // TODO: add something more interesting: error reporting service, analytics, etc
  console.error(err);
}

console.log('Starting schema server');
common.servicefabric.getServiceFabricPort((error, sfport) => {
  if (error) {
    handleError(error);
    process.exit(-1);
  }

  const port = process.env.PORT || sfport || 3000;

  // Set up Cosmos connection
  const docDbClient = new DocumentDBClient(process.env.COSMOS_HOST, {
    masterKey: process.env.COSMOS_AUTH_KEY
  });
  const databaseUrl = `dbs/${process.env.COSMOS_DATABASE_ID}`;
  const collectionUrl = `${databaseUrl}/colls/${process.env.COSMOS_COLLECTION_ID}`;
  const allSchemasStoredProcUrl = `${collectionUrl}/sprocs/allSchemasQuery`;
  const schemaStoredProcUrl = `${collectionUrl}/sprocs/schemaQuery`;

  // Register the stored procedure if they don't already exist
  let createdStoredProcedure;
  waterfall([
    (next) => {
      docDbClient.readStoredProcedure(allSchemasStoredProcUrl, (err, res) => {
        if (!err) {
          next();
          return;
        }
        // The stored procedure doesn't exist yet, create it now
        docDbClient.createStoredProcedure(collectionUrl, allSchemasStoredProc, {}, (err, res) => {
          if (err) {
            console.log(`Error creating stored procedure: ${err.code}`);
          } else {
            createdStoredProcedure = res.id;
            console.log(`Successfully created stored procedure: ${createdStoredProcedure}`);
          }
          next();
        });
      })
    },
    (next) => {
      docDbClient.readStoredProcedure(schemaStoredProcUrl, (err, res) => {
        if (err) {
          // The stored procedure doesn't exist yet, create it now
          docDbClient.createStoredProcedure(collectionUrl, schemaStoredProc, {}, (err, res) => {
            if (err) {
              console.log('Error creating stored procedure: ' + err.code);
            } else {
              createdStoredProcedure = res.id;
              console.log('Successfully created stored procedure: ' + createdStoredProcedure);
            }
            next();
          });
        }
      });
    }]);

  app.get('/api/allSchemas', (req, res) => {
    docDbClient.executeStoredProcedure(allSchemasStoredProcUrl, null, {}, (err, results) => {
      if (err) {
        res.sendStatus(err.code);
      } else {
        res.send(results);
      }
    });
  });

  app.get('/api/schema', (req, res) => {
    docDbClient.executeStoredProcedure(schemaStoredProcUrl, req.query.schemaId, {}, (err, results) => {
      if (err) {
        res.sendStatus(err.code);
      } else {
        res.send(results[0].schema);
      }
    })
  })

  app.listen(port, () => {
    console.log(`Schema server listening on port ${port}`);
  });
})


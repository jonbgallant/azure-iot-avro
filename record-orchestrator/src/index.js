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

'use strict';

const fs = require('fs');
const path = require('path');
const device = require('./device');
const microservice = require('./microservice');

console.log('Starting Record Orchestrator');

const SERVICE_FABRIC_CONFIG = path.join(__dirname, '..', '..', 'ExpressPkg.Endpoints.txt');

let port = process.env.PORT || 3000;
if (fs.existsSync(SERVICE_FABRIC_CONFIG)) {
    const endpointsFile = fs.readFileSync(SERVICE_FABRIC_CONFIG, 'utf8');
    port = endpointsFile.split(';')[3];
}

require('dotenv').config();

device.on('message', (schemaName, schemaVersion, payload) => {
    console.log('Received store message request');
    microservice.getSchema(schemaName, schemaVersion, (err, schema) => {
        if (err) {
            console.error(err);
            return;
        }
        microservice.decompressMessage(schema, payload, (err, message) => {
            if (err) {
                console.error(err);
                return;
            }
            microservice.storeMessage(message, () => {
                console.log('Finished storing message');
            });
        });
    })
});

device.on('err', (err) => {
    console.error(err);
});

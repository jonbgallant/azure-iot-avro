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

const EventEmitter = require('events').EventEmitter;
const EventHubClient = require('azure-event-hubs').Client;

if (!process.env.IOT_HUB_CONNECTION_STRING) {
    console.error('Environment variable IOT_HUB_CONNECTION_STRING is not defined');
    process.exit(-1);
}

const listeners = [];
const emitter = new EventEmitter();
const client = EventHubClient.fromConnectionString(process.env.IOT_HUB_CONNECTION_STRING);

module.exports = emitter;

client.open()
    .then(client.getPartitionIds.bind(client))
    .then((partitionIds) =>
        partitionIds.map((partitionId) =>
            client.createReceiver('$Default', partitionId, { 'startAfterTime': Date.now() }).then((receiver) => {
                console.log('Created partition receiver: ' + partitionId)
                receiver.on('errorReceived', (err) => emitter.emit('error', err));
                receiver.on('message', (message) => {
                    // TODO
                    const schemaName = '';
                    const schemaVersion = '';
                    const payload = new Buffer('');
                    emitter.emit('message', schemaName, schemaVersion, payload);
                });
            })
        )
    )
    .catch((err) => emitter.emit('error', err));

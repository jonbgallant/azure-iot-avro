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

const common = require('../../../common');

const EventEmitter = require('events').EventEmitter;
const EventHubClient = require('azure-event-hubs').Client;

if (!process.env.IOT_HUB_CONNECTION_STRING) {
    console.error('Environment variable IOT_HUB_CONNECTION_STRING is not defined');
    process.exit(-1);
}

function handleError(err) {
  // TODO: add something more interesting: error reporting service, analytics, etc
  console.error(err);
}

const listeners = [];
const client = EventHubClient.fromConnectionString(process.env.IOT_HUB_CONNECTION_STRING);

console.log('Connecting to IoT Hub');
common.queue.init((err) => {
  if (err) {
    console.error(`Could not initialize queue: ${err}`);
    process.exit(-1);
  }
  client.open()
    .then(client.getPartitionIds.bind(client))
    .then((partitionIds) =>
      partitionIds.map((partitionId) =>
        client.createReceiver('$Default', partitionId, { startAfterTime: Date.now() }).then((receiver) => {
          console.log(`Created partition receiver: ${partitionId}`);
          receiver.on('errorReceived', handleError);
          receiver.on('message', (message) => {
            if (message.applicationProperties && message.applicationProperties['avro-schema']) {
              console.log('Received Avro message from IoT Hub');
              common.queue.sendDecompressionRequest(message.applicationProperties['avro-schema'], message.body, (err) => {
                if (err) {
                  handleError(err);
                  return;
                }
                console.log('Message sent to Service Bus queue');
              });
            }
          });
        })
      )
    )
    .catch(handleError);
});

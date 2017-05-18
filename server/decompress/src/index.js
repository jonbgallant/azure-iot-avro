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

const ADDRESS = 'localhost';
const PORT = 3000;

function handleError(err) {
  // TODO: add something more interesting: error reporting service, analytics, etc
  console.error(err);
}

function processNextMessage() {
  common.queue.getNextDecompressionRequest((err, schemaId, payload) => {
    if (err) {
      handleError(err);
      processNextMessage();
      return;
    }
    console.log('Received decompression request');
    common.avro.decompress(common.schema.getType(schemaId), new Buffer(payload, 'base64'), (err, message) => {
      if (err) {
        handleError(err);
        processNextMessage();
        return;
      }
      common.queue.sendStoreMessageRequest(schemaId, message, (err) => {
        if (err) {
          handleError(err);
        } else {
          console.log('Finished processing request');
        }
        processNextMessage();
      });
    });
  });
}

console.log('Initializing schemas from server');
common.schema.init(ADDRESS, PORT, (err) => {
  if (err) {
    handleError(err);
    process.exit(-1);
  }
  console.log('Initializing service bus queues');
  common.queue.init((err) => {
    if (err) {
      handleError(err);
      process.exit(-1);
    }
    console.log('Running');
    processNextMessage();
  });
});

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

const schema = require('./schema');
const queue = require('./queue');
const avro = require('./avro');

const ADDRESS = 'localhost';
const PORT = 3000;

function handleError(err) {
  // TODO: add something more interesting: error reporting service, analytics, etc
  console.error(err);
}

function processNextMessage() {
  queue.getNextDecompressionRequest((err, schemaId, payload) => {
    if (err) {
      handleError(err);
      processNextMessage();
      return;
    }
    avro.decompress(schema.getSchema(schemaId), payload, (err, message) => {
      if (err) {
        handleError(err);
      }
      queue.sendDecompressedMessage(message, (err) => {
        processNextMessage();
      });
    });
  });
}

schema.init(ADDRESS, PORT, (err) => {
  if (err) {
    handleError(err);
    process.exit(-1);
  }
  queue.init((err) => {
    if (err) {
      handleError(err);
      process.exit(-1);
    }
    processNextMessage();
  });
});

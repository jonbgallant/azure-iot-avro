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

const avro = require('avsc');

module.exports = {
  compress,
  decompress
};

function compress(type, messageData, cb) {
  if (!type.isValid(messageData)) {
    // Keep the API sync/async consistent, see https://nodejs.org/api/process.html#process_process_nexttick_callback_args
    setImmediate(() => cb(new Error('Invalid message data')));
    return;
  }

  const encoder = new avro.streams.RawEncoder(type);
  const dataChunks = [];
  encoder.on('data', (data) => dataChunks.push(data));
  encoder.on('finish', () => cb(undefined, Buffer.concat(dataChunks)));
  encoder.write(messageData);
  encoder.end();
}

function decompress(type, payload, cb) {
  const val = type.fromBuffer(payload);
  // Still wrap in a setImmediate in case this method gets more complicated
  // and we need it to be async again
  setImmediate(() => cb(undefined, val));
}

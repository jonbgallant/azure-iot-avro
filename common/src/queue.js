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

const async = require('async');

module.exports = {
  init,
  getNextDecompressionRequest,
  sendDecompressedMessage
};

const DECOMPRESSION_REQUEST_QUEUE_NAME = 'decompression_queue';
const STORE_MESSAGE_QUEUE_NAME = 'store_queue';

let serviceBusService;

function init(cb) {
  serviceBusService = azure.createServiceBusService();
  async.parallel([
    (next) => serviceBusService.createQueueIfNotExists(DECOMPRESSION_REQUEST_QUEUE_NAME, next),
    (next) => serviceBusService.createQueueIfNotExists(STORE_MESSAGE_QUEUE_NAME, next)
  ], cb);
}

function sendDecompressionRequest(schemaId, body, cb) {
  if (!serviceBusService) {
    throw new Error('Called `sendDecompressionRequest` without initializing the queue first');
  }
  serviceBusService.sendQueueMessage(DECOMPRESSION_REQUEST_QUEUE_NAME, {
    body,
    customProperties: {
      'avro-schema': schemaId
    }
  }, cb);
}

function getNextDecompressionRequest(cb) {
  if (!serviceBusService) {
    throw new Error('Called `getNextDecompressionRequest` without initializing the queue first');
  }
  serviceBusService.receiveQueueMessage(DECOMPRESSION_REQUEST_QUEUE_NAME, (err, message) => {
    if (err) {
      cb(err);
      return;
    }
    cb(undefined, message.customProperties['avro-schema'], message.body);
  });
}

function sendStoreMessageRequest(schemaId, body, cb) {
  if (!serviceBusService) {
    throw new Error('Called `sendStoreMessageRequest` without initializing the queue first');
  }
  serviceBusService.sendQueueMessage(STORE_MESSAGE_QUEUE_NAME, {
    body,
    customProperties: {
      'avro-schema': schemaId
    }
  }, cb);
}

function getNextStoreMessageRequest(cb) {
  if (!serviceBusService) {
    throw new Error('Called `getNextStoreMessageRequest` without initializing the queue first');
  }
  serviceBusService.receiveQueueMessage(STORE_MESSAGE_QUEUE_NAME, (err, message) => {
    if (err) {
      cb(err);
      return;
    }
    cb(undefined, message.customProperties['avro-schema'], message.body);
  });
}

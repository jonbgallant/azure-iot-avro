#!/usr/bin/env node
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

const spawn = require('child_process').spawn;
const path = require('path');

const isDone = {};

let errored = false;
function finalize(dir, code) {
  isDone[dir] = true;
  if (code) {
    errored = true;
  }
  for (const dir in isDone) {
    if (!isDone[dir]) {
      return;
    }
  }
  if (errored) {
    console.error('\nFinished installing dependencies, but there was an error. See the output log above.\n');
  } else {
    console.log('\nFinished installing dependencies!\n');
  }
}

function install(cwd) {
  isDone[cwd] = false;
  spawn('npm', [ 'install', '--no-progress' ], {
    cwd,
    stdio: 'inherit'
  }).on('exit', (code) => finalize(cwd, code));
}

console.log('Installing all dependencies');

install(path.join(__dirname, 'client'));
install(path.join(__dirname, 'common'));
install(path.join(__dirname, 'server', 'iot-hub-message-router'));
install(path.join(__dirname, 'server', 'decompress'));
install(path.join(__dirname, 'server', 'message'));
install(path.join(__dirname, 'server', 'schema'));

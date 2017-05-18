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

const path = require('path');
const fs = require('fs');

const SERVICE_FABRIC_CONFIG_FILENAME = 'SchemasPkg.Endpoints.txt';

module.exports = {
  getServiceFabricPort
};

function getServiceFabricPort(cb) {
    function checkDir(dir) {
        const SERVICE_FABRIC_CONFIG = path.join(dir, SERVICE_FABRIC_CONFIG_FILENAME);
        fs.exists(SERVICE_FABRIC_CONFIG, (exists) => {
            if (!exists) {
                if (dir === path.dirname(dir)) {
                    cb(undefined, undefined); // Undefined is normal behaviour when no SF endpoints are found.
                } else {
                    checkDir(path.dirname(dir));
                }
                return;
            }
            fs.readFile(SERVICE_FABRIC_CONFIG, 'utf8', (error, contents) => {
                if(error) {
                    cb(error);
                    return;
                }
                cb(undefined, contents.split(';')[3]);
            });
        });
    }
    checkDir(path.join(__dirname, '..', '..', '..'));
}
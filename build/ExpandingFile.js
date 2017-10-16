"use strict";
//
// ByteAccordion - JS library for smooth, Promise-based interaction with File and Buffer resources.
// ---
// @copyright (c) 2017 Damian Bushong <katana@odios.us>
// @license MIT license
// @url <https://github.com/damianb/ByteAccordion>
//
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
//
// ExpandingFile - provides an "expanding" file interface to ease writing of byte-level resources.
//
// TODO: provide .reset() method, probably using fs.truncate() or something.
class ExpandingFile {
    /**
     * ExpandingFile constructor
     *
     * @param  {string} path - Path to the file that we're going to be writing to.
     *
     * @return {ExpandingFile}
     */
    constructor(path) {
        this.path = path;
        this.fd = undefined;
        this.position = 0;
    }
    /**
     * Opens the file for writing based off of the path provided to the constructor.
     * Must occur before writing to the file.
     *
     * @return {Promise:void}
     */
    async open() {
        this.fd = await fs.open(this.path, 'w', 0o755);
        this.position = 0;
        return;
    }
    /**
     * Closes the file, preventing future writing.
     *
     * @return {Promise:void}
     */
    async close() {
        if (this.fd) {
            await fs.close(this.fd);
        }
        this.fd = undefined;
        this.position = 0;
        return;
    }
    /**
     * Write to the expanding file.
     *
     * @param  {Buffer|Array|string|number} input - What to write to the file?
     *
     * @return {Promise:number} - Returns how many bytes have been written to the file so far.
     */
    async write(input) {
        if (!this.fd) {
            throw new Error('File does not yet appear to be opened.');
        }
        let inBuffer = null;
        if (Buffer.isBuffer(input)) {
            inBuffer = input;
        }
        else if (Array.isArray(input)) {
            // possible typescript bug - typescript can't seem to handle the overloading
            //   when we combine the Array check and string check.
            inBuffer = Buffer.from(input);
        }
        else if (typeof input === 'string') {
            inBuffer = Buffer.from(input);
        }
        else {
            inBuffer = Buffer.from([input]);
        }
        const { bytesWritten } = await fs.write(this.fd, inBuffer, 0, inBuffer.length, this.position);
        this.position += bytesWritten;
        return this.position;
    }
}
exports.ExpandingFile = ExpandingFile;

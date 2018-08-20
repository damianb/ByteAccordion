"use strict";
//
// ByteAccordion - JS library for smooth, Promise-based interaction with File and Buffer resources.
//
// @copyright (c) 2018 Damian Bushong <katana@odios.us>
// @license MIT license
// @url <https://github.com/damianb/ByteAccordion>
//
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
class ExpandingFile {
    /**
     * ExpandingFile is a class designed to wrap around node.js file to allow for more fluid writing capabilities,
     *   making it possible to just write to your files and not care about their lengths, inputs, or stream events.
     *   Create an ExpandingFile and just call write as much as you need.
     *
     * @param  {string} path - Path to the file that we're going to be writing to.
     * @return {ExpandingFile}
     *
     * @example
     * ```
     * import { ExpandingFile } from 'byteaccordion'
     * sbuf = new ExpandingFile('/path/to/file.txt')
     *
     * await sbuf.write('test')
     * ```
     */
    constructor(path) {
        this.path = path;
        this.fd = undefined;
        this.position = 0;
    }
    /**
     * Opens the file for writing based off of the path provided to the constructor.
     *   Must occur before writing to the file.
     *
     * @return {Promise<void>}
     *
     * @example
     * ```
     * const filepath = '/path/to/file.txt'
     * const sbuf = new ExpandingFile(filepath)
     * await sbuf.open()
     * // now able to write to sbuf!
     * ```
     */
    async open() {
        this.fd = await fs.open(this.path, 'w', 0o755);
        this.position = 0;
        return;
    }
    /**
     * Closes the file, preventing future writing.
     *
     * @return {Promise<void>}
     *
     * @example
     * ```
     * const filepath = '/path/to/file.txt'
     * const sbuf = new ExpandingFile(filepath)
     * await sbuf.open()
     * // now able to write with sbuf!
     *
     * // ...
     *
     * await sbuf.close()
     * // no longer able to read from sbuf, state is reset and clean.
     * ```
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
     * @param  input - What to write to the file?
     * @return {Promise<number>} - Returns how many bytes have been written to the file so far.
     *
     * @example
     * ```
     * const filepath = '/path/to/file.txt'
     * const sbuf = new ExpandingFile(filePath)
     * await sbuf.write('test')
     * await sbuf.write('test2')
     *
     * // the file, when opened, will contain "testtest2"
     * ```
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
//# sourceMappingURL=ExpandingFile.js.map
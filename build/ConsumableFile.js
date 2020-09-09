"use strict";
//
// ByteAccordion - JS library for smooth, Promise-based interaction with File and Buffer resources.
//
// @copyright (c) 2020 Damian Bushong <katana@odios.us>
// @license MIT license
// @url <https://github.com/damianb/ByteAccordion>
//
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsumableFile = void 0;
const fs = require("fs");
class ConsumableFile {
    /**
     * ConsumableFile is a class designed to, like ConsumableBuffer, wrap around node.js file descriptors to allow for more fluid seeking/reading capabilities,
     *   moving logic out of the way of interacting with data.  Give it a filepath, call read and it will simply advance through the file as you read.
     *
     * @param  path - Path to the file that we're going to be "consuming".
     * @return {ConsumableFile}
     *
     * @example
     * ```
     * import { ConsumableFile } from 'byteaccordion'
     * const filepath = '/path/to/file.txt'
     * const cbuf = new ConsumableFile(filepath)
     *
     * const readFile = async (cbuf) => {
     *   await cbuf.reset()
     *   // cbuf.reset() here resets stream back to "original" state we received it in
     *   await cbuf.seek(6)
     *   // skips forward 6 bytes. NOT CHARACTERS, BYTES!
     *   let rdBuffer = await cbuf.read(4)
     *   // reads the next 4 bytes and returns a promise - await lets it resolve before storing into rdBuffer
     *   console.log(rdBuffer.toString()) // and this also oututs "TEST"
     * }
     * readFile(cbuf)
     * ```
     */
    constructor(path) {
        this.path = path;
        this.fh = this.filesize = undefined;
        this.position = 0;
    }
    /**
     * Opens the file for reading based off of the path provided to the constructor.
     *
     * @return {Promise<void>}
     *
     * @throws {Error} - Throws when the path provided isn't a readable file.
     *
     * @example
     * ```
     * const filepath = '/path/to/file.txt'
     * const cbuf = new ConsumableFile(filepath)
     * await cbuf.open()
     * // now able to read from cbuf!
     * ```
     */
    async open() {
        try {
            await fs.promises.access(this.path, fs.constants.R_OK);
        }
        catch (err) {
            throw new Error('ConsumableFile.open expects the path provided to be readable.');
        }
        this.fh = await fs.promises.open(this.path, 'r', 0o666);
        const stats = await this.fh.stat();
        this.filesize = stats.size;
        this.position = 0;
    }
    /**
     * Closes the file, preventing future reading.
     *
     * @return {Promise<void>}
     *
     * @example
     * ```
     * const filepath = '/path/to/file.txt'
     * const cbuf = new ConsumableFile(filepath)
     * await cbuf.open()
     * // now able to read from cbuf!
     *
     * // ...
     *
     * await cbuf.close()
     * // no longer able to read from cbuf, state is reset and clean.
     * ```
     */
    async close() {
        if (this.fh !== undefined) {
            await this.fh.close();
        }
        this.fh = this.filesize = undefined;
        this.position = 0;
    }
    /**
     * Resets the ConsumableFile to its origin position.
     *
     * @return {Promise<void>}
     *
     * @example
     * ```
     * const filepath = '/path/to/file.txt'
     * const cbuf = new ConsumableFile(filepath)
     * await cbuf.open()
     *
     * let readBuffer = await cbuf.read(2)
     * // readBuffer would equal <Buffer 54 45>
     *
     * await cbuf.reset()
     *
     * readBuffer = await cbuf.read(2)
     * // readBuffer would again equal <Buffer 54 45>
     * ```
     */
    // todo: change to a normal method. currently ignored as going from Promise to non-Promise return will result in an API break.
    // eslint-disable-next-line @typescript-eslint/require-await
    async reset() {
        this.position = 0;
    }
    /**
     * Reads within the file.
     *
     * @param  bytes - The number of bytes to read and advance within the buffer.
     * @return {Promise<Buffer>} - Returns a buffer containing the next selected bytes from the ConsumableFile.
     *
     * @throws {Error} - Throws when the file hasn't yet been opened.
     * @throws {Error} - Throws when the bytes parameter isn't a finite number, is NaN, or is <= 0.
     * @throws {RangeError} - Throws when we try to read beyond the file's contents.
     * @throws {Error} - Throws if we somehow read less than the number of bytes requested.
     *
     * @example
     * ```
     * const filepath = '/path/to/file.txt'
     * const cbuf = new ConsumableFile(filepath)
     * await cbuf.open()
     *
     * const readBuffer = await cbuf.read(2)
     * // readBuffer would equal <Buffer 54 45>
     * ```
     */
    async read(bytes) {
        if (this.fh === undefined || this.filesize === undefined) {
            throw new Error('File does not appear to have been opened.');
        }
        if (isNaN(bytes) || !isFinite(bytes) || bytes < 0) {
            throw new Error('Bytes parameter must be a positive integer.');
        }
        if (bytes === 0) {
            return Buffer.alloc(0);
        }
        if ((this.position + bytes) > this.filesize) {
            throw new RangeError('File exhausted; attempted to read beyond file.');
        }
        const { bytesRead, buffer } = await this.fh.read(Buffer.alloc(bytes), 0, bytes, this.position);
        this.position += bytes;
        if (bytesRead !== bytes) {
            throw new Error('Failed to read number of bytes requested.'); // ???
        }
        return buffer;
    }
    /**
     * Seeks within the file to reposition for read, relative to the current position.
     *
     * @param  bytes - The number of bytes to shift within the buffer; this can be negative.
     * @return {Promise<void>}
     *
     * @see ConsumableFile.aseek
     *
     * @example
     * ```
     * const filepath = '/path/to/file.txt'
     * const cbuf = new ConsumableFile(filepath)
     * await cbuf.open()
     * await cbuf.seek(1)
     *
     * // next read or seek will start one character over, so if we did...
     * const readBuffer = await cbuf.read(1)
     * // ...it would equal <Buffer 45>
     * ```
     */
    async seek(bytes) {
        return this.aseek(this.position += bytes);
    }
    /**
     * Seeks within the file to reposition for read, using an absolute position.
     *
     * @param  bytes - How many bytes into the file do we want to seek?
     * @return {Promise<void>}
     *
     * @throws {Error} - Throws when the file hasn't been opened yet.
     * @throws {Error} - Throws when the bytes parameter isn't a finite number, is NaN, or is <= 0.
     * @throws {RangeError} - Throws when we try to seek beyond the file's contents.
     *
     * @example
     * ```
     * const filepath = '/path/to/file.txt'
     * const cbuf = new ConsumableFile(filepath)
     * await cbuf.open()
     * await cbuf.aseek(1)
     *
     * // next read or seek will start where we aseek()'d to, so if we did...
     * let readBuffer = await cbuf.read(1)
     * // ...it would equal <Buffer 45>
     *
     * // and if we aseek()'d to 1 again...
     * await cbuf.aseek(1)
     * // and read one byte...
     * readBuffer = await cbuf.read(1)
     * // we'd still get the same thing - <Buffer 45>
     * ```
     */
    // todo: change to a normal method. currently ignored as going from Promise to non-Promise return will result in an API break.
    // eslint-disable-next-line @typescript-eslint/require-await
    async aseek(bytes) {
        if (this.fh === undefined || this.filesize === undefined) {
            throw new Error('File does not appear to have been opened.');
        }
        if (isNaN(bytes) || !isFinite(bytes) || bytes <= 0) {
            throw new Error('Bytes parameter must be a positive integer.');
        }
        if (this.position > this.filesize) {
            throw new RangeError('File exhausted; attempted to seek beyond file.');
        }
        this.position = Math.floor(bytes);
    }
}
exports.ConsumableFile = ConsumableFile;
//# sourceMappingURL=ConsumableFile.js.map
"use strict";
//
// ByteAccordion - JS library for smooth, Promise-based interaction with File and Buffer resources.
// ---
// @copyright (c) 2017 Damian Bushong <katana@odios.us>
// @license MIT license
// @url <https://github.com/damianb/ByteAccordion>
//
Object.defineProperty(exports, "__esModule", { value: true });
//
// ConsumableBuffer - provides a "consumable" buffer stream to ease reading/parsing of byte-level resources.
//
class ConsumableBuffer {
    /**
     * ConsumableBuffer constructor
     *
     * @param  {Buffer} buf - Starting buffer that we want to work with.
     * @return {ConsumableBuffer}
     */
    constructor(buf) {
        this.originalBuffer = buf;
        this.buf = buf;
    }
    /**
     * Resets the returned "buffer" to the original one previously passed in.
     *
     * @return {Promise:void}
     */
    async reset() {
        this.buf = this.originalBuffer;
        return;
    }
    /**
     * Reads and "consumes" the buffer, returning everything read and advancing through the buffer with each read call.
     * Read buffer contents will not be available for read again unless the ConsumableBuffer is reset.
     *
     * @param  {number} - The number of bytes to read and advance within the buffer.
     * @return {Promise:Buffer} - Returns a buffer containing the next selected bytes from the ConsumableBuffer.
     */
    async read(bytes) {
        if (isNaN(bytes) || !isFinite(bytes) || bytes <= 0) {
            throw new Error('Bytes parameter must be a positive integer.');
        }
        bytes = Math.floor(bytes);
        if (bytes > this.buf.length) {
            throw new RangeError('Buffer exhausted; attempted to read beyond buffer.');
        }
        const newBuffer = this.buf.slice(0, bytes);
        this.buf = this.buf.slice(bytes);
        return newBuffer;
    }
    /**
     * Seeks ahead a number of bytes in the current buffer.
     * This WILL NOT seek backwards - use ConsumableBuffer.reset()!
     *
     * @param  {number} - The number of bytes to advance within the buffer.
     * @return {Promise:void}
     */
    async seek(bytes) {
        if (bytes > this.buf.length) {
            throw new RangeError('Buffer exhausted; attempted to seek beyond buffer.');
        }
        await this.read(bytes);
        return;
    }
    /**
     * Seeks absolutely within the *original* buffer.
     * Provided for compatibility with ConsumableFile.
     * This is just a shortcut method for ConsumableBuffer.reset() && ConsumableBuffer.seek(bytes).
     *
     * @param  {number} - How many bytes into the original buffer do we want to seek?
     * @return {Promise:void}
     */
    async aseek(bytes) {
        await this.reset();
        await this.seek(bytes);
        return;
    }
}
exports.ConsumableBuffer = ConsumableBuffer;

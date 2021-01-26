"use strict";
//
// ByteAccordion - JS library for smooth, Promise-based interaction with File and Buffer resources.
//
// @copyright (c) 2020 Damian Bushong <katana@odios.us>
// @license MIT license
// @url <https://github.com/damianb/ByteAccordion>
//
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpandingBuffer = void 0;
class ExpandingBuffer {
    /**
     * ExpandingBuffer is a class designed to wrap around node.js buffers to allow for more fluid writing capabilities,
     *   making it possible to just write to your buffers and not care about their lengths.
     *   Create an ExpandingBuffer and just call write as much as you need.
     *
     * @return {ExpandingBuffer}
     *
     * @example
     * ```
     * import { ExpandingBuffer } from 'byteaccordion'
     * sbuf = new ExpandingBuffer()
     *
     * await sbuf.write('test')
     * ```
     */
    constructor() {
        this.buf = Buffer.alloc(0);
        this.position = 0;
    }
    /**
     * Resets the expanding "buffer" to an empty state.
     *
     * @return {Promise<void>}
     *
     * @example
     * ```
     * const sbuf = new ExpandingBuffer()
     * await sbuf.write('test')
     * await sbuf.reset()
     *
     * // sbuf is now back to an empty, clean state
     * ```
     */
    // todo: change to a normal method. currently ignored as going from Promise to non-Promise return will result in an API break.
    // eslint-disable-next-line @typescript-eslint/require-await
    async reset() {
        this.buf = Buffer.alloc(0);
        this.position = 0;
    }
    /**
     * Write to the expanding "buffer".
     *
     * @param  input - What to write to the buffer?
     * @return {Promise<number>} - Returns the length of the current buffer.
     *
     * @example
     * ```
     * const sbuf = new ExpandingBuffer()
     * await sbuf.write('test')
     * await sbuf.write('test2')
     *
     * // sbuf.buf, when dumped, will be a buffer containing "testtest2"
     * ```
     */
    // Must be async to satisfy the ExpandingResource interface
    // eslint-disable-next-line @typescript-eslint/require-await
    async write(input) {
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
        this.buf = Buffer.concat([this.buf, inBuffer], this.buf.length + inBuffer.length);
        return (this.position = this.buf.length);
    }
}
exports.ExpandingBuffer = ExpandingBuffer;
//# sourceMappingURL=ExpandingBuffer.js.map
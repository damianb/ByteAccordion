/// <reference types="node" />
import { ConsumableResource } from './ConsumableResource';
export declare class ConsumableBuffer implements ConsumableResource {
    /**
     * The original Buffer instance we were provided to work with.
     *
     * @private
     */
    originalBuffer: Buffer;
    /**
     * The current working Buffer instance.
     */
    buf: Buffer;
    /**
     * ConsumableBuffer is a class designed to wrap around node.js buffers to allow for more fluid seeking/reading capabilities,
     *   moving logic out of the way of interacting with data.  Give it a buffer, call read and it will simply advance through that buffer as you read.
     *
     * @param  buf - Starting buffer that we want to work with.
     * @return {ConsumableBuffer}
     *
     * @example
     * ```
     * import { ConsumableBuffer } from 'ByteAccordion'
     * const myBuffer = Buffer.from('SUPER TEST BUFFER HERE')
     * cbuf = new ConsumableBuffer(myBuffer)
     *
     * await cbuf.seek(6)
     * // skips forward 6 *bytes*.
     *
     * let rdBuffer = await cbuf.read(4)
     * // reads the next 4 bytes and returns a promise
     * //   await lets it resolve before storing into rdBuffer
     *
     * console.log(rdBuffer.toString()) // and this also outputs "TEST"
     * ```
     */
    constructor(buf: Buffer);
    /**
     * Resets the returned "buffer" to the original one previously passed in.
     *
     * @return {Promise<void>}
     *
     * @example
     * ```
     * const myBuffer = Buffer.from('TEST')
     * const cbuf = new ConsumableBuffer(myBuffer)
     * const resetBuffer = await cbuf.reset()
     *
     * // myBuffer and resetBuffer possess the exact same contents
     * ```
     */
    reset(): Promise<void>;
    /**
     * Reads and "consumes" the buffer, returning everything read and advancing through the buffer with each read call.
     * Previously read buffer contents will not be available for read again unless the ConsumableBuffer is reset.
     *
     * @param  bytes - The number of bytes to read and advance within the buffer.
     * @return {Promise<Buffer>} - Returns a buffer containing the next selected bytes from the ConsumableBuffer.
     *
     * @throws {Error} - Throws when the bytes parameter isn't a finite number, is NaN, or is <= 0.
     * @throws {RangeError} - Throws when we try to read beyond the Buffer's contents.
     *
     * @example
     * ```
     * const myBuffer = Buffer.from('TEST')
     * const cbuf = new ConsumableBuffer(myBuffer)
     * const readBuffer = await cbuf.read(2)
     *
     * // readBuffer would equal <Buffer 54 45>
     * ```
     */
    read(bytes: number): Promise<Buffer>;
    /**
     * Seeks ahead a number of bytes in the current buffer.
     * This WILL NOT seek backwards - use ConsumableBuffer.reset()!
     *
     * @param  bytes - The number of bytes to advance within the buffer.
     * @return {Promise<void>}
     *
     * @throws {RangeError} - Throws when we try to seek beyond the Buffer's contents.
     *
     * @example
     * ```
     * const myBuffer = Buffer.from('TEST')
     * const cbuf = new ConsumableBuffer(myBuffer)
     * await cbuf.seek(1)
     *
     * // next read or seek will start one character over, so if we did...
     * const readBuffer = await cbuf.read(1)
     * // ...it would equal <Buffer 45>
     * ```
     */
    seek(bytes: number): Promise<void>;
    /**
     * Seeks absolutely within the *original* buffer.
     *
     * @param  bytes - How many bytes into the original buffer do we want to seek?
     * @return {Promise<void>}
     *
     * @example
     * ```
     * const myBuffer = Buffer.from('TEST')
     * const cbuf = new ConsumableBuffer(myBuffer)
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
    aseek(bytes: number): Promise<void>;
}

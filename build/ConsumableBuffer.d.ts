/// <reference types="node" />
import { ConsumableResource } from './ConsumableResource';
export declare class ConsumableBuffer implements ConsumableResource {
    /**
     * The original Buffer instance we were provided to work with.
     *
     * @type {Buffer}
     */
    originalBuffer: Buffer;
    /**
     * The current working Buffer instance.
     *
     * @type {Buffer}
     */
    buf: Buffer;
    /**
     * ConsumableBuffer constructor
     *
     * @param  {Buffer} buf - Starting buffer that we want to work with.
     * @return {ConsumableBuffer}
     */
    constructor(buf: Buffer);
    /**
     * Resets the returned "buffer" to the original one previously passed in.
     *
     * @return {Promise:void}
     */
    reset(): Promise<void>;
    /**
     * Reads and "consumes" the buffer, returning everything read and advancing through the buffer with each read call.
     * Read buffer contents will not be available for read again unless the ConsumableBuffer is reset.
     *
     * @param  {number} - The number of bytes to read and advance within the buffer.
     * @return {Promise:Buffer} - Returns a buffer containing the next selected bytes from the ConsumableBuffer.
     */
    read(bytes: number): Promise<Buffer>;
    /**
     * Seeks ahead a number of bytes in the current buffer.
     * This WILL NOT seek backwards - use ConsumableBuffer.reset()!
     *
     * @param  {number} - The number of bytes to advance within the buffer.
     * @return {Promise:void}
     */
    seek(bytes: number): Promise<void>;
    /**
     * Seeks absolutely within the *original* buffer.
     * Provided for compatibility with ConsumableFile.
     * This is just a shortcut method for ConsumableBuffer.reset() && ConsumableBuffer.seek(bytes).
     *
     * @param  {number} - How many bytes into the original buffer do we want to seek?
     * @return {Promise:void}
     */
    aseek(bytes: number): Promise<void>;
}

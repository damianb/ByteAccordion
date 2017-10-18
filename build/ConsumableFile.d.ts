/// <reference types="node" />
/**
 * ByteAccordion - JS library for smooth, Promise-based interaction with File and Buffer resources.
 *
 * @copyright (c) 2017 Damian Bushong <katana@odios.us>
 * @license MIT license
 * @url <https://github.com/damianb/ByteAccordion>
 */
import { ConsumableResource } from './ConsumableResource';
export declare class ConsumableFile implements ConsumableResource {
    /**
     * Path to the file to be consumed for reading.
     *
     * @private
     */
    path: string;
    /**
     * The file descriptor of the file we're reading from.
     *
     * @private
     */
    fd: number | undefined;
    /**
     * The size of the file we're consuming, in bytes.
     *
     * @private
     */
    filesize: number | undefined;
    /**
     * How far into the file we've read, in bytes.
     */
    position: number;
    /**
     * ConsumableFile is a class designed to, like ConsumableBuffer, wrap around node.js file descriptors to allow for more fluid seeking/reading capabilities,
     *   moving logic out of the way of interacting with data.  Give it a filepath, call read and it will simply advance through the file as you read.
     *
     * @param  path - Path to the file that we're going to be "consuming".
     * @return {ConsumableFile}
     *
     * @example
     * ```
     * import { ConsumableFile } from 'ByteAccordion'
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
    constructor(path: string);
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
    open(): Promise<void>;
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
    close(): Promise<void>;
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
    reset(): Promise<void>;
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
    read(bytes: number): Promise<Buffer>;
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
    seek(bytes: number): Promise<void>;
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
    aseek(bytes: number): Promise<void>;
}

/// <reference types="node" />
import { ConsumableResource } from './ConsumableResource';
export declare class ConsumableFile implements ConsumableResource {
    /**
     * Path to the file to be consumed for reading.
     *
     * @type {string}
     */
    path: string;
    /**
     * The file descriptor of the file we're reading from.
     *
     * @type {[type]}
     */
    fd: number | undefined;
    /**
     * The size of the file we're consuming.
     *
     * @type {[type]}
     */
    filesize: number | undefined;
    /**
     * How far into the file we've read.
     *
     * @type {number}
     */
    position: number;
    /**
     * ConsumableFile constructor
     *
     * @param  {String} path - Path to the file that we're going to be "consuming".
     *
     * @return {ConsumableFile}
     */
    constructor(path: string);
    /**
     * Opens the file for reading based off of the path provided to the constructor.
     *
     * @return {Promise:void}
     */
    open(): Promise<void>;
    /**
     * Closes the file, preventing future reading.
     *
     * @return {Promise:void}
     */
    close(): Promise<void>;
    /**
     * Resets the ConsumableFile to its origin position.
     *
     * @return {Promise:void}
     */
    reset(): Promise<void>;
    /**
     * Reads within the file.
     *
     * @param  {number} bytes - The number of bytes to read and advance within the buffer.
     *
     * @return {Promise:Buffer} - Returns a buffer containing the next selected bytes from the ConsumableFile.
     */
    read(bytes: number): Promise<Buffer>;
    /**
     * Seeks within the file to reposition for read, relative to the current position.
     *
     * @param  {number} bytes - The number of bytes to shift within the buffer; this can be negative.
     *
     * @return {Promise:void} - Returns undefined.
     */
    seek(bytes: number): Promise<void>;
    /**
     * Seeks within the file to reposition for read, using an absolute position.
     *
     * @param  {number} bytes - How many bytes into the file do we want to seek?
     *
     * @return {Promise:void} - Returns undefined.
     */
    aseek(bytes: number): Promise<void>;
}

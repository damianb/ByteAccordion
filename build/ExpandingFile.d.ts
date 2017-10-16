/// <reference types="node" />
import { ExpandingResource } from './ExpandingResource';
export declare class ExpandingFile implements ExpandingResource {
    /**
     * Path to the file we're expanding into.
     *
     * @type {string}
     */
    path: string;
    /**
     * File descriptor for the file we're writing into.
     *
     * @type {number|undefined}
     */
    fd: number | undefined;
    /**
     * How far into the file we are, currently.
     *
     * @type {number}
     */
    position: number;
    /**
     * ExpandingFile constructor
     *
     * @param  {string} path - Path to the file that we're going to be writing to.
     *
     * @return {ExpandingFile}
     */
    constructor(path: string);
    /**
     * Opens the file for writing based off of the path provided to the constructor.
     * Must occur before writing to the file.
     *
     * @return {Promise:void}
     */
    open(): Promise<void>;
    /**
     * Closes the file, preventing future writing.
     *
     * @return {Promise:void}
     */
    close(): Promise<void>;
    /**
     * Write to the expanding file.
     *
     * @param  {Buffer|Array|string|number} input - What to write to the file?
     *
     * @return {Promise:number} - Returns how many bytes have been written to the file so far.
     */
    write(input: Buffer | any[] | string | number): Promise<number>;
}

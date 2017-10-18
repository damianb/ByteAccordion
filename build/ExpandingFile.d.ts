/// <reference types="node" />
import { ExpandingResource } from './ExpandingResource';
export declare class ExpandingFile implements ExpandingResource {
    /**
     * Path to the file we're writing to.
     *
     * @private
     */
    path: string;
    /**
     * File descriptor for the file we're writing to.
     *
     * @private
     */
    fd: number | undefined;
    /**
     * How far into the file we are currently, in bytes.
     */
    position: number;
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
     * import { ExpandingFile } from 'ByteAccordion'
     * sbuf = new ExpandingFile('/path/to/file.txt')
     *
     * await sbuf.write('test')
     * ```
     */
    constructor(path: string);
    /**
     * Opens the file for writing based off of the path provided to the constructor.
     *   Must occur before writing to the file.
     *
     * @return {Promise:void}
     *
     * @example
     * ```
     * const filepath = '/path/to/file.txt'
     * const sbuf = new ExpandingFile(filepath)
     * await sbuf.open()
     * // now able to write to sbuf!
     * ```
     */
    open(): Promise<void>;
    /**
     * Closes the file, preventing future writing.
     *
     * @return {Promise:void}
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
    close(): Promise<void>;
    /**
     * Write to the expanding file.
     *
     * @param  input - What to write to the file?
     * @return {Promise:number} - Returns how many bytes have been written to the file so far.
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
    write(input: Buffer | number[] | string | number): Promise<number>;
}

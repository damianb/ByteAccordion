/// <reference types="node" />
import { ExpandingResource } from './ExpandingResource';
export declare class ExpandingBuffer implements ExpandingResource {
    /**
     * The current working Buffer instance.
     *
     * @type {Buffer}
     */
    buf: Buffer;
    /**
     * How long the current Buffer instance is.
     * Provided for interface compatibility with ExpandingFile.
     *
     * @type {number}
     */
    position: number;
    /**
     * ExpandingBuffer constructor
     *
     * @return {ExpandingBuffer}
     */
    constructor();
    /**
     * Resets the expanding "buffer" to an empty state.
     *
     * @return {Promise:void} - returns the emptied buffer.
     */
    reset(): Promise<void>;
    /**
     * Write to the expanding "buffer".
     *
     * @param  {Buffer|Array|string|number} input - What to write to the buffer?
     *
     * @return {Promise:number} - Returns the length of the current buffer.
     */
    write(input: Buffer | any[] | string | number): Promise<number>;
}

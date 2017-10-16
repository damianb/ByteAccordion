/// <reference types="node" />
import * as fs from 'fs-extra';
import { ExpandingFile } from './ExpandingFile';
export interface StreamOptions {
    fd?: number;
    flags?: string;
    mode?: number;
    autoClose?: boolean;
    start?: number;
    end?: number;
}
export interface PumpResult {
    offset: number;
    wrote: number;
}
export declare class StreamPipeline {
    /**
     * The filesystem WriteStream instance we'll be pumping all input into.
     *
     * @type {fs.WriteStream|undefined}
     */
    destination: fs.WriteStream | undefined;
    /**
     * The ExpandingFile instance we originally started with.
     *
     * @type {ExpandingFile|undefined}
     */
    _destination: ExpandingFile | undefined;
    /**
     * StreamPipeline constructor
     * @return {StreamPipeline}
     */
    constructor();
    /**
     * Loads the specified destination and prepares the pipeline to it.
     *
     * @param  {ExpandingFile} dest - The ExpandingFile instance for the file to write to. NOT compatible with ExpandingBuffer.
     * @return {Promise:void}
     */
    load(dest: ExpandingFile): Promise<void>;
    /**
     * Pumps the given "source" contents into the destination specified in StreamPipeline.load().
     *
     * @param  {Buffer|Number|String} source - The source Buffer, file descriptor (integer), or filepath (string) to read from.
     * @param  {Number} start - (optional) Start point for reading, passed to fs.createReadStream to identify a section to read from.
     * @param  {Number} length - (optional) Identifies how many bytes to read and pump into the destination.
     * @return {Promise:Object} - Returns an object containing the offset and length of what was just written to the destination.
     */
    pump(source: Buffer | number | string, start?: number, length?: number): Promise<PumpResult>;
    /**
     * Handles the intricate part of hooking up the ReadStream to the WriteStream.
     *   Yes, this manually creates a promise - we need to, instead of making an async function, in order to
     *   properly work with the stream events.
     *
     * @private
     * @param  {Stream.Readable|Buffer} content - The content to pipe into the destination stream.
     * @return {Promise:Object} - Returns an object containing the offset and length of what was just written to the destination.
     */
    _pump(content: fs.ReadStream | Buffer): Promise<PumpResult>;
}

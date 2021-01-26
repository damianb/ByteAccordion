/// <reference types="node" />
import * as fs from 'fs';
import { FileHandle } from 'fs/promises';
import { ExpandingFile } from './ExpandingFile';
/**
 * @private
 * @hidden
 * @ignore
 */
export interface StreamOptions {
    fd?: number;
    flags?: string;
    mode?: number;
    autoClose?: boolean;
    start?: number;
    end?: number;
}
/**
 * The interface abstraction for results when calling StreamPipeline.pump().
 */
export interface PumpResult {
    /**
     * How far into the file was this content written?
     */
    offset: number;
    /**
     * How much did we just write to the file?
     */
    wrote: number;
}
export declare class StreamPipeline {
    /**
     * The filesystem WriteStream instance we'll be pumping all input into.
     *
     * @private
     */
    destination: fs.WriteStream | undefined;
    /**
     * The ExpandingFile instance we originally started with.
     *
     * @private
     */
    sbuf: ExpandingFile | undefined;
    /**
     * StreamPipeline is a class designed to wrap around ExpandingFile instances to specifically aid in copying large chunks of files into the destination,
     *   making it ideal for use with custom archive formats with the ability to just write large chunks to your files piece by piece and not care about anything like stream events.
     *   Create a StreamPipeline and pump as many chunks into the file as you need.
     *
     * @return {StreamPipeline}
     *
     * @example
     * ```
     * import { ExpandingFile, StreamPipeline } from 'byteaccordion'
     * sbuf = new ExpandingFile('/path/to/file/to/write/to.txt')
     * sfile = new StreamPipeline()
     *
     * await sbuf.open()
     * await sfile.load(sbuf)
     *
     * await sfile.pump(Buffer.from('TEST'))
     *
     * // note that this shines when combined with reads from larger files
     * //   due to the heavy use of streams when reading and writing.
     * //   (it works great when building archives!)
     * ```
     */
    constructor();
    /**
     * Loads the specified destination and prepares the pipeline to it.
     *
     * @param  dest - The ExpandingFile instance for the file to write to. **NOT compatible with ExpandingBuffer.**
     * @return {Promise<void>}
     */
    load(dest: ExpandingFile): Promise<void>;
    /**
     * Pumps the given "source" contents into the destination specified in StreamPipeline.load().
     *
     * @param  source - The source Buffer, file descriptor (integer), or filepath (string) to read from.
     * @param  start - (optional) Start point for reading, passed to fs.createReadStream to identify a section to read from.
     * @param  length - (optional) Identifies how many bytes to read and pump into the destination.
     * @return {Promise<PumpResult>} - Returns an object containing the offset and length of what was just written to the destination.
     */
    pump(source: Buffer | FileHandle | string, start?: number, length?: number): Promise<PumpResult>;
    /**
     * Handles the intricate part of hooking up the ReadStream to the WriteStream.
     *   Yes, this manually creates a promise - we need to, instead of making an async function, in order to
     *   properly work with the stream events.
     *
     * @private
     * @param  content - The content to pipe into the destination stream.
     * @return {Promise<PumpResult>} - Returns an object containing the offset and length of what was just written to the destination.
     */
    _pump(content: fs.ReadStream | Buffer): Promise<PumpResult>;
}

"use strict";
//
// ByteAccordion - JS library for smooth, Promise-based interaction with File and Buffer resources.
//
// @copyright (c) 2020 Damian Bushong <katana@odios.us>
// @license MIT license
// @url <https://github.com/damianb/ByteAccordion>
//
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamPipeline = void 0;
const fs = require("fs");
class StreamPipeline {
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
    constructor() {
        this.destination = this.sbuf = undefined;
    }
    /**
     * Loads the specified destination and prepares the pipeline to it.
     *
     * @param  dest - The ExpandingFile instance for the file to write to. **NOT compatible with ExpandingBuffer.**
     * @return {Promise<void>}
     */
    // todo: change to a normal method. currently ignored as going from Promise to non-Promise return will result in an API break.
    // eslint-disable-next-line @typescript-eslint/require-await
    async load(dest) {
        if (dest.fh === undefined) {
            throw new Error('StreamPipeline.load expects an already-opened ExpandingFile instance.');
        }
        this.sbuf = dest;
        const streamOpts = {
            fd: dest.fh.fd,
            flags: 'w',
            mode: 0o755,
            autoClose: false
        };
        this.destination = fs.createWriteStream('', streamOpts);
    }
    /**
     * Pumps the given "source" contents into the destination specified in StreamPipeline.load().
     *
     * @param  source - The source Buffer, file descriptor (integer), or filepath (string) to read from.
     * @param  start - (optional) Start point for reading, passed to fs.createReadStream to identify a section to read from.
     * @param  length - (optional) Identifies how many bytes to read and pump into the destination.
     * @return {Promise<PumpResult>} - Returns an object containing the offset and length of what was just written to the destination.
     */
    async pump(source, start, length) {
        let fh = null;
        if (Buffer.isBuffer(source)) {
            return this._pump(source);
        }
        else if ((typeof source) === 'string') {
            try {
                await fs.promises.access(source, fs.constants.R_OK);
            }
            catch (err) {
                throw new Error('StreamPipeline.pump expects the source path provided to exist and be readable.');
            }
            fh = await fs.promises.open(source, 'r', 0o755);
        }
        else {
            fh = source;
            try {
                await fh.stat();
            }
            catch (err) {
                // got an int, but it doesn't seem to be a file descriptor...
                throw new TypeError('StreamPipeline.pump expects either a Buffer, file descriptor or filepath for a source.');
            }
        }
        const streamOpts = {
            fd: fh.fd,
            flags: 'r',
            mode: 0o755,
            autoClose: false
        };
        if (start !== undefined) {
            streamOpts.start = start;
            if (length !== undefined) {
                streamOpts.end = start + length - 1;
            }
        }
        const content = fs.createReadStream('', streamOpts);
        const res = await this._pump(content);
        if (typeof source === 'string') {
            await fh.close();
        }
        return res;
    }
    /**
     * Handles the intricate part of hooking up the ReadStream to the WriteStream.
     *   Yes, this manually creates a promise - we need to, instead of making an async function, in order to
     *   properly work with the stream events.
     *
     * @private
     * @param  content - The content to pipe into the destination stream.
     * @return {Promise<PumpResult>} - Returns an object containing the offset and length of what was just written to the destination.
     */
    // NO, TYPESCRIPT-ESLINT. THIS CANNOT BE WRITTEN AS AN ASYNC FUNCTION YOU STUPID OPINIONATED FUCKS.
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    _pump(content) {
        return new Promise((resolve, reject) => {
            if (Buffer.isBuffer(content)) {
                if (this.sbuf === undefined || this.destination === undefined) {
                    return;
                }
                this.destination.write(content, () => {
                    if (this.sbuf === undefined) {
                        return;
                    }
                    const oldPosition = this.sbuf.position;
                    this.sbuf.position += content.length;
                    const res = { offset: oldPosition, wrote: content.length };
                    return resolve(res);
                });
            }
            else {
                // note: we're assuming fs.ReadStream here
                if (this.destination === undefined) {
                    return;
                }
                content.on('end', () => {
                    if (this.sbuf === undefined) {
                        return;
                    }
                    content.unpipe(this.destination);
                    const oldPosition = this.sbuf.position;
                    this.sbuf.position += content.bytesRead;
                    const res = { offset: oldPosition, wrote: content.bytesRead };
                    return resolve(res);
                });
                content.on('error', (err) => reject(err));
                content.pipe(this.destination, { end: false });
            }
        });
    }
}
exports.StreamPipeline = StreamPipeline;
//# sourceMappingURL=StreamPipeline.js.map
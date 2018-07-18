"use strict";
//
// ByteAccordion - JS library for smooth, Promise-based interaction with File and Buffer resources.
//
// @copyright (c) 2018 Damian Bushong <katana@odios.us>
// @license MIT license
// @url <https://github.com/damianb/ByteAccordion>
//
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
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
     * import { ExpandingFile, StreamPipeline } from 'ByteAccordion'
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
    async load(dest) {
        if (!dest.fd) {
            throw new Error('StreamPipeline.load expects an already-opened ExpandingFile instance.');
        }
        this.sbuf = dest;
        let streamOpts = {
            fd: dest.fd,
            flags: 'w',
            mode: 0o755,
            autoClose: false
        };
        this.destination = fs.createWriteStream('', streamOpts);
        return;
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
        let fd = null;
        if (Buffer.isBuffer(source)) {
            return this._pump(source);
        }
        else if (typeof source === 'number') {
            try {
                await fs.fstat(source);
            }
            catch (err) {
                // got an int, but it doesn't seem to be a file descriptor...
                throw new TypeError('StreamPipeline.pump expects either a Buffer, file descriptor or filepath for a source.');
            }
            fd = source;
        }
        else {
            try {
                await fs.access(source, fs.constants.R_OK);
            }
            catch (err) {
                throw new Error('StreamPipeline.pump expects the destination provided to exist and be readable.');
            }
            fd = await fs.open(source, 'r', 0o755);
        }
        let streamOpts = {
            fd: fd,
            flags: 'r',
            mode: 0o755,
            autoClose: false
        };
        if (start) {
            streamOpts.start = start;
            if (length) {
                streamOpts.end = start + length - 1;
            }
        }
        let content = fs.createReadStream('', streamOpts);
        const res = await this._pump(content);
        if (typeof source === 'string') {
            await fs.close(fd);
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
    _pump(content) {
        return new Promise((resolve, reject) => {
            if (Buffer.isBuffer(content)) {
                if (!this.sbuf || !this.destination) {
                    return;
                }
                this.destination.write(content, () => {
                    if (!this.sbuf) {
                        return;
                    }
                    let oldPosition = this.sbuf.position;
                    this.sbuf.position += content.length;
                    const res = { offset: oldPosition, wrote: content.length };
                    return resolve(res);
                });
            }
            else {
                // note: we're assuming fs.ReadStream here
                if (!this.destination) {
                    return;
                }
                content.on('end', () => {
                    if (!this.sbuf) {
                        return;
                    }
                    content.unpipe(this.destination);
                    let oldPosition = this.sbuf.position;
                    this.sbuf.position += content.bytesRead;
                    const res = { offset: oldPosition, wrote: content.bytesRead };
                    return resolve(res);
                });
                content.on('error', (err) => {
                    reject(err);
                });
                content.pipe(this.destination, { end: false });
            }
        });
    }
}
exports.StreamPipeline = StreamPipeline;
//# sourceMappingURL=StreamPipeline.js.map
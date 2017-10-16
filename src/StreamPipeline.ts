//
// ByteAccordion - JS library for smooth, Promise-based interaction with File and Buffer resources.
// ---
// @copyright (c) 2017 Damian Bushong <katana@odios.us>
// @license MIT license
// @url <https://github.com/damianb/ByteAccordion>
//

import * as fs from 'fs-extra'
import { ExpandingFile } from './ExpandingFile'

export interface StreamOptions {
  fd?: number
  flags?: string
  mode?: number
  autoClose?: boolean
  start?: number
  end?: number
}

export interface PumpResult {
  offset: number
  wrote: number
}

//
// StreamPipeline - provides the functionality to serially combine multiple read streams into one write stream.
//
export class StreamPipeline {
  /**
   * The filesystem WriteStream instance we'll be pumping all input into.
   *
   * @type {fs.WriteStream|undefined}
   */
  public destination: fs.WriteStream | undefined

  /**
   * The ExpandingFile instance we originally started with.
   *
   * @type {ExpandingFile|undefined}
   */
  public _destination: ExpandingFile | undefined

  /**
   * StreamPipeline constructor
   * @return {StreamPipeline}
   */
  constructor () {
    this.destination = this._destination = undefined
  }

  /**
   * Loads the specified destination and prepares the pipeline to it.
   *
   * @param  {ExpandingFile} dest - The ExpandingFile instance for the file to write to. NOT compatible with ExpandingBuffer.
   * @return {Promise:void}
   */
  public async load (dest: ExpandingFile): Promise<void> {
    if (!dest.fd) {
      throw new Error('StreamPipeline.load expects an already-opened ExpandingFile instance.')
    }

    this._destination = dest
    let streamOpts: StreamOptions = {
      fd: dest.fd,
      flags: 'w',
      mode: 0o755,
      autoClose: false
    }

    this.destination = fs.createWriteStream('', streamOpts)

    return
  }

  /**
   * Pumps the given "source" contents into the destination specified in StreamPipeline.load().
   *
   * @param  {Buffer|Number|String} source - The source Buffer, file descriptor (integer), or filepath (string) to read from.
   * @param  {Number} start - (optional) Start point for reading, passed to fs.createReadStream to identify a section to read from.
   * @param  {Number} length - (optional) Identifies how many bytes to read and pump into the destination.
   * @return {Promise:Object} - Returns an object containing the offset and length of what was just written to the destination.
   */
  public async pump (source: Buffer|number|string, start?: number, length?: number): Promise<PumpResult> {
    let fd = null
    if (Buffer.isBuffer(source)) {
      return this._pump(source)
    } else if (typeof source === 'number') {
      try {
        await fs.fstat(source)
      } catch (err) {
        // got an int, but it doesn't seem to be a file descriptor...
        throw new TypeError('StreamPipeline.pump expects either a Buffer, file descriptor or filepath for a source.')
      }

      fd = source
    } else {
      try {
        await fs.access(source, fs.constants.R_OK)
      } catch (err) {
        throw new Error('StreamPipeline.pump expects the destination provided to exist and be readable.')
      }
      fd = await fs.open(source, 'r', 0o755)
    }

    let streamOpts: StreamOptions = {
      fd: fd,
      flags: 'r',
      mode: 0o755,
      autoClose: false
    }

    if (start) {
      streamOpts.start = start
      if (length) {
        streamOpts.end = start + length - 1
      }
    }

    let content = fs.createReadStream('', streamOpts)
    const res = await this._pump(content)
    if (typeof source === 'string') {
      await fs.close(fd)
    }

    return res
  }

  /**
   * Handles the intricate part of hooking up the ReadStream to the WriteStream.
   *   Yes, this manually creates a promise - we need to, instead of making an async function, in order to
   *   properly work with the stream events.
   *
   * @private
   * @param  {Stream.Readable|Buffer} content - The content to pipe into the destination stream.
   * @return {Promise:Object} - Returns an object containing the offset and length of what was just written to the destination.
   */
  public _pump (content: fs.ReadStream|Buffer): Promise<PumpResult> {
    return new Promise((resolve, reject) => {
      if (Buffer.isBuffer(content)) {
        if (!this._destination || !this.destination) {
          return
        }

        this.destination.write(content, () => {
          if (!this._destination) {
            return
          }

          let oldPosition = this._destination.position
          this._destination.position += content.length

          const res: PumpResult = { offset: oldPosition, wrote: content.length }
          return resolve(res)
        })
      } else {
        // note: we're assuming fs.ReadStream here
        if (!this.destination) {
          return
        }

        content.on('end', () => {
          if (!this._destination) {
            return
          }

          content.unpipe(this.destination)
          let oldPosition = this._destination.position
          this._destination.position += content.bytesRead

          const res: PumpResult = { offset: oldPosition, wrote: content.bytesRead }
          return resolve(res)
        })
        content.on('error', (err: any) => {
          reject(err)
        })
        content.pipe(this.destination, { end: false })
      }
    })
  }
}

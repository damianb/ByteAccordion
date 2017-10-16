//
// ByteAccordion - JS library for smooth, Promise-based interaction with File and Buffer resources.
// ---
// @copyright (c) 2017 Damian Bushong <katana@odios.us>
// @license MIT license
// @url <https://github.com/damianb/ByteAccordion>
//

import * as fs from 'fs-extra'
import { ExpandingResource } from './ExpandingResource'

//
// ExpandingFile - provides an "expanding" file interface to ease writing of byte-level resources.
//
// TODO: provide .reset() method, probably using fs.truncate() or something.
export class ExpandingFile implements ExpandingResource {
  /**
   * Path to the file we're expanding into.
   *
   * @type {string}
   */
  public path: string

  /**
   * File descriptor for the file we're writing into.
   *
   * @type {number|undefined}
   */
  public fd: number|undefined

  /**
   * How far into the file we are, currently.
   *
   * @type {number}
   */
  public position: number

  /**
   * ExpandingFile constructor
   *
   * @param  {string} path - Path to the file that we're going to be writing to.
   *
   * @return {ExpandingFile}
   */
  constructor (path: string) {
    this.path = path
    this.fd = undefined
    this.position = 0
  }

  /**
   * Opens the file for writing based off of the path provided to the constructor.
   * Must occur before writing to the file.
   *
   * @return {Promise:void}
   */
  public async open (): Promise<void> {
    this.fd = await fs.open(this.path, 'w', 0o755)
    this.position = 0

    return
  }

  /**
   * Closes the file, preventing future writing.
   *
   * @return {Promise:void}
   */
  public async close (): Promise<void> {
    if (this.fd) {
      await fs.close(this.fd)
    }

    this.fd = undefined
    this.position = 0

    return
  }

  /**
   * Write to the expanding file.
   *
   * @param  {Buffer|Array|string|number} input - What to write to the file?
   *
   * @return {Promise:number} - Returns how many bytes have been written to the file so far.
   */
  public async write (input: Buffer|any[]|string|number): Promise<number> {
    if (!this.fd) {
      throw new Error('File does not yet appear to be opened.')
    }

    let inBuffer = null
    if (Buffer.isBuffer(input)) {
      inBuffer = input
    } else if (Array.isArray(input)) {
      // possible typescript bug - typescript can't seem to handle the overloading
      //   when we combine the Array check and string check.
      inBuffer = Buffer.from(input)
    } else if (typeof input === 'string') {
      inBuffer = Buffer.from(input)
    } else {
      inBuffer = Buffer.from([input])
    }

    const { bytesWritten } = await fs.write(this.fd, inBuffer, 0, inBuffer.length, this.position)
    this.position += bytesWritten

    return this.position
  }
}

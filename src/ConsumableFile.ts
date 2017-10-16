//
// ByteAccordion - JS library for smooth, Promise-based interaction with File and Buffer resources.
// ---
// @copyright (c) 2017 Damian Bushong <katana@odios.us>
// @license MIT license
// @url <https://github.com/damianb/ByteAccordion>
//

import { ConsumableResource } from './ConsumableResource'
import * as fs from 'fs-extra'

//
// ConsumableFile - provides a "consumable" buffer stream from a file descriptor to ease reading/parsing of byte-level resources.
//
export class ConsumableFile implements ConsumableResource {
  /**
   * Path to the file to be consumed for reading.
   *
   * @type {string}
   */
  public path: string

  /**
   * The file descriptor of the file we're reading from.
   *
   * @type {[type]}
   */
  public fd: number|undefined

  /**
   * The size of the file we're consuming.
   *
   * @type {[type]}
   */
  public filesize: number|undefined

  /**
   * How far into the file we've read.
   *
   * @type {number}
   */
  public position: number

  /**
   * ConsumableFile constructor
   *
   * @param  {String} path - Path to the file that we're going to be "consuming".
   *
   * @return {ConsumableFile}
   */
  constructor (path: string) {
    this.path = path
    this.fd = this.filesize = undefined
    this.position = 0
  }

  /**
   * Opens the file for reading based off of the path provided to the constructor.
   *
   * @return {Promise:void}
   */
  public async open (): Promise<void> {
    try {
      await fs.access(this.path, fs.constants.R_OK)
    } catch (err) {
      throw new Error('ConsumableFile.open expects the path provided to be readable.')
    }
    this.fd = await fs.open(this.path, 'r', 0o666)
    const stats = await fs.fstat(this.fd)
    this.filesize = stats.size
    this.position = 0

    return
  }

  /**
   * Closes the file, preventing future reading.
   *
   * @return {Promise:void}
   */
  public async close (): Promise<void> {
    if (this.fd) {
      await fs.close(this.fd)
    }

    this.fd = this.filesize = undefined
    this.position = 0

    return
  }

  /**
   * Resets the ConsumableFile to its origin position.
   *
   * @return {Promise:void}
   */
  public async reset (): Promise<void> {
    this.position = 0

    return
  }

  /**
   * Reads within the file.
   *
   * @param  {number} bytes - The number of bytes to read and advance within the buffer.
   *
   * @return {Promise:Buffer} - Returns a buffer containing the next selected bytes from the ConsumableFile.
   */
  public async read (bytes: number): Promise<Buffer> {
    if (!this.fd || this.filesize === undefined) {
      throw new Error('File does not appear to have been opened.')
    }

    if (isNaN(bytes) || !isFinite(bytes) || bytes <= 0) {
      throw new Error('Bytes parameter must be a positive integer.')
    }

    if ((this.position + bytes) > this.filesize) {
      throw new RangeError('File exhausted; attempted to read beyond file.')
    }

    const { bytesRead, buffer } = await fs.read(this.fd, Buffer.alloc(bytes), 0, bytes, this.position)
    this.position += bytes
    if (bytesRead !== bytes) {
      throw new Error('Failed to read number of bytes requested.') // ???
    }

    return buffer
  }

  /**
   * Seeks within the file to reposition for read, relative to the current position.
   *
   * @param  {number} bytes - The number of bytes to shift within the buffer; this can be negative.
   *
   * @return {Promise:void} - Returns undefined.
   */
  public async seek (bytes: number): Promise<void> {
    await this.aseek(this.position += bytes)

    return
  }

  /**
   * Seeks within the file to reposition for read, using an absolute position.
   *
   * @param  {number} bytes - How many bytes into the file do we want to seek?
   *
   * @return {Promise:void} - Returns undefined.
   */
  public async aseek (bytes: number): Promise<void> {
    if (!this.fd || this.filesize === undefined) {
      throw new Error('File does not appear to have been opened.')
    }

    if (isNaN(bytes) || !isFinite(bytes) || bytes <= 0) {
      throw new Error('Bytes parameter must be a positive integer.')
    }

    if (this.position > this.filesize) {
      throw new RangeError('File exhausted; attempted to seek beyond file.')
    }

    this.position = Math.floor(bytes)

    return
  }
}

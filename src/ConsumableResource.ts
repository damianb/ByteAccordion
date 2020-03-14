//
// ByteAccordion - JS library for smooth, Promise-based interaction with File and Buffer resources.
//
// @copyright (c) 2018 Damian Bushong <katana@odios.us>
// @license MIT license
// @url <https://github.com/damianb/ByteAccordion>
//

export interface ConsumableResource {
  /**
   * Resets the current working position in the resource.
   *
   * @return {Promise<void>}
   */
  reset (): Promise<void>

  /**
   * Reads and "consumes" the resource, returning everything read and advancing through the resource with each read call.
   * Previously read resource contents will not be available for read again unless the resource is reset.
   *
   * @param  bytes - The number of bytes to read from the resource.
   * @return {Promise<Buffer>} - Returns a Buffer containing the next selected bytes from the resource.
   */
  read (bytes: number): Promise<Buffer>

  /**
   * Seeks ahead a number of bytes in the current resource.
   *
   * @param  bytes - The number of bytes to seek ahead in the resource.
   * @return {Promise<void>}
   */
  seek (bytes: number): Promise<void>

  /**
   * Seeks absolutely within the resource. This changes the read position to whatever offset is specified.
   *
   * @param  bytes - How many bytes into the resource do we want to seek?
   * @return {Promise<void>}
   */
  aseek (bytes: number): Promise<void>
}

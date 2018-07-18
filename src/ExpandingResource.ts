//
// ByteAccordion - JS library for smooth, Promise-based interaction with File and Buffer resources.
//
// @copyright (c) 2018 Damian Bushong <katana@odios.us>
// @license MIT license
// @url <https://github.com/damianb/ByteAccordion>
//

export interface ExpandingResource {
	/**
	 * How many bytes have we written to this resource?
	 */
  position: number

  /**
   * Write to the resource.
   *
   * @param  input - What to write to the buffer.
   * @return {Promise<number>} - Returns the length of the current resource.
   */
  write (input: Buffer | number[] | number | string): Promise<number>
}

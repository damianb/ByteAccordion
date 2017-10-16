//
// ByteAccordion - JS library for smooth, Promise-based interaction with File and Buffer resources.
// ---
// @copyright (c) 2017 Damian Bushong <katana@odios.us>
// @license MIT license
// @url <https://github.com/damianb/ByteAccordion>
//

export interface ConsumableResource {
  reset (): Promise<void>
  read (bytes: number): Promise<Buffer>
  seek (bytes: number): Promise<void>
  aseek (bytes: number): Promise<void>
}

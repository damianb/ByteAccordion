//
// ByteAccordion - JS library for smooth, Promise-based interaction with File and Buffer resources.
//
// @copyright (c) 2020 Damian Bushong <katana@odios.us>
// @license MIT license
// @url <https://github.com/damianb/ByteAccordion>
//

import { expect } from 'chai'
import { ExpandingBuffer } from './../src/ExpandingBuffer'

describe('ExpandingBuffer tests', () => {
  let sbuf: ExpandingBuffer
  beforeEach(() => {
    sbuf = new ExpandingBuffer()
  })

  describe('ExpandingBuffer.write', () => {
    it('should advance the buffer when writing', async () => {
      const buf = Buffer.from([0x01])
      const expectedBuffer = Buffer.from([0x01, 0x02])

      await sbuf.write(buf)

      expect(sbuf.buf).to.be.an.instanceof(Buffer)
      expect(Buffer.compare(sbuf.buf, buf)).to.equal(0)

      await sbuf.write(0x02)

      expect(sbuf.buf).to.be.an.instanceof(Buffer)
      expect(Buffer.compare(sbuf.buf, expectedBuffer)).to.equal(0)
    })

    it('should return the total buffer length with each write', async () => {
      let buf = Buffer.from([0x01])
      let res: number

      res = await sbuf.write(buf)
      expect(res).to.equal(1)

      res = await sbuf.write(buf)
      expect(res).to.equal(2)

      buf = Buffer.from([0x01, 0x02, 0x03])
      res = await sbuf.write(buf)
      expect(res).to.equal(5)
    })

    it('should be able to take a Buffer as input correctly', async () => {
      const buf = Buffer.from([0x01])

      await sbuf.write(buf)

      expect(sbuf.buf).to.be.an.instanceof(Buffer)
      expect(Buffer.compare(sbuf.buf, buf)).to.equal(0)
    })

    it('should be able to take an array as input correctly', async () => {
      const input = [0x01, 0x02]
      const expectedBuffer = Buffer.from(input)

      await sbuf.write(input)

      expect(sbuf.buf).to.be.an.instanceof(Buffer)
      expect(Buffer.compare(sbuf.buf, expectedBuffer)).to.equal(0)
    })

    it('should be able to take a string as input correctly', async () => {
      const input = 'test'
      const expectedBuffer = Buffer.from(input)

      await sbuf.write(input)

      expect(sbuf.buf).to.be.an.instanceof(Buffer)
      expect(Buffer.compare(sbuf.buf, expectedBuffer)).to.equal(0)
    })

    it('should be able to take a number as input correctly', async () => {
      const input = -65535
      const expectedBuffer = Buffer.from([input])

      await sbuf.write(input)

      expect(sbuf.buf).to.be.an.instanceof(Buffer)
      expect(Buffer.compare(sbuf.buf, expectedBuffer)).to.equal(0)
    })

    it('should be able to take multiple inputs to build a complex buffer correctly', async () => {
      const expectedBuffer = Buffer.from([
        0x74, 0x65, 0x73, 0x74, 0x00, 0x01, 0x00, 0x74,
        0x65, 0x73, 0x74, 0x20, 0x65, 0x6e, 0x64
      ])

      await sbuf.write('test')
      await sbuf.write([0x00, 0x01])
      await sbuf.write(0x00)
      await sbuf.write('test end')

      expect(sbuf.buf).to.be.an.instanceof(Buffer)
      expect(Buffer.compare(sbuf.buf, expectedBuffer)).to.equal(0)
    })
  })

  describe('ExpandingBuffer.reset', () => {
    it('should write from the beginning after calling reset', async () => {
      const expectedBuffer = Buffer.from([0x02])

      await sbuf.write([0x01, 0x01])
      await sbuf.reset()
      await sbuf.write(0x02)

      expect(sbuf.buf).to.be.an.instanceof(Buffer)
      expect(Buffer.compare(sbuf.buf, expectedBuffer)).to.equal(0)
    })
  })
})

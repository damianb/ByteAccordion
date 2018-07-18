//
// ByteAccordion - JS library for smooth, Promise-based interaction with File and Buffer resources.
//
// @copyright (c) 2018 Damian Bushong <katana@odios.us>
// @license MIT license
// @url <https://github.com/damianb/ByteAccordion>
//

import { expect } from 'chai'
import { ConsumableBuffer } from '../src/ConsumableBuffer'

describe('ConsumableBuffer tests', () => {
  const buf = Buffer.from('INDEX')
  let sbuf: ConsumableBuffer
  beforeEach(() => {
    sbuf = new ConsumableBuffer(buf)
  })

  describe('ConsumableBuffer.read', () => {
    it('should consume the Buffer when calling read', async () => {
      let res = null

      res = await sbuf.read(1)
      expect(res).to.be.an.instanceof(Buffer)
      expect(res.toString()).to.equal('I')

      res = await sbuf.read(1)
      expect(res).to.be.an.instanceof(Buffer)
      expect(res.toString()).to.equal('N')
    })

    it('should throw an Error when a negative number of bytes is specified', async () => {
      let res = null
      try {
        await sbuf.read(-1)
      } catch (err) {
        res = err
      }
      expect(res).to.be.an.instanceof(Error)
      expect(res.message).to.equal('Bytes parameter must be a positive integer.')
    })

    it('should throw a RangeError when the initial buffer has been exhausted', async () => {
      let res = null
      await sbuf.seek(5)
      try {
        await sbuf.read(1)
      } catch (err) {
        res = err
      }
      expect(res).to.be.an.instanceof(RangeError)
      expect(res.message).to.equal('Buffer exhausted; attempted to read beyond buffer.')
    })
  })

  describe('ConsumableBuffer.reset', () => {
    it('should return undefined on reset', async () => {
      let res = null

      await sbuf.read(2)
      res = await sbuf.reset()

      expect(res).to.equal(undefined)
    })

    it('should read from the beginning after calling reset', async () => {
      let res = null

      await sbuf.read(2)
      await sbuf.reset()

      res = await sbuf.read(1)
      expect(res.toString()).to.equal('I')
    })
  })

  describe('ConsumableBuffer.seek', () => {
    it('should seek forward the given number of bytes', async () => {
      let res = null

      await sbuf.seek(1)
      res = await sbuf.read(1)

      expect(res.toString()).to.equal('N')

      await sbuf.seek(2)
      res = await sbuf.read(1)

      expect(res.toString()).to.equal('X')
    })

    it('should return undefined on seek', async () => {
      let res = null

      res = await sbuf.seek(1)
      expect(res).to.equal(undefined)
    })

    it('should throw an Error when a negative number of bytes is specified', async () => {
      let res = null
      try {
        await sbuf.seek(-1)
      } catch (err) {
        res = err
      }
      expect(res).to.be.an.instanceof(Error)
      expect(res.message).to.equal('Bytes parameter must be a positive integer.')
    })

    it('should throw a RangeError when the trying to seek beyond the current buffer', async () => {
      let res = null
      try {
        await sbuf.seek(6)
      } catch (err) {
        res = err
      }
      expect(res).to.be.an.instanceof(RangeError)
      expect(res.message).to.equal('Buffer exhausted; attempted to seek beyond buffer.')
    })
  })

  describe('ConsumableBuffer.aseek', () => {
    it('should seek the given number of bytes from the beginning of the buffer', async () => {
      let res = null

      await sbuf.aseek(1)
      res = await sbuf.read(1)

      expect(res.toString()).to.equal('N')

      await sbuf.aseek(1)
      res = await sbuf.read(1)

      expect(res.toString()).to.equal('N')
    })

    it('should return undefined on seek', async () => {
      let res = null

      res = await sbuf.aseek(1)
      expect(res).to.equal(undefined)
    })

    it('should throw an Error when a negative number of bytes is specified', async () => {
      let res = null
      try {
        await sbuf.aseek(-1)
      } catch (err) {
        res = err
      }
      expect(res).to.be.an.instanceof(Error)
      expect(res.message).to.equal('Bytes parameter must be a positive integer.')
    })

    it('should throw a RangeError when the trying to seek beyond the current buffer', async () => {
      let res = null
      try {
        await sbuf.aseek(6)
      } catch (err) {
        res = err
      }
      expect(res).to.be.an.instanceof(RangeError)
      expect(res.message).to.equal('Buffer exhausted; attempted to seek beyond buffer.')
    })
  })
})

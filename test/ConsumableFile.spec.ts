//
// ConsumableFile - JS library for easy file reading/parsing.
// ---
// @copyright (c) 2017 Damian Bushong <katana@odios.us>
// @license MIT license
// @url <https://github.com/damianb/ConsumableFile>
//
/* eslint-env mocha */
'use strict'

import { expect } from 'chai'
import * as path from 'path'
import { ConsumableFile } from './../src/ConsumableFile'

describe('ConsumableFile tests', () => {
  const filePath = path.join(__dirname, '/samples/ConsumableFileTest.txt')
  let sbuf: ConsumableFile
  beforeEach(async () => {
    sbuf = new ConsumableFile(filePath)
  })

  afterEach(async () => {
    // ensure we do not leave any dangling file descriptors
    if (sbuf.fd !== null) {
      await sbuf.close()
    }
  })

  describe('ConsumableFile file descriptor handling', () => {
    describe('ConsumableFile.open', () => {
      afterEach(async () => {
        await sbuf.close()
      })

      it('should open a file and store a file descriptor in ConsumableFile.fd', async () => {
        await sbuf.open()
        expect(sbuf.fd).to.be.a('number')
      })

      it('should start with correct metadata about the file', async () => {
        await sbuf.open()
        expect(sbuf.filesize).to.be.a('number')
        expect(sbuf.filesize).to.equal(39)

        expect(sbuf.position).to.be.a('number')
        expect(sbuf.position).to.equal(0)
      })
    })

    describe('ConsumableFile.close', () => {
      beforeEach(async () => {
        await sbuf.open()
      })

      it('should close the file and clear the file descriptor in ConsumableFile.fd', async () => {
        await sbuf.close()
        expect(sbuf.fd).to.equal(undefined)
      })

      it('should clear out file metadata after closing the file', async () => {
        await sbuf.close()

        expect(sbuf.filesize).to.equal(undefined)
        expect(sbuf.position).to.equal(0)
      })
    })
  })

  describe('ConsumableFile general methods', () => {
    beforeEach(async () => {
      await sbuf.open()
    })
    afterEach(async () => {
      // close it if not already closed!
      if (sbuf.fd !== null) {
        await sbuf.close()
      }
    })

    describe('ConsumableFile.read', () => {
      it('should advance the file position and return a buffer when calling read', async () => {
        let res = null

        res = await sbuf.read(1)
        expect(res).to.be.an.instanceof(Buffer)
        expect(res.toString()).to.equal('T')
        expect(sbuf.position).to.equal(1)

        res = await sbuf.read(1)
        expect(res).to.be.an.instanceof(Buffer)
        expect(res.toString()).to.equal('h')
        expect(sbuf.position).to.equal(2)
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

      it('should throw a RangeError when trying to read beyond the file\'s contents', async () => {
        let res = null
        await sbuf.seek(38)
        try {
          await sbuf.read(15)
        } catch (err) {
          res = err
        }
        expect(res).to.be.an.instanceof(RangeError)
        expect(res.message).to.equal('File exhausted; attempted to read beyond file.')
      })
    })

    describe('ConsumableFile.seek', () => {
      it('should seek forward the given number of bytes within the file when calling seek', async () => {
        let res = null

        await sbuf.seek(1)
        expect(sbuf.position).to.equal(1)

        res = await sbuf.read(1)
        expect(res.toString()).to.equal('h')

        await sbuf.seek(2)
        expect(sbuf.position).to.equal(4)
        res = await sbuf.read(3)

        expect(res.toString()).to.equal(' is')
      })

      it('should seek backward the given negative number of bytes within the file when calling seek', async () => {
        let res = null

        await sbuf.aseek(15)
        await sbuf.seek(-3)
        expect(sbuf.position).to.equal(12)
        res = await sbuf.read(1)

        expect(res.toString()).to.equal('s')

        await sbuf.seek(-2)
        res = await sbuf.read(3)

        expect(res.toString()).to.equal('est')
      })

      it('should return undefined on seek', async () => {
        let res = null

        res = await sbuf.seek(1)
        expect(res).to.equal(undefined)
      })

      it('should throw an Error when we try to seek before zero (the beginning of the file)', async () => {
        let res = null
        try {
          await sbuf.seek(-1)
        } catch (err) {
          res = err
        }
        expect(res).to.be.an.instanceof(Error)
        expect(res.message).to.equal('Bytes parameter must be a positive integer.')
      })

      it('should throw a RangeError when the trying to seek beyond the current file', async () => {
        let res = null
        try {
          await sbuf.seek(44)
        } catch (err) {
          res = err
        }
        expect(res).to.be.an.instanceof(RangeError)
        expect(res.message).to.equal('File exhausted; attempted to seek beyond file.')
      })
    })

    describe('ConsumableFile.aseek', () => {
      it('should advance the file position absolutely when calling aseek', async () => {
        let res = null

        await sbuf.aseek(20)
        expect(sbuf.position).to.equal(20)

        res = await sbuf.read(1)
        expect(res.toString()).to.equal('f')

        await sbuf.aseek(3)
        expect(sbuf.position).to.equal(3)
        res = await sbuf.read(3)

        expect(res.toString()).to.equal('s i')
      })

      it('should return undefined on aseek', async () => {
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

      it('should throw a RangeError when the trying to seek beyond the current file', async () => {
        let res = null
        try {
          await sbuf.seek(44)
        } catch (err) {
          res = err
        }
        expect(res).to.be.an.instanceof(RangeError)
        expect(res.message).to.equal('File exhausted; attempted to seek beyond file.')
      })
    })
  })
})

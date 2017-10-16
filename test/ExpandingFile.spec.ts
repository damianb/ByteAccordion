//
// ExpandingFile - JS library for easy byte-level file writing.
// ---
// @copyright (c) 2017 Damian Bushong <katana@odios.us>
// @license MIT license
// @url <https://github.com/damianb/ExpandingFile>
//
/* eslint-env mocha */
'use strict'

import { expect } from 'chai'
import * as fs from 'fs-extra'
import * as path from 'path'
import { ExpandingFile } from './../src/ExpandingFile'

describe('ExpandingFile tests', () => {
  const filePath = path.join(__dirname, '/samples/ExpandingFileTest.txt')
  let sbuf: ExpandingFile
  beforeEach(() => {
    sbuf = new ExpandingFile(filePath)
  })

  afterEach(async () => {
    await fs.unlink(filePath)

    // ensure we do not leave any dangling file descriptors
    if (sbuf.fd !== null) {
      await sbuf.close()
    }
  })

  describe('ExpandingFile file descriptor handling', () => {
    describe('ExpandingFile.open', () => {
      afterEach(async () => {
        if(sbuf.fd !== null) {
          await sbuf.close()
        }
      })

      it('should open a file and store a file descriptor in ExpandingFile.fd', async () => {
        await sbuf.open()

        expect(sbuf.fd).to.be.a('number')
      })

      it('should start with correct metadata about the file', async () => {
        await sbuf.open()

        expect(sbuf.position).to.be.a('number')
        expect(sbuf.position).to.equal(0)
      })
    })

    describe('ExpandingFile.close', () => {
      beforeEach(async () => {
        await sbuf.open()
      })

      afterEach(async () => {
        if(sbuf.fd !== null) {
          await sbuf.close()
        }
      })

      it('should close the file and clear the file descriptor in ExpandingFile.fd', async () => {
        await sbuf.close()

        expect(sbuf.fd).to.equal(undefined)
      })

      it('should clear out file metadata after closing the file', async () => {
        await sbuf.close()

        expect(sbuf.position).to.equal(0)
      })
    })
  })

  describe('ExpandingFile general methods', () => {
    beforeEach(async () => {
      await sbuf.open()
    })

    afterEach(async () => {
      if (sbuf.fd !== null) {
        await sbuf.close()
      }
    })

    describe('ExpandingFile.write', () => {
      it('should advance position when writing', async () => {
        const buf = Buffer.from([0x01])
        const expectedBuffer = Buffer.from([0x01, 0x02])
        let res: Buffer
        let wrote: number

        wrote = await sbuf.write(buf)
        expect(wrote).to.equal(1)

        await sbuf.write(0x02)
        await sbuf.close()
        res = await fs.readFile(filePath)

        expect(res.length).to.equal(2)
        expect(Buffer.compare(res, expectedBuffer)).to.equal(0)
      })

      it('should be able to take a Buffer as input correctly', async () => {
        const buf = Buffer.from([0x01])
        let res: Buffer

        await sbuf.write(buf)
        await sbuf.close()
        res = await fs.readFile(filePath)

        expect(res.length).to.equal(buf.length)
        expect(Buffer.compare(res, buf)).to.equal(0)
      })

      it('should be able to take an array as input correctly', async () => {
        const input = [0x01, 0x02]
        const expectedBuffer = Buffer.from(input)
        let res: Buffer

        await sbuf.write(input)
        await sbuf.close()
        res = await fs.readFile(filePath)

        expect(res.length).to.equal(expectedBuffer.length)
        expect(Buffer.compare(res, expectedBuffer)).to.equal(0)
      })

      it('should be able to take a string as input correctly', async () => {
        const input = 'test'
        const expectedBuffer = Buffer.from(input)
        let res: Buffer

        await sbuf.write(input)
        await sbuf.close()
        res = await fs.readFile(filePath)

        expect(res.length).to.equal(expectedBuffer.length)
        expect(Buffer.compare(res, expectedBuffer)).to.equal(0)
      })

      it('should be able to take a number as input correctly', async () => {
        const input = -65535
        const expectedBuffer = Buffer.from([input])
        let res: Buffer

        await sbuf.write(input)
        await sbuf.close()
        res = await fs.readFile(filePath)

        expect(res.length).to.equal(expectedBuffer.length)
        expect(Buffer.compare(res, expectedBuffer)).to.equal(0)
      })

      it('should be able to take multiple inputs to build a complex buffer correctly', async () => {
        const expectedBuffer = Buffer.from([
          0x74, 0x65, 0x73, 0x74, 0x00, 0x01, 0x00, 0x74,
          0x65, 0x73, 0x74, 0x20, 0x65, 0x6e, 0x64
        ])
        let res: Buffer

        await sbuf.write('test')
        await sbuf.write([0x00, 0x01])
        await sbuf.write(0x00)
        await sbuf.write('test end')
        await sbuf.close()
        res = await fs.readFile(filePath)

        expect(res.length).to.equal(expectedBuffer.length)
        expect(Buffer.compare(res, expectedBuffer)).to.equal(0)
      })
    })
  })
})

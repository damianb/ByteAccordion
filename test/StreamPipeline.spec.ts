//
// StreamPipeline - Stream pipeline library.
// ---
// @copyright (c) 2017 Damian Bushong <katana@odios.us>
// @license MIT license
// @url <https://github.com/damianb/StreamPipeline>
//
/* globals describe it beforeEach afterEach  */
'use strict'

import { expect } from 'chai'
import * as fs from 'fs-extra'
import * as stream from 'stream'
import * as path from 'path'
import { StreamPipeline } from './../src/StreamPipeline'
import { ExpandingFile } from './../src/ExpandingFile'

describe('StreamPipeline tests', () => {
  const filePath = path.join(__dirname, '/samples/StreamPipelineTest.txt')

  describe('StreamPipeline.load', () => {
    let sbuf: ExpandingFile
    let sfile: StreamPipeline
    beforeEach(async () => {
      sbuf = new ExpandingFile(filePath)
      sfile = new StreamPipeline()
    })

    afterEach(async () => {
      // ensure we do not leave any dangling file descriptors
      if (sbuf.fd !== null) {
        await sbuf.close()
      }
    })

    it('should throw if the ExpandingFile instance\'s file descriptor has not been opened yet', async () => {
      let res: any
      try {
        await sfile.load(sbuf)
      } catch (err) {
        res = err
      }

      expect(res).to.be.an.instanceof(Error)
      expect(res.message).to.equal('StreamPipeline.load expects an already-opened ExpandingFile instance.')
    })

    it('should store a writable stream in StreamPipeline.destination', async () => {
      await sbuf.open()
      await sfile.load(sbuf)

      expect(sfile.destination).to.be.an.instanceof(stream.Writable)
    })
  })

  describe('StreamPipeline.pump', () => {
    let sbuf: ExpandingFile
    let sfile: StreamPipeline
    beforeEach(async () => {
      sbuf = new ExpandingFile(filePath)
      sfile = new StreamPipeline()
      await sbuf.open()
      await sfile.load(sbuf)
    })

    afterEach(async () => {
      await fs.unlink(filePath)

      // ensure we do not leave any dangling file descriptors
      if (sbuf.fd !== null) {
        await sbuf.close()
      }
    })

    it('should throw if the provided filepath does not exist', async () => {
      let res: any
      try {
        await sfile.pump(path.join(__dirname, '/samples/null.txt'))
      } catch (err) {
        res = err
      }

      expect(res).to.be.an.instanceof(Error)
      expect(res.message).to.equal('StreamPipeline.pump expects the destination provided to exist and be readable.')
    })

    it('should correctly pump only a part of a file if specified', async () => {
      await sfile.pump(path.join(__dirname, '/samples/TestFile1.txt'), 5, 4)
      sbuf.close()

      let res = (await fs.readFile(filePath)).toString('utf8')

      expect(res).to.equal('file')
    })
  })

  describe('StreamPipeline._pump', () => {
    let sbuf: ExpandingFile
    let sfile: StreamPipeline
    beforeEach(async () => {
      sbuf = new ExpandingFile(filePath)
      sfile = new StreamPipeline()
      await sbuf.open()
      await sfile.load(sbuf)
    })

    afterEach(async () => {
      await fs.unlink(filePath)

      // ensure we do not leave any dangling file descriptors
      if (sbuf.fd !== null) {
        await sbuf.close()
      }
    })

    it('should take a Stream.Readable and pipe content into the destination correctly', async () => {
      let rstream = fs.createReadStream(path.join(__dirname, '/samples/TestFile1.txt'))
      await sfile._pump(rstream)
      await sbuf.close()

      let res = (await fs.readFile(filePath)).toString('utf8')

      expect(res).to.equal('Test file\n')
    })

    it('should write a buffer directly into the destination correctly', async () => {
      let expectedString = 'my test'
      await sfile._pump(Buffer.from(expectedString))
      await sbuf.close()

      let res = (await fs.readFile(filePath)).toString('utf8')

      expect(res).to.equal(expectedString)
    })

    it('should return an object containing the offset for what was written and how much was written to the destination', async () => {
      let res = await sfile._pump(Buffer.from('test'))
      expect(res.offset).to.equal(0)
      expect(res.wrote).to.equal(4)

      res = await sfile._pump(Buffer.from('another test'))
      expect(res.offset).to.equal(4)
      expect(res.wrote).to.equal(12)
    })
  })

  describe('StreamPipeline integration test', () => {
    let sbuf: ExpandingFile
    let sfile: StreamPipeline
    beforeEach(async () => {
      sbuf = new ExpandingFile(filePath)
      sfile = new StreamPipeline()
      await sbuf.open()
    })

    afterEach(async () => {
      await fs.unlink(filePath)

      // ensure we do not leave any dangling file descriptors
      if (sbuf.fd !== null) {
        await sbuf.close()
      }
    })

    it('should correctly pipe multiple sources into a single file', async () => {
      let res: any

      await sfile.load(sbuf)

      res = await sfile.pump(Buffer.from('Start test'))
      expect(res.offset).to.equal(0)
      expect(res.wrote).to.equal(10)

      res = await sfile.pump(path.join(__dirname, '/samples/TestFile1.txt'))
      expect(res.offset).to.equal(10)
      expect(res.wrote).to.equal(10)

      res = await sfile.pump(path.join(__dirname, '/samples/TestFile2.txt'))
      expect(res.offset).to.equal(20)
      expect(res.wrote).to.equal(26)

      res = await sfile.pump(Buffer.from('End test'))
      expect(res.offset).to.equal(46)
      expect(res.wrote).to.equal(8)

      expect(sbuf.position).to.equal(54)

      res = (await fs.readFile(filePath)).toString('utf8')
      expect(res).to.equal('Start testTest file\nAnother test file -n\n\ntestEnd test')
    })
  })
})

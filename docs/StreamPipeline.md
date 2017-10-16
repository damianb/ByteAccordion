# StreamPipeline

StreamPipeline is a class designed to wrap around ExpandingFile instances to specifically aid in copying large chunks of files into the destination,
 making it ideal for use with custom archive formats with the ability to just write large chunks to your files piece by piece and not care about anything like stream events.
 Create a StreamPipeline and pump as many chunks into the file as you need.

All methods are async functions that return promises. This entire library depends on async/await and thus requires node 7.6+.

## Usage

``` js
let sbuf = new ExpandingFile('/path/to/file/to/write/to.txt')
let sfile = new StreamPipeline()
sbuf.open()
	.then(() => {
		return sfile.load(sbuf)
	})
	.then(() => {
		return sfile.pump(Buffer.from('TEST'))
	})
// and then continue pumping content as needed

// or, with async/await...
// ...

sbuf = new ExpandingFile('/path/to/file/to/write/to.txt')
sfile = new StreamPipeline()
await sbuf.open()
await sfile.load(sbuf)
await sfile.pump(Buffer.from('TEST'))

// ...just note that this shines when combined with reads from larger files,
//   due to the heavy use of streams when reading and writing. it works great when building archives!
```

## Methods

### new StreamPipeline()

StreamPipeline constructor

* @return {StreamPipeline}

See usage above.

### StreamPipeline.load(dest)

Loads the specified destination and prepares the pipeline to it.

* @param  {ExpandingFile} dest - The ExpandingFile instance for the file to write to. NOT compatible with ExpandingBuffer.
* @return {Promise:undefined}

``` js
async () => {
	const filepath = '/path/to/file.txt'
	const sbuf = new ExpandingFile(filepath)
	const sfile = new StreamPipeline()
	await sbuf.open()
	await sfile.load(sbuf)
	// now able to pump into sbuf via sfile!
}
```

### StreamPipeline.pump()

Pumps the given "source" contents into the destination specified in StreamPipeline.load().

* @param  {Buffer|Number|String} source - The source Buffer, file descriptor (integer), or filepath (string) to read from.
* @param  {Number} start - (optional) Start point for reading, passed to fs.createReadStream to identify a section to read from.
* @param  {Number} length - (optional) Identifies how many bytes to read and pump into the destination.
* @return {Promise:Object} - Returns an object containing the offset and length of what was just written to the destination.

**NOTE**: If provided a file descriptor as the source, the file descriptor itself ***will not*** be closed when reading is complete.
If provided a filepath as the source, the file descriptor opened using the filepath ***will*** be closed when reading is complete.

For efficiency, when reading the same file multiple times (for partial reads), open a file descriptor beforehand and provide that as the source each time.


``` js
async () => {
	const filepath = '/path/to/file.txt'
	const sbuf = new ExpandingFile(filepath)
	const sfile = new StreamPipeline()
	await sbuf.open()
	await sfile.load(sbuf)

	// now able to pump into sbuf via sfile!
	await sfile.pump('/path/to/file/to/read/1.txt')
	await sfile.pump('/path/to/file/to/read/2.txt')
	await sfile.pump('/path/to/file/to/read/3.txt')
	await sfile.pump('/path/to/file/to/read/4.txt')
	await sfile.pump('/path/to/file/to/read/partial.txt', 0, 30)
	await sfile.pump('/path/to/file/to/read/partial.txt', 60, 30)
}
```

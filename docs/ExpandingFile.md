# ExpandingFile

ExpandingFile is a class designed to wrap around node.js file to allow for more fluid writing capabilities,
 making it possible to just write to your files and not care about their lengths, inputs, or stream events.  Create an ExpandingFile and just call write as much as you need.

All methods are async functions that return promises. This entire library depends on async/await and thus requires node 7.6+.

## Usage

``` js
const ExpandingFile = require('ExpandingFile')

// you can work with it like normal promises...
let sbuf = new ExpandingFile('/path/to/file.txt')

sbuf.open()
	.then(() => {
		return sbuf.write('test')
	})
	.then(() => {
		// keep writing as much as you need!
	})

// or, with async/await...
// ...

sbuf = new ExpandingFile('/path/to/file.txt')

await sbuf.write('test')
```

## Methods

### new ExpandingFile()

ExpandingFile constructor

* @return {ExpandingFile}

See usage above.

### ExpandingFile.open()

Opens the file for writing based off of the path provided to the constructor.
Must occur before writing to the file.

* @return {Promise:undefined}

``` js
async () => {
	const filepath = '/path/to/file.txt'
	const sbuf = new ExpandingFile(filepath)
	await sbuf.open()
	// now able to write to sbuf!
}
```

### ExpandingFile.close()

Closes the file, preventing future reading.

* @return {Promise:undefined}

**NOTE:**: Should be called when done with the file.  Don't hog file handles, people.

``` js
async () => {
	const filepath = '/path/to/file.txt'
	const sbuf = new ExpandingFile(filepath)
	await sbuf.open()
	// now able to write with sbuf!

	// ...

	await sbuf.close()
	// no longer able to read from sbuf, state is reset and clean.
}
```

### ExpandingFile.write(input)

Write to the expanding file.

* @param  {Buffer|Array|String|Number} input - What to write to the file?
* @return {Promise:Number} - Returns how many bytes have been written to the file so far.

``` js
async () => {
	const filepath = '/path/to/file.txt'
	const sbuf = new ExpandingFile(filePath)
	await sbuf.write('test')
	await sbuf.write('test2')

	// the file, when opened, will contain "testtest2"
}
```

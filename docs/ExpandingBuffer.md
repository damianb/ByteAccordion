# ExpandingBuffer

ExpandingBuffer is a class designed to wrap around node.js buffers to allow for more fluid writing capabilities,
 making it possible to just write to your buffers and not care about their lengths.  Create an ExpandingBuffer and just call write as much as you need.

All methods are async functions that return promises. This entire library depends on async/await and thus requires node 7.6+.

## Usage

``` js
const ExpandingBuffer = require('ExpandingBuffer')

// you can work with it like normal promises...
let sbuf = new ExpandingBuffer()

sbuf.write('test').then(() => {
	// keep writing or grab the end result buffer!

	return cbuf.getCurrentBuffer()
})

// or, with async/await...
// ...

sbuf = new ExpandingBuffer()

await sbuf.write('test')
const myBuffer = await sbuf.getCurrentBuffer()
```

## Methods

### new ExpandingBuffer()

ExpandingBuffer constructor

* @return {ExpandingBuffer}

See usage above.

### ExpandingBuffer.reset()

Resets the expanding "buffer" to an empty state.

* @return {Promise:Buffer} - returns the emptied buffer.

``` js
async () => {
	const sbuf = new ExpandingBuffer()
	await sbuf.write('test')
	await sbuf.reset()

	// sbuf is now back to an empty, clean state
}
```

### ExpandingBuffer.write(input)

Write to the expanding "buffer".

* @param  {Buffer|Array|String|Number} input - What to write to the buffer?
* @return {Promise:Number} - Returns the length of the current buffer.

``` js
async () => {
	const sbuf = new ExpandingBuffer()
	await sbuf.write('test')
	await sbuf.write('test2')

	// sbuf, when dumped, will be a buffer containing "testtest2"
}
```

### ExpandingBuffer.getCurrentBuffer()

Gets the current working buffer we're building on.

* @return {Promise:Buffer}

``` js
	const sbuf = new ExpandingBuffer()
	await sbuf.write('test')
	const currentBuffer = await sbuf.getCurrentBuffer()

	// currentBuffer would equal <Buffer 74 65 73 74>
```

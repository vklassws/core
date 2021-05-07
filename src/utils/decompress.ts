import zlib from 'zlib'
import util from 'util'

export const decompressEncodings = ['br', 'deflate', 'gzip']

export type DecompressEncoding = 'br' | 'deflate' | 'gzip'

/**
 * Decompresses a buffer with specified encoding.
 * Supported encodings are: br, deflate, gzip.
 */
export default async function decompress(buffer: string | ArrayBuffer | NodeJS.ArrayBufferView, encoding: DecompressEncoding): Promise<Buffer> {
	if (encoding === 'br') {
		return util.promisify(zlib.brotliDecompress)(buffer)
	}

	if (encoding === 'deflate') {
		return util.promisify(zlib.inflate)(buffer)
	}

	if (encoding === 'gzip') {
		return util.promisify(zlib.gunzip)(buffer)
	}

	throw new Error('Invalid decompress encoding.')
}
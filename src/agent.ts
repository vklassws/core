import superagent from 'superagent'
import CoreError, { ErrorCode } from './error'
import decompress, { decompressEncodings, DecompressEncoding } from './utils/decompress'
import { incasesensitivify } from './utils/incasesensitivify'
import fs from 'fs'
import formatHistory from './utils/formatHistory'

export interface HistoryData {
	url: string
	data: any
	headers: any
}

export interface AgentHistory {
	method: string
	confidential: boolean
	response?: HistoryData
	request: HistoryData
	status?: number
}

export interface AgentConstructorOptions {
	historyHideConfidential?: boolean
	historyLog?: boolean | string
}

export interface Headers {
	[key: string]: string
}

export interface Queries {
	[key: string]: string
}

export interface RequestConfig {
	/**
	 * Hide request data and headers in history.
	 */
	confidential?: boolean

	data?: string | object

	headers?: Headers

	/**
	 * How many retry request to make _after_ fail.
	 * 
	 * @default 1
	 */
	retries?: number

	/**
	 * Url queries. For example `?format=json&dest=/login`.
	 */
	queries?: Queries

	/**
	 * Max redirects.
	 * 
	 * @default 10
	 */
	redirects?: number
}

export interface ChainRequestConfig extends RequestConfig {
	/**
	 * If request contains confidential information.
	 * If set to true the request data & headers will not appear in history.
	 */
	confidential?: boolean
}

// export interface Response {
// 	/** Parsed response data. */
// 	data: any

// 	/** Raw reponse data. */
// 	text: string

// 	/** Response status code. */
// 	status: number

// 	/** Response status text. */
// 	headers: any
// }

export interface Response extends superagent.Response {
	body: Buffer | string
	data: string
	headersLow: Headers
	encoding: string
}

export interface Request extends Omit<superagent.Request, keyof Promise<unknown>>, Promise<Response> { }

export class Agent {
	_agent = superagent.agent()
	history: AgentHistory[] = []

	addHistory(history: AgentHistory): void {
		this.history.push(history)

		if (this._options.historyLog)
			fs.appendFileSync(this.historyLogFilePath, formatHistory(4, [history]))
	}

	get historyLogFilePath(): string {
		return typeof this._options.historyLog === 'string' ? this._options.historyLog : 'history.log'
	}

	constructor(
		public readonly headers: any,
		public readonly encoding: BufferEncoding,
		public readonly mainHost: string,
		public readonly _options: AgentConstructorOptions
	) {
		fs.appendFileSync(this.historyLogFilePath, `\n\n${'-'.repeat(26)} ${new Date().toISOString()} ${'-'.repeat(26)}\n\n`)
	}

	get(url: string, config?: ChainRequestConfig): Request {
		return this.request('get', url, config)
	}

	delete(url: string, config?: ChainRequestConfig): Request {
		return this.request('delete', url, config)
	}

	head(url: string, config?: ChainRequestConfig): Request {
		return this.request('head', url, config)
	}

	options(url: string, config?: ChainRequestConfig): Request {
		return this.request('options', url, config)
	}

	post(url: string, data?: any, config?: ChainRequestConfig): Request {
		config = config ?? {}
		if (data !== undefined && data !== null)
			config.data = data
		return this.request('post', url, config)
	}

	put(url: string, data?: any, config?: ChainRequestConfig): Request {
		config = config ?? {}
		if (data !== undefined && data !== null)
			config.data = data
		return this.request('put', url, config)
	}

	patch(url: string, data?: any, config?: ChainRequestConfig): Request {
		config = config ?? {}
		if (data !== undefined && data !== null)
			config.data = data
		return this.request('patch', url, config)
	}

	request(method: 'get' | 'delete' | 'head' | 'options' | 'post' | 'put' | 'patch', url: string, config: ChainRequestConfig | undefined): Request {
		const headers: Headers = {
			...{

			},
			...this.headers,
			...(config?.headers ?? {})
		}
		const queries: Queries = config?.queries ?? {}

		if (url.startsWith('/')) {
			url = this.mainHost.replace(/\/$|$/, '') + url
		} else {
			let parsedUrl: URL

			try {
				parsedUrl = new URL(url)
			} catch (err) {
				if (typeof err === 'object' && typeof err.code === 'string' && err.code.endsWith('_INVALID_URL')) {
					throw new CoreError(ErrorCode.INVALID_URL, url)
				}

				throw err
			}

			if (parsedUrl.host === this.mainHost) {
				throw new CoreError(ErrorCode.SHOULD_BE_RELATIVE, url)
			}
		}

		const req = this._agent[method](url) as unknown as Request

		req.buffer(true)

		req.parse((res, callback) => {
			const buffer: any[] = []

			res.on('data', (chunk) => {
				buffer.push(chunk)
			})

			res.on('end', () => {
				callback(null, Buffer.concat(buffer))
			})
		})

		for (const key in headers) {
			if (Object.prototype.hasOwnProperty.call(headers, key)) {
				const header = headers[key]
				req.set(key, header)
			}
		}

		req.query(queries)
		req.redirects(config?.redirects ?? 10)
		req.retry(config?.retries ?? 1)

		if (config?.data !== undefined && config?.data !== null)
			req.send(config.data)

		const toHistory = (res: Response | undefined): AgentHistory => {
			const history: AgentHistory = {
				confidential: config?.confidential === true && this._options.historyHideConfidential !== false,
				method: method,
				request: {
					url: url,
					data: config?.data,
					headers: headers
				}
			}

			if (res) {
				history.status = res.status
				history.response = {
					// https://github.com/visionmedia/superagent/issues/1467
					url: 'UNKNOWN',
					data: res.body,
					headers: res.headers
				}
			}

			return history
		}

		const toResponse = async (res: superagent.Response & Partial<Response>) => {
			res.headersLow = incasesensitivify(res.headers)
			res.encoding = (res.headersLow as Headers)['content-encoding']
			const isSupportedEncoding = decompressEncodings.includes(res.encoding)
			if (isSupportedEncoding)
				res.body = await decompress(res.body, res.encoding as DecompressEncoding) ?? res.body
			else
				res.body = Buffer.isBuffer(res.body) ? res.body : Buffer.from(res.body)
			const isBufferEncoding = ['ascii', 'utf8', 'utf-8', 'utf16le', 'ucs2', 'ucs-2', 'base64', 'base64url', 'latin1', 'binary', 'hex'].includes(res.charset)
			res.data = res.body.toString(isBufferEncoding ? res.charset as BufferEncoding : undefined)
			return res as Response
		}

		const promise = new Promise<Response>((resolve, reject) => {
			req.then(res => {
				toResponse(res).then(res => {
					this.addHistory(toHistory(res))
					resolve(res)
				})
			}).catch(async err => {
				err.response = await toResponse(err.response)
				this.addHistory(toHistory(err.response))
				err.history = this.history
				reject(err)
			})
		}) as Request

		for (const _key in req) {
			const key = _key as keyof typeof req
			if (Object.prototype.hasOwnProperty.call(req, key)) {
				const value = req[key]
				if (!['then', 'catch', 'finally'].includes(key)) {
					promise[key] = value as any
				}
			}
		}

		return promise
	}
}

export default Agent

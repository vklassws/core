import superagent from 'superagent'
import decompress, { decompressEncodings, DecompressEncoding } from './utils/decompress'
import { incasesensitivify } from './utils/incasesensitivify'

export interface HistoryData {
	url: string
	data: any
	headers: any
}

export interface History {
	method: string
	confidential: boolean
	response?: HistoryData
	request: HistoryData
	status?: number
}

export interface AgentOptions {
	historyHideConfidential?: boolean
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

export interface AgentRequestConfig extends RequestConfig {
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

export default class Agent {
	_agent = superagent.agent()
	history: History[] = []

	constructor(
		public readonly headers: any,
		public readonly encoding: BufferEncoding,
		public readonly _options: AgentOptions
	) { }

	get(url: string, config?: AgentRequestConfig): Promise<Request> {
		return this.request('get', url, config)
	}

	delete(url: string, config?: AgentRequestConfig): Promise<Request> {
		return this.request('delete', url, config)
	}

	head(url: string, config?: AgentRequestConfig): Promise<Request> {
		return this.request('head', url, config)
	}

	options(url: string, config?: AgentRequestConfig): Promise<Request> {
		return this.request('options', url, config)
	}

	post(url: string, data?: any, config?: AgentRequestConfig): Promise<Request> {
		config = config ?? {}
		if (data !== undefined && data !== null)
			config.data = data
		return this.request('post', url, config)
	}

	put(url: string, data?: any, config?: AgentRequestConfig): Promise<Request> {
		config = config ?? {}
		if (data !== undefined && data !== null)
			config.data = data
		return this.request('put', url, config)
	}

	patch(url: string, data?: any, config?: AgentRequestConfig): Promise<Request> {
		config = config ?? {}
		if (data !== undefined && data !== null)
			config.data = data
		return this.request('patch', url, config)
	}

	async request(method: 'get' | 'delete' | 'head' | 'options' | 'post' | 'put' | 'patch', url: string, config: AgentRequestConfig | undefined): Promise<Request> {
		const headers: Headers = {
			...{

			},
			...this.headers,
			...(config?.headers ?? {})
		}
		const queries: Queries = config?.queries ?? {}

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

		// Headers
		for (const key in headers) {
			if (Object.prototype.hasOwnProperty.call(headers, key)) {
				const header = headers[key]
				req.set(key, header)
			}
		}

		// Queries
		req.query(queries)

		// Redirects
		req.redirects(config?.redirects ?? 10)

		// Retry
		req.retry(config?.retries ?? 1)

		// Body
		if (config?.data !== undefined && config?.data !== null)
			req.send(config.data)

		const toHistory = (res: Response | undefined): History => {
			const history: History = {
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
			res.encoding = res.headersLow['content-encoding']
			const isSupportedEncoding = decompressEncodings.includes(res.encoding)
			if (isSupportedEncoding)
				res.body = await decompress(res.body, res.encoding as DecompressEncoding) ?? res.body
			else
				res.body = Buffer.isBuffer(res.body) ? res.body : Buffer.from(res.body)
			const isBufferEncoding = ['ascii', 'utf8', 'utf-8', 'utf16le', 'ucs2', 'ucs-2', 'base64', 'base64url', 'latin1', 'binary', 'hex'].includes(res.charset)
			res.data = res.body.toString(isBufferEncoding ? res.charset as BufferEncoding : undefined)
		}

		return req.then(async res => {
			await toResponse(res)
			this.history.push(toHistory(res))
			return res
		}).catch(async err => {
			await toResponse(err.response)
			this.history.push(toHistory(err.response))
			err.history = this.history
			return err
		})
	}
}
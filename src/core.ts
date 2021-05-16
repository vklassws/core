import Agent from './agent'
import { Credentials } from './loaders/auth'
import * as loaders from './__loaders'
import { PipeFn, Pipeline, PipePipe } from './pipeline'

export interface Options {
	/**
	 * Request headers.
	 * @default Core.requestHeaders
	 */
	headers?: any

	/**
	 * Request and response buffer encoding.
	 * @default 'utf-8'
	 */
	encoding?: BufferEncoding

	/**
	 * Hide confidential requests in chain history (recommended).
	 * @default true
	 */
	historyHideConfidential?: boolean

	historyLog?: boolean | string
}

export class Core {
	static readonly requestHeaders = {
		'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', // HTML, XHMTL+XML
		'Accept-Encoding': 'gzip, deflate, br',
		'Accept-Language': 'en-US,en;q=0.5', // English US
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive', // Close connection, we do not make any more reuqests.
		'Pragma': 'no-cache',
		'TE': 'trailers',
		'Upgrade-Insecure-Requests': '1',
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36' // Chrome 90
	}

	readonly encoding: BufferEncoding
	readonly headers: any
	readonly mainHost: string
	readonly agent: Agent

	get loaders(): typeof loaders {
		return loaders
	}

	pipeline(): Pipeline {
		return new Pipeline(this.agent)
	}

	pipe<Fn extends PipeFn>(fn: Fn): PipePipe<Fn> {
		const pipeline = this.pipeline()
		return pipeline.pipe(fn)
	}

	/**
	 * Shorthand for `this.loaders.auth.authenticate`
	 */
	async authenticate(credentials: Credentials): Promise<void> {
		await this.pipe(loaders.auth.authenticate(credentials))
	}

	constructor(options?: Options) {
		this.encoding = options?.encoding ?? 'utf-8'
		this.headers = options?.headers ?? Core.requestHeaders
		this.mainHost = 'https://www.vklass.se'

		this.agent = new Agent(this.headers, this.encoding, this.mainHost, {
			historyHideConfidential: options?.historyHideConfidential ?? true,
			historyLog: options?.historyLog
		})
	}
}
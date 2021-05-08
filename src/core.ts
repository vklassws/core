import Agent from './agent'
import CoreAuthenticator, { CoreAuthenticatorCredentials } from './authenticator'
import classExtends from './utils/classExtends'

// Extenders
import feed from './extenders/feed'
import news from './extenders/news'
import schedule from './extenders/schedule'
export const CoreExtenders = [feed, news, schedule]

export interface Hosts {
	readonly AUTH: string
	readonly WWW: string
}

export interface CoreOptions {
	/**
	 * Hosts to make requests through.
	 * @default Core.HOSTS
	 */
	hosts?: Hosts

	/**
	 * Request headers.
	 * @default Core.HEADERS
	 */
	headers?: any
	
	/**
	 * Request and response buffer encoding.
	 * @default Core.DEFAULT_ENCODING
	 */
	encoding?: BufferEncoding

	/**
	 * Hide confidential requests in chain history (recommended).
	 * @default true
	 */
	historyHideConfidential?: boolean
}

@classExtends(CoreExtenders)
export default class Core extends Agent {
	public static readonly DEFAULT_ENCODING: BufferEncoding = 'utf-8'
	public static readonly HOSTS: Hosts = {
		AUTH: 'https://auth.vklass.se',
		WWW: 'https://www.vklass.se'
	}
	public static readonly HEADERS: any = {
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

	public readonly encoding: BufferEncoding
	public readonly hosts: Hosts
	public readonly headers: any

	public init: CoreAuthenticator['init']

	constructor(
		credentials: CoreAuthenticatorCredentials,
		options?: CoreOptions
	) {
		super(options?.headers ?? Core.HEADERS, options?.encoding ?? Core.DEFAULT_ENCODING, {
			historyHideConfidential: options?.historyHideConfidential
		})

		this.encoding = options?.encoding ?? Core.DEFAULT_ENCODING
		this.hosts = options?.hosts ?? Core.HOSTS
		this.headers = options?.headers ?? Core.HEADERS

		const authenticator = new CoreAuthenticator(this, credentials)
		this.init = () => authenticator.init()
	}
}

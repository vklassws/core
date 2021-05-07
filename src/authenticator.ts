import Core from '@/core'
import cheerio from 'cheerio'

export interface CoreAuthenticatorCredentials {
	username: string
	password: string
}

export default class CoreAuthenticator {
	readonly #credentials: CoreAuthenticatorCredentials

	constructor(private core: Core, credentials: CoreAuthenticatorCredentials) {
		this.#credentials = credentials
	}

	private async getRequestVerificationToken() {
		const { data } = await this.core.get(this.core.hosts.AUTH + '/credentials')

		const $ = cheerio.load(data)

		const input = $('input').toArray().find(el => el.attribs.name === '__RequestVerificationToken')

		return input?.attribs.value
	}

	public async init(): Promise<void> {
		const { username, password } = this.#credentials
		
		const requestVerificationToken = await this.getRequestVerificationToken()

		const content = `Username=${username}&Password=${password}&RememberMe=true&__RequestVerificationToken=${requestVerificationToken}`

		await this.core.post(this.core.hosts.AUTH + '/credentials/signin', content, {
			confidential: true,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': content.length.toString()
			}
		})
	}
}
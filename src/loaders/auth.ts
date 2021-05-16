import cheerio from 'cheerio'
import { Pipe } from '../pipeline'

export interface Credentials {
	username: string
	password: string
}

async function getAuthToken(http: Pipe['http']): Promise<string | undefined> {
	const res = await http.get('https://auth.vklass.se/credentials')
	const $ = cheerio.load(res.data)

	const input = $('input').toArray().find(el => el.attribs.name === '__RequestVerificationToken')
	return input?.attribs.value
}

export function authenticate(credentials: Credentials) {
	return async function (pipe: Pipe): Promise<void> {
		const { username, password } = credentials
	
		const token = await getAuthToken(pipe.http)
	
		const body = `Username=${username}&Password=${password}&RememberMe=true&__RequestVerificationToken=${token}`
	
		await pipe.http.post('https://auth.vklass.se/credentials/signin', body, {
			confidential: true,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': body.length.toString()
			}
		})
	}
}

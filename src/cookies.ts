import c from 'cookie'
import sc from 'set-cookie-parser'

export interface Cookie {
	name: string
	value: string
	path?: string
	expires?: Date
	maxAge?: number
	domain?: string
	secure?: boolean
	httpOnly?: boolean
	sameSite?: boolean | string
}

export default class Cookies {
	private list: Cookie[] = []

	set(string: string): void {
		this.list = this.list.concat(sc.parse(string) as Partial<Cookie> as Cookie)
	}

	add(cookie: Cookie): void {
		this.list.push(cookie)
	}

	remove(name: string | Cookie): void {
		const _name = typeof name === 'string' ? name : name.name
		this.list.splice(this.list.findIndex(cookie => cookie.name === _name), 1)
	}

	serialize(): string[] {
		return this.list.map(cookie => c.serialize(cookie.name, cookie.value))
	}
}
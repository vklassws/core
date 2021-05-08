import _Core from '../../src/index'
import fs from 'fs'

let credentials: any

try {
	credentials = JSON.parse(fs.readFileSync('account.json', 'utf-8'))
} catch (err) {
	if (process.env.password && process.env.username) {
		credentials = {
			password: process.env.password,
			username: process.env.username
		}
	} else if (err?.code === 'ENOENT') {
		throw new Error('Credentials is missing. Use env or "/account.json.".')
	} else {
		throw err
	}
}

if (!credentials.username) {
	throw new Error('Username is missing.')
}

if (!credentials.password) {
	throw new Error('Password is missing.')
}

const core = new _Core(credentials)

export default core

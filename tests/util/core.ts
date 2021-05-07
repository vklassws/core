import Core from '@/index'
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
		throw new Error('Credentials is missing. Use env or /account.json.')
	}

	throw err
}

if (!credentials.username) {
	throw new Error('Username is missing.')
}

if (!credentials.password) {
	throw new Error('Password is missing.')
}

const core = new Core(credentials, {
	// Set to true to see confidential information in exceptions. History _will_ include
	// confidential information. Some confidential information may still be included even
	// if set to true. Always check history before sharing! Do not commit set to false.
	historyHideConfidential: false
})

export default core
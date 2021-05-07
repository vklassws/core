import { ChainHistory } from '@/index'

const tab = (n: number) => '     '.repeat(n)

function formatData(data: any, offset: number) {
	const lines = []

	if (Buffer.isBuffer(data)) {
		lines.push('...') // data.toString('utf8')
	} else if (typeof data === 'object') {
		for (const key of Object.keys(data).sort()) {
			if (Object.prototype.hasOwnProperty.call(data, key)) {
				let value = data[key]

				if (Array.isArray(value)) {
					if (value.length <= 0) {
						value = '[]'
					} else {
						value = `[\n${value.map((item: any) => tab(offset + 1) + JSON.stringify(item)).join(',\n')}\n${tab(offset)}]`
					}
				} else {
					value = JSON.stringify(value)
				}

				lines.push(`\n${tab(offset)}${key}: ${value}`)
			}
		}
	} else {
		lines.push(JSON.stringify(data))
	}

	return lines.join('')
}

export default function format(data: ChainHistory[]): string {
	const gen = []

	for (const history of data) {
		const r = [
			`${tab(1)}${history.method} ${history.request.url} -> ${history.response?.url ?? '[NO_RESPONSE]'}`,
			`${tab(2)}STATUS: ${history.status ?? '[NO_RESPONSE]'}`,
		]

		if (history.confidential) {
			r.push(
				`${tab(2)}REQUEST: [CONFIDENTIAL]`,
				`${tab(2)}RESPONSE: [CONFIDENTIAL]`,
			)
		} else {
			r.push(
				`${tab(2)}REQUEST: `,
				`${tab(3)}DATA: ${formatData(history.request.data, 4)}`,
				`${tab(3)}HEADERS: ${formatData(history.request.headers, 4)}`
			)

			if (history.response) {
				r.push(
					`${tab(2)}RESPONSE: `,
					`${tab(3)}DATA: ${formatData(history.response.data, 4)}`,
					`${tab(3)}HEADERS: ${formatData(history.response.headers, 4)}`
				)
			} else {
				r.push(
					`${tab(2)}RESPONSE: [NO_RESPONSE]`
				)
			}
		}

		gen.push(r.join('\n'))
	}

	return '\n     ' + gen.join('\n\n')
}
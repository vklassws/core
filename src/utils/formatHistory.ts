import { AgentHistory } from '..'

function toTab(tab: string | number, indent: number) {
	if (tab < 1) return ''

	if (typeof tab === 'string')
		return tab.repeat(indent)
	else
		return ' '.repeat(tab).repeat(indent)
}

function formatData(tab: string | number, offset: number, data: any) {
	let generated = ''

	if (Buffer.isBuffer(data)) {
		generated = '...' // data.toString('utf8')
	} else if (typeof data === 'object') {
		for (const key of Object.keys(data).sort()) {
			if (Object.prototype.hasOwnProperty.call(data, key)) {
				let value = data[key]

				if (Array.isArray(value)) {
					if (value.length <= 0) {
						value = '[]'
					} else {
						value = `[\n${value.map((item: any) => toTab(tab, offset + 2) + JSON.stringify(item)).join(',\n')}\n${toTab(tab, offset + 1)}]`
					}
				} else {
					value = JSON.stringify(value)
				}

				generated += `\n${toTab(tab, offset + 1)}${key}: ${value}`
			}
		}
	} else {
		generated = JSON.stringify(data)
	}

	return generated
}

export default function formatHistory(tab: string | number, data: AgentHistory[]): string {
	const lines = []

	for (const history of data) {
		const localLines = [
			`${toTab(tab, 0)}${history.method} ${history.request.url} -> ${history.response?.url ?? '[NO_RESPONSE]'}`,
			`${toTab(tab, 1)}STATUS: ${history.status ?? '[NO_RESPONSE]'}`,
		]

		if (history.confidential) {
			localLines.push(
				`${toTab(tab, 1)}REQUEST: [CONFIDENTIAL]`,
				`${toTab(tab, 1)}RESPONSE: [CONFIDENTIAL]`,
			)
		} else {
			localLines.push(
				`${toTab(tab, 1)}REQUEST: `,
				`${toTab(tab, 2)}DATA: ${formatData(tab, 3, history.request.data)}`,
				`${toTab(tab, 2)}HEADERS: ${formatData(tab, 3, history.request.headers)}`
			)

			if (history.response) {
				localLines.push(
					`${toTab(tab, 1)}RESPONSE: `,
					`${toTab(tab, 2)}DATA: ${formatData(tab, 3, history.response.data)}`,
					`${toTab(tab, 2)}HEADERS: ${formatData(tab, 3, history.response.headers)}`
				)
			} else {
				localLines.push(
					`${toTab(tab, 1)}RESPONSE: [NO_RESPONSE]`
				)
			}
		}

		lines.push(localLines.join('\n'))
	}

	return lines.join('\n\n') + '\n\n'
}
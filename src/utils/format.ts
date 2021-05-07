/**
 * Parse custom formatting of date.
 * 
 * Examples of formating:
 * - Short: mån 1 jan-21
 * - Long: mån 1 januari 21
 */
export function parseDateString(type: 'short' | 'long', string: string): Date {
	if (type === 'short') {
		string = string.toLowerCase()
		const [_day, date, month, year] = Array.from(/([a-z]{3,3}) ([0-9]{1,2}) ([a-z]{3,3})-([0-9]{2,2})/.exec(string) ?? []).slice(1)

		const monthN = (() => {
			switch (month) {
			case 'jan': return 1
			case 'feb': return 2
			case 'mar': return 3
			case 'apr': return 4
			case 'maj': return 5
			case 'jun': return 6
			case 'jul': return 7
			case 'aug': return 8
			case 'spt': return 9
			case 'okt': return 10
			case 'nov': return 11
			case 'dec': return 12
			default: return NaN
			}
		})()

		return new Date(
			parseInt(year),
			monthN,
			parseInt(date)
		)
	} else if (type === 'long') {
		string = string.toLowerCase()

		if (string.startsWith('idag,')) {
			const [ hours, minutes ] = Array.from(/idag, ([0-9]{2,2}):([0-9]{2,2})/.exec(string) ?? []).slice(1)
			const date = new Date()
			date.setHours(parseInt(hours))
			date.setHours(parseInt(minutes))
			date.setSeconds(0)
			date.setMilliseconds(0)
			return date
		} else {
			const [_day, date, month, year, hours, minutes] = Array.from(/([a-zåäö]+) ([0-9]{1,2}) ([a-zåäö]+) (2[0-9]{3,3})(?: kl: ([0-9]{2,2}):([0-9]{2,2})|)/.exec(string) ?? []).slice(1)

			const monthN = (() => {
				switch (month) {
				case 'januari': return 1
				case 'februari': return 2
				case 'mars': return 3
				case 'april': return 4
				case 'maj': return 5
				case 'juni': return 6
				case 'juli': return 7
				case 'augusti': return 8
				case 'september': return 9
				case 'oktober': return 10
				case 'november': return 11
				case 'december': return 12
				default: return NaN
				}
			})()
	
			return new Date(
				parseInt(year),
				monthN,
				parseInt(date),
				hours ? parseInt(hours) : 0,
				minutes ? parseInt(minutes) : 0
			)
		}
	}

	throw new Error('Invalid date type.')
}
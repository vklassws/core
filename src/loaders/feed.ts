import cheerio from 'cheerio'
import { Pipe } from '../pipeline'
import { parseDateString } from '../utils/format'

export interface Feed {
	body: string
	time: number
}

export function getFeeds() {
	return async function (pipe: Pipe): Promise<Feed[]> {
		const { data } = await pipe.request('/Latest.aspx', '/Latest.aspx')
		const $ = cheerio.load(data)

		const feed = $('.feed .profile-feed').toArray().map(element => {
			const el = $(element)

			const body = $('.feed-body', el).text().trim()
			const time = parseDateString('long', $('.feed-date', el).text()).getTime()

			return {
				body,
				time
			}
		})

		return feed
	}
}
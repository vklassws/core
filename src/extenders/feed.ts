/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import cheerio from 'cheerio'
import { parseDateString } from '@/utils/format'

export interface Feed {
	body: string
	date: Date
}

type Core = typeof import('@/core').default
export default (Core: Core) => class FeedExtender extends Core {
	async getFeed(): Promise<Feed[]> {
		const { data } = await this.get(this.hosts.WWW + '/Latest.aspx')
		const $ = cheerio.load(data)

		return $('.feed .profile-feed').toArray().map<Feed>(element => {
			const el = $(element)

			const body = $('.feed-body', el).text().trim()
			const date = parseDateString('long', $('.feed-date', el).text())

			return {
				body,
				date
			}
		})
	}
}
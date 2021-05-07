/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import Core from '@/core'
import cheerio from 'cheerio'
import { parseDateString } from '@/utils/format'

export interface NewsAttachment {
	name: string
	url: string
}

export interface NewsDetails {
	attachments: NewsAttachment[]
	date: Date
	dateSpan: [Date, Date]
	authorName: string
	authorId: string
	roles: string[]
	title: string
}

export interface News {
	attachments: boolean
	date: Date
	title: string
	info: string
	id: string
}

export default (C: typeof Core) => class NewsExtender extends C {
	/** Get news details */
	async getNewsDetails(id: string): Promise<NewsDetails | undefined> {
		const { data } = await this.get(this.hosts.WWW + `/News/NewsDetails.aspx?id=${id}`)

		const $ = cheerio.load(data)

		const attachments = $('.NewsAttachment ul li a[href]').toArray().map<NewsAttachment>(element => {
			const el = $(element)

			return {
				name: el.text(),
				url: el.attr().href
			}
		})

		const author = $('#ctl00_ContentPlaceHolder2_newsCreatorLabel')
		const authorId = /id=([^&]+)(?:&|$)/.exec(author.attr().href)?.[1] as string
		const authorName = author.text()

		const roles = $('#ctl00_ContentPlaceHolder2_ShowForRoles').text().split(', ')

		const [startDate, endDate] = $('#ctl00_ContentPlaceHolder2_VisibilityLabel').text().split(' till ').map(d => parseDateString('short', d))
		const dateSpan: [Date, Date] = [startDate, endDate]
		const date = dateSpan[0]

		const title = $('.metainfo').text()

		return {
			attachments,
			authorId,
			authorName,
			date,
			roles,
			dateSpan,
			title
		}
	}

	/** Get all news, date ascending */
	async getNews(): Promise<News[]> {
		const { data } = await this.get(this.hosts.WWW + '/default.aspx')

		const $ = cheerio.load(data)

		return $('.newsPost').toArray().map<News>(element => {
			const header = $('.newsPostLink', element)

			return {
				attachments: !header.first().hasClass('newsDate'),
				date: parseDateString('long', $('.newsDate', header).text()),
				id: /id=([^&]+)(?:&|^)/.exec(header.attr('href') as string)?.[1] as string,
				info: $('.newsInfo', element).text(),
				title: $('h3', header).nextAll().text()
			}
		}).sort((a, b) => b.date.getTime() - a.date.getTime())
	}
}
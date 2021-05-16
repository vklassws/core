import cheerio from 'cheerio'
import { parseDateString } from '../utils/format'
import { Pipe } from '../pipeline'

export interface NewsAttachment {
	name: string
	url: string
}

export interface NewsDetails {
	attachments: NewsAttachment[]
	from: number
	to: number
	authorName: string
	authorId: string
	roles: string[]
	title: string
}

export interface News {
	attachments: boolean
	time: number
	title: string
	info: string
	id: string
}

export function getNewsDetails(id: string) {
	return async function (pipe: Pipe): Promise<NewsDetails> {
		const { data } = await pipe.request(`/News/NewsDetails.aspx?id=${id}`, '/News/NewsDetails.aspx')
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

		const [from, to] = $('#ctl00_ContentPlaceHolder2_VisibilityLabel').text().split(' till ').map(d => parseDateString('short', d).getTime())

		const title = $('.metainfo').text().slice(0, -2)

		return {
			attachments,
			authorId,
			authorName,
			roles,
			title,
			from,
			to
		}
	}
}


export function getNews() {
	return async function (pipe: Pipe): Promise<News[]> {
		const { data } = await pipe.request('/default.aspx', '/default.aspx')
		const $ = cheerio.load(data)

		const news = $('.newsPost').toArray().map<News>(element => {
			const header = $('.newsPostLink', element)

			return {
				attachments: !header.first().hasClass('newsDate'),
				time: parseDateString('long', $('.newsDate', header).text()).getTime(),
				id: /id=([^&]+)(?:&|^)/.exec(header.attr('href') as string)?.[1] as string,
				info: $('.newsInfo', element).text(),
				title: $('h3', header).nextAll().text()
			}
		}).sort((a, b) => b.time - a.time)

		return news
	}
}
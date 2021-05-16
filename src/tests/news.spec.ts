import assert from 'assert'
import core from './utils/core'
import validator from './utils/validator'
import newsValid from '../schema/news/news.json'
import detailsValid from '../schema/news/details.json'

let newsId: string | undefined

describe('news', () => {
	before(async () => {
		await core.before()
	})

	it('list news', async () => {
		const news = await core.pipe(core.loaders.news.getNews())
		if (!validator.validate(newsValid, news))
			throw validator.errors
		newsId = news[0]?.id
	})

	it('list details', async () => {
		assert(!!newsId)
		const details = await core.pipe(core.loaders.news.getNewsDetails(newsId))
		if (!validator.validate(detailsValid, details))
			throw validator.errors
	})
})
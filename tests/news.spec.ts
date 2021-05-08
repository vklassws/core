import assert from 'assert'
import core from './util/core'

describe('news', () => {
	before(async () => {
		await core.init()
	})

	it('list news', async () => {
		const newsList = await core.getNews()
		assert(newsList.length > 0)

		for (const news of newsList) {
			assert.notStrictEqual(news, undefined)
			assert.notStrictEqual(news.attachments, undefined)
			assert.strictEqual(news.date?.getHours(), 0)
			assert.notStrictEqual(news.id, undefined)
			assert.notStrictEqual(news.info, undefined)
			assert.notStrictEqual(news.title, undefined)
		}
	})

	it('list details', async () => {
		const news = await core.getNews()
		assert(news.length > 0)

		const details = await core.getNewsDetails(news[0].id)
		assert.strictEqual(typeof details, 'object')
		assert.notStrictEqual(details?.attachments, undefined)
		assert.notStrictEqual(details?.authorId, undefined)
		assert.ok(details?.date?.getTime())
		assert.ok(Array.isArray(details?.roles))
		assert.strictEqual(details?.dateSpan?.length, 2)
		assert.notStrictEqual(details?.title, undefined)
	})
})
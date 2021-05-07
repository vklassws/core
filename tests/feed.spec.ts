import assert from 'assert'
import core from '~/tests/util/core'

describe('feed', () => {
	before(async () => {
		await core.init()
	})

	it('list feed', async () => {
		const feedList = await core.getFeed()
		assert(feedList.length > 0)

		for (const feed of feedList) {
			assert.notStrictEqual(feed, undefined)
			assert.notStrictEqual(feed.body, undefined)
			assert.notStrictEqual(feed.date, undefined)
		}
	})
})
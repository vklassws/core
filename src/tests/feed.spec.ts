import core from './utils/core'
import validator from './utils/validator'
import feedsValid from '../schema/feed/feeds.json'

describe('feed', () => {
	before(core.before)

	it('list feed', async () => {
		const feeds = await core.pipe(core.loaders.feed.feeds())
		if (!validator.validate(feedsValid, feeds))
			throw validator.errors
	})
})
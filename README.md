# VklassWS Core

This package contains the accual web scraper and APIs. The package is not complete and will probaly never be. Much functionallity is not implemented yet. But _you_ can [contribute extenders](#contributing) to add functionallity ;)

> **Note!** The core is likely to change drastically _with breaking changes_ before the v1 relase.

## Installation

Make you you have [yarn](https://yarnpkg.com/) version 2 installed.

1. Clone this repository
2. Run `yarn install` and `yarn build`
3. Run `yarn link` or use npm, to link the package.

Now, you can install the package using `yarn add @vws/core` or `npm install @vws/core`. Later, to unlink the package use `yarn unlink` in the core package.

## Usage

First off you need to initialize (signin) a new core. Then you can you any method provided by the extenders, the names _should_ be self explanatory.

```typescript
import core from '@vws/core'
await core.init()

// Functionallity provided by extender news.
const news = core.getNews()

// Functionallity provided by extender news.
const feed = core.geedFeed()
```

## Contributing

Read rules and guidelines in .github/contributing.md before continuing!

### Extenders

Most likely you will be contributing extenders. Extenders are separated from eachother (partially). Extenders will extend methods and properties the core class. All requests are chained together using [superagent](https://npmjs.com/package/superagent)'s agent. You will be using [cheerio](https://npmjs.com/package/cheerio) to parse and extract data from the HTML responses.

> **Note!** You will always be signed, so making requests to the main host is accepted by VKlass authentication service.

To make a new extender place a file in `src/extenders` with the name describing the extender the best. The exports will not export themself. To add the extender exports to the entry, add . You will also need to make a [test specification](#testing-extenders) for the extender. Below is a simple example extracting the feed from "/Latest.aspx".

> **Remember!** to add `export * from '@/extenders/your_extender'` to `index.ts` to export all exports from your extender.

```typescript
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
```

### Testing Extenders

For the extender to always be working you will need to specify a test for the extender, so the issue can be fixed as soon as possible. The test will run every two hours to ensure the extenders is working. To make a test secification place a file with the same name as the extender ending with ".spec.ts". Below is an test specification example for the feed extender.

```typescript
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
```

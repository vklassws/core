import core from './utils/core'
import validator from './utils/validator'
import scheduleValid from '../schema/schedule/schedule.json'

describe('schedule', () => {
	before(async () => {
		await core.before()
	})

	it('get schedule', async () => {
		const schedule = await core.pipe(core.loaders.schedule.schedule())
		if (!validator.validate(scheduleValid, schedule))
			throw validator.errors
	})
})
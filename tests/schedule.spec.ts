import assert from 'assert'
import core from './util/core'

describe('schedule', () => {
	before(async () => {
		await core.init()
	})

	it('get schedule', async () => {
		const schedule = await core.getSchedule()
		assert.notStrictEqual(schedule, undefined)
		assert(Array.isArray(schedule.exams))
		assert(Array.isArray(schedule.lessons))

		for (const exam of schedule.exams) {
			assert.notStrictEqual(exam, undefined)
			assert.strictEqual(typeof exam.cid, 'string')
			assert(!!exam.date.getTime())
			assert.strictEqual(typeof exam.id, 'string')
			assert.strictEqual(typeof exam.infoShort, 'string')
			assert.strictEqual(typeof exam.lesson, 'string')
			assert.strictEqual(typeof exam.title, 'string')
			assert.strictEqual(typeof exam.type, 'string')
		}

		for (const lesson of schedule.lessons) {
			assert.notStrictEqual(lesson, undefined)
			assert.strictEqual(typeof lesson.canceled, 'boolean')
			assert(!!lesson.from.getTime())
			assert.strictEqual(typeof lesson.information, 'string')
			assert.strictEqual(typeof lesson.subject, 'string')
			assert.strictEqual(typeof lesson.subjectShort, 'string')
			assert.strictEqual(typeof lesson.teacherShort, 'string')
			assert(!!lesson.to.getTime())
			assert.strictEqual(typeof lesson.where, 'string')
		}
	})
})
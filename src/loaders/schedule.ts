import cheerio from 'cheerio'
import { Pipe } from '../pipeline'

export interface ScheduleLesson {
	from: number
	to: number
	subject: string
	subjectShort: string
	teacherShort: string
	canceled: boolean
	information: string
	where: string
}

export interface ScheduleExam {
	id: string
	cid: string
	type: string
	lesson: string
	time: number
	infoShort: string
	title: string
}

export interface ScheduleEvent {
	name: string
	time: number
}

export interface Schedule {
	lessons: ScheduleLesson[]
	exams: ScheduleExam[]
	events: ScheduleEvent[]
}

export function getSchedule() {
	return async function (pipe: Pipe): Promise<Schedule> {
		const { data } = await pipe.request('/schema.aspx', '/schema.aspx')
		const $ = cheerio.load(data)

		const [syear, smonth, sdate] = Array.from(/(2[0-9]{3,3})-([0-9]{2,2})-([0-9]{2,2}) -/.exec($('#DatePeriod').text()) ?? []).slice(1).map(n => parseInt(n))

		const lessons = Array.from([3, 9, 15, 21, 27].entries()).map(([i, n]) => {
			return $(`#ctl00_ContentPlaceHolder2_tr_5_td_${n}`).toArray().map<ScheduleLesson>(element => {
				const el = $(element)

				const inner = el.html() ?? ''
				const lines = ($($('span', el).toArray().find(e => e.parent && $(e.parent).hasClass('LessonInfoContainer'))).html()?.replace(/<br>/gi, '\n') ?? '').split('\n')

				const [_day, sh, sm, eh, em] = Array.from(/>\s*(.+?) ([0-9]{2,2}):([0-9]{2,2}) - ([0-9]{2,2}):([0-9]{2,2})/.exec(inner.toString()) ?? []).slice(1)
				const canceled = /inställd!/i.test(inner)

				let information: string
				let subject: string
				let subjectShort: string
				let teacherShort: string
				let where: string
				let _canceled: any

				if (canceled) {
					[subject, _canceled, subjectShort, teacherShort, where] = lines
					information = lines.slice(5).join('\n')
				} else {
					[subject, subjectShort, teacherShort, where] = lines
					information = lines.slice(4).join('\n')
				}

				const from = new Date(syear, smonth, sdate + i, parseInt(sh), parseInt(sm)).getTime()
				const to = new Date(syear, smonth, sdate + i, parseInt(eh), parseInt(em)).getTime()

				return {
					canceled,
					from,
					to,
					information,
					subject,
					subjectShort,
					teacherShort,
					where
				}
			})
		}).reduce((acc, val) => acc.concat(val), [])

		const columns = $('#ctl00_ContentPlaceHolder2_tr_1 td').toArray().slice(1)

		const exams = columns.map(column => {
			const i = parseInt(Array.from(/([0-9]+)$/.exec($(column).attr().id) ?? [])[1]) / 6 - .5

			return $('.eventBox', column).toArray().map<ScheduleExam>(element => {
				const el = $(element)

				const href = el.attr().href
				const [id] = Array.from(/(?:\?|&)id=([^&]+)(?:&|^)/.exec(href) ?? []).slice(1)
				const [cid] = Array.from(/(?:\?|&)cid=([^&]+)(?:&|^)/.exec(href) ?? []).slice(1)

				// eslint-disable-next-line prefer-const
				let [type, lesson] = Array.from(/([a-zåäö]+?),\s{0,1}([^]+)/.exec(el.attr().title.toLowerCase()) ?? []).slice(1)

				switch (type) {
					case 'läxa':
						type = 'homework'
						break

					case 'inlämning':
						type = 'submission'
						break

					case 'prov':
						type = 'test'
						break

					case 'redovisning':
						type = 'presentation'
				}

				const infoText = $('.infotext', el)
				const lines = infoText.contents().toArray().map(n => n.type === 'text' ? $(n).text().trim() : n.type === 'tag' && $(n).prop('tagName') ? '\n' : '').filter(n => !!n).join(' ').split('\n')
				const [timeString, title] = lines.map(l => l.trim())
				const infoShort = lines.slice(2).join('\n').trim()
				const [h, m] = Array.from(/([0-9]{2,2}):([0-9]{2,2})/.exec(timeString) ?? []).slice(1)

				const time = new Date(
					syear,
					smonth,
					sdate + i,
					parseInt(h),
					parseInt(m)
				).getTime()

				return {
					title,
					time,
					infoShort,
					cid,
					id,
					lesson,
					type
				}
			})
		}).reduce((acc, val) => acc.concat(val), [])

		const events = columns.map<ScheduleEvent | undefined>(column => {
			const i = parseInt(Array.from(/([0-9]+)$/.exec($(column).attr().id) ?? [])[1]) / 6 - .5
			const element = $('div span div.noLink', column)

			try {
				/* eslint-disable @typescript-eslint/no-non-null-assertion */
				if (/background-color\s*:\s*rgba\(\s*255\s*,\s*0\s*,\s*0\s*,\s*0\s*\.\s*5\)/i.test((element.parent()!.parent() as any).attr().style)) {
					const time = new Date(
						syear,
						smonth,
						sdate + i
					).getTime()

					const name = $(element.parent()!).attr().title

					return {
						time,
						name
					}
				}
				/* eslint-enable */
			} catch { }
		}).filter((event): event is ScheduleEvent => !!event)

		return {
			lessons,
			exams,
			events
		}
	}
}
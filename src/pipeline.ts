import Agent, { Response } from './agent'
import CoreError, { ErrorCode } from './error'

export interface PipeFn {
	(pipe: Pipe): any
}

export interface PipeOptions {
	strict?: boolean
}

export interface Pipe {
	request(url: string, accept: string, options?: PipeOptions): Promise<Response>
	pipeline: Pipeline
	http: Agent
}

export type PipePipe<Fn extends PipeFn> = Promise<ReturnType<Fn> extends { pipe: any } ? ReturnType<Fn> : ReturnType<Fn> & { pipe: Pipeline['pipe'] }> & { pipe: Pipeline['pipe'] }

export class Pipeline {
	constructor(private agent: Agent) { }

	private cres: Response | undefined
	private curl: string | undefined
	private cpro: Promise<any> | undefined

	pipe<Fn extends PipeFn>(fn: Fn): PipePipe<Fn> {
		const callback = () => {
			const self = () => this
			let then: ((value: this | PromiseLike<this>) => void) | undefined

			const value = fn({
				request: async (url, accept, options) => {
					if (typeof url !== 'string') {
						throw new CoreError(ErrorCode.UNKNOWN, '\'url\' must be of type string.')
					}

					if (this.cres && this.curl) {
						if (!accept.startsWith('/'))
							accept = '/' + accept

						if (!url.startsWith('/'))
							url = '/' + url

						const pattern = '^' + accept.replace(/\*\*/g, '.+?').replace(/\*/g, '[^/]+?')
						const regex = new RegExp(pattern)

						const matches = regex.test(this.curl) || (options?.strict !== true && regex.test(this.curl.replace(/(\?|#).*/, '')))

						if (!matches) {
							throw new CoreError(ErrorCode.PIPE_URL_DOES_NOT_MATCH, this.curl)
						}

						return this.cres
					} else {
						this.cres = await this.agent.get(this.curl = url)
						then?.(self())
						return this.cres
					}
				},
				http: this.agent,
				get pipeline() {
					return self()
				}
			})

			if (!('pipe' in value) || value.pipe !== undefined) {
				value.pipe = (...args: any[]) => (this.pipe as (...args: any[]) => any)(...args)
			}

			return value
		}

		if (this.cpro) {
			const promise: Promise<any> & { pipe?: any } = this.cpro.then(() => callback())
			promise.pipe = (...args: any[]) => (this.pipe as (...args: any[]) => any)(...args)
			return promise as Promise<any> & { pipe: any }
		} else {
			const promise: Promise<any> & { pipe?: any } = Promise.resolve(callback())
			promise.pipe = (...args: any[]) => (this.pipe as (...args: any[]) => any)(...args)
			return promise as Promise<any> & { pipe: any }
		}
	}
}

export { Credentials } from './loaders/auth'
export { Agent, AgentHistory, HistoryData } from './agent'
export { ErrorCode as CoreErrorCode, CoreError as CustomError } from './error'
export { Options, Core } from './core'
export { Pipeline, Pipe, PipeFn, PipeOptions, PipePipe } from './pipeline'
export * as loaders from './__loaders'

import { Core } from './core'
export default Core
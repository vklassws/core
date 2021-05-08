// Add core extenders in class Core in core.ts
// Export extender accessories and types here
export * from '@/extenders/feed'
export * from '@/extenders/news'
export * from '@/extenders/schedule'

// authenticator.ts
export { CoreAuthenticatorCredentials as CoreCredentials } from '@/authenticator'

// chain.ts
import Agent from '@/agent'
export { Agent as Chain }
export { History as ChainHistory, HistoryData as ChainHistoryData } from '@/agent'

// core.ts
export { CoreOptions as Options, Hosts } from '@/core'

// coreError.ts
import CoreError from '@/coreError'
export { CoreError }
export { CoreErrorCode } from '@/coreError'

// DEFAULT EXPORT
import Core, { CoreExtenders } from '@/core'

type TupleArray<T> = { [P in keyof T]: T[P] } extends { [key: number]: infer V } ? V : never
type IntersectionUnion<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never
type ConstructorReturnType<T extends new (...args: any[]) => any> = T extends new (...args: any[]) => infer U ? U : never
type ExcludeConstructor<T> = Pick<T, ({ [P in keyof T]: T[P] extends new () => any ? never : P })[keyof T]>
type Extenders_Tuples = TupleArray<typeof CoreExtenders>
type Extenders_Constructor = ReturnType<Extenders_Tuples>
type Extenders_Class = ConstructorReturnType<Extenders_Constructor>
type Extenders_Class_Intersection = IntersectionUnion<Extenders_Class>
type Extenders_Constructor_Intersection = IntersectionUnion<Extenders_Constructor>

export default Core as
	{ new(...args: ConstructorParameters<typeof Core>): Core & Extenders_Class_Intersection }
	& ExcludeConstructor<typeof Core> & ExcludeConstructor<Extenders_Constructor_Intersection>

//(class extends Core implements ConstructorReturnType<Core & Extenders_Intersection> { }) as typeof Core & Extenders_Intersection
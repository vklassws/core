/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

export type Extender<T = any> = (constructor: T) => T

export default function classExtends(...extenders: (Extender | Extender[])[]) {
	return function <T extends { new(...args: any[]): {} }>(constructor: T) {
		const _extenders = extenders
			.map<Extender[]>(e => Array.isArray(e) ? e : [e])
			.reduce((acc, val) => acc.concat(val), [])
			.reverse()
			
		for (const extender of _extenders)
			constructor = extender(constructor)

		return class extends constructor { }
	}
}
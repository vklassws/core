export default function thisPipe<Fn extends (...args: any[]) => any>(_this: any, fn: Fn): Fn {
	return ((...args: any[]) => fn.call(_this, ...args)) as unknown as Fn
}
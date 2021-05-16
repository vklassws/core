import { Pipe } from '../pipeline'

export default function fakeRequest(url: string, data: string | null, options?: Partial<Response>) {
	return function (pipe: Pipe): void {
		(pipe.pipeline as any).curl = url;
		(pipe.pipeline as any).cres = {
			...{ data },
			...(options ?? {})
		}
	}
}
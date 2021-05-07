export function incasesensitivify(object: Record<string, string>): Record<string, string> {
	const incasesensitiveObject: Record<string, string> = {}

	for (const key in object) {
		if (Object.prototype.hasOwnProperty.call(object, key)) {
			incasesensitiveObject[key.toLowerCase()] = object[key]
		}
	}

	return incasesensitiveObject
}
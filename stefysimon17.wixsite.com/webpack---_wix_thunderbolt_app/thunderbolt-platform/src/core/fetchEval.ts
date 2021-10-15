export const fetchEval = async (fileUrl: string, beforeEval?: Function) => {
	const res = await self.fetch(fileUrl)
	const code = await res.text()
	beforeEval?.()
	eval.call(null, `${code}\n//# sourceURL=${fileUrl}`) // eslint-disable-line no-eval
}

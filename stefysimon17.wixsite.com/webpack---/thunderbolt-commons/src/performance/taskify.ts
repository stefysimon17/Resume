export const taskify = async <T>(task: () => T) => {
	if (process.env.browser) {
		await new Promise((resolve) => setTimeout(resolve, 0))
	}
	return task()
}

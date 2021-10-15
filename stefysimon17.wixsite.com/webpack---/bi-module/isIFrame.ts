export default () => {
	try {
		if (window.self === window.top) {
			return ''
		}
	} catch (e) {
		// empty
	}
	return 'iframe'
}

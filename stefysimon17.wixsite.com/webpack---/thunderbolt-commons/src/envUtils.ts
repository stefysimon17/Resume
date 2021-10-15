export function isSSR(window: Window | null): window is null {
	return !window
}

export function getCSRFToken(window: Window | null): string {
	let csrfToken
	if (window && window.document) {
		const csrfTokenCookieValue = window.document.cookie.split(';').filter((item) => item.includes('XSRF-TOKEN'))
		if (csrfTokenCookieValue && csrfTokenCookieValue[0]) {
			csrfToken = csrfTokenCookieValue[0].replace('XSRF-TOKEN=', '').trim()
		}
	}
	return csrfToken || ''
}

export function hasNavigator(window: Window | null): boolean {
	return !!window && typeof window.navigator !== 'undefined'
}

export function hasDocument(window: Window | null): boolean {
	return !!window && typeof window.document !== 'undefined'
}

export function getBrowserLanguage(window: Window | null): string | null {
	return hasNavigator(window) ? window!.navigator.language : null
}

export function getBrowserReferrer(window: Window | null): string | null {
	return hasDocument(window) ? window!.document.referrer : null
}

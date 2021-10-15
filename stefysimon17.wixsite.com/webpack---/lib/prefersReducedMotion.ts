import { BrowserWindow } from '@wix/thunderbolt-symbols'

// we need to import from thunderbolt-commons src because of tree shaking issue that makes lodash to be undefined
// eslint-disable-next-line
import { isWindows } from '@wix/thunderbolt-commons/src/deprecatedBrowserUtils'

export const prefersReducedMotion = (browserWindow: BrowserWindow, requestUrl = '') => {
	const isWindowsOS = isWindows(browserWindow!) // This will later depend on UoU decision using a new a11y prompt
	const shouldForce = requestUrl.toLowerCase().includes('forcereducedmotion')
	return (
		shouldForce ||
		(browserWindow && !isWindowsOS ? browserWindow.matchMedia('(prefers-reduced-motion: reduce)').matches : false)
	)
}

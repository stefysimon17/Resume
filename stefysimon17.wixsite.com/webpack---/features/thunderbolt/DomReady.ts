import { withDependencies } from '@wix/thunderbolt-ioc'
import { DomReadySymbol, IAppWillMountHandler, ILogger, LoggerSymbol } from '@wix/thunderbolt-symbols'
import { getBodyClasses } from '../../lib/bodyClasses'
import { REACT_DOM_PROD_URL } from '../../utils/constants'

export const createDomReadyPromise = (validate = true) =>
	new Promise<void>((resolve) => {
		const verifyAndResolve = () => {
			if (validate) {
				verifyBody()
			}

			resolve()
		}
		if (document.readyState === 'complete' || document.readyState === 'interactive') {
			verifyAndResolve()
		} else {
			document.addEventListener('readystatechange', verifyAndResolve, { once: true })
		}
	})

export const WaitForDomReady = withDependencies<IAppWillMountHandler>(
	[DomReadySymbol, LoggerSymbol],
	(domReady, logger) => ({
		appWillMount: () => domReady.then(() => reportDomReady(logger)),
	})
)

function reportDomReady(logger: ILogger) {
	logger.phaseEnded('dom_ready')
}

function verifyBody(): void {
	const ssrReturnedBody = typeof window.clientSideRender !== 'undefined'
	if (ssrReturnedBody) {
		return
	}
	const bodyClasses = getBodyClasses(window.viewerModel)
	window.document.body.classList.add(...bodyClasses)
	window.clientSideRender = true
	window.santaRenderingError = window.santaRenderingError || {
		errorInfo: 'body failed to render',
	}

	const pagesCss = window.document.createElement('pages-css')
	pagesCss.setAttribute('id', 'pages-css')
	window.document.body.appendChild(pagesCss)

	const siteContainer = window.document.createElement('DIV')
	siteContainer.setAttribute('id', 'SITE_CONTAINER')
	window.document.body.appendChild(siteContainer)

	if (window.viewerModel.experiments['specs.thunderbolt.move_react_script_to_body']) {
		const reactDomScript = window.document.createElement('script')
		reactDomScript.setAttribute('src', REACT_DOM_PROD_URL(window.viewerModel))
		reactDomScript.onload = () => window.externalsRegistry.reactDOM.onload()
		window.document.body.appendChild(reactDomScript)
	}
}

import { withDependencies } from '@wix/thunderbolt-ioc'
import { BrowserWindow, BrowserWindowSymbol, IAppDidMountHandler } from '@wix/thunderbolt-symbols'

const embeddedInIframeFactory = (window: NonNullable<BrowserWindow>): IAppDidMountHandler => {
	const notifySiteHeight = (siteHeight: number) => {
		window.parent.postMessage(
			{
				siteHeight,
			},
			'*'
		)
	}

	return {
		async appDidMount() {
			if (window.parent === window) {
				return
			}
			// @ts-ignore
			const masterPage: HTMLElement = window.document.getElementById('masterPage')
			const getSiteHeight = () => masterPage.offsetHeight

			notifySiteHeight(getSiteHeight())

			// @ts-ignore
			const resizeObserver = new window.ResizeObserver(() => notifySiteHeight(getSiteHeight()))
			resizeObserver.observe(masterPage)
		},
	}
}

export const EmbeddedInIframe = withDependencies([BrowserWindowSymbol], embeddedInIframeFactory)

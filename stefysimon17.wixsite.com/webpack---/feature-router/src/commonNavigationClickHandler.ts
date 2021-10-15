import { withDependencies } from '@wix/thunderbolt-ioc'
import type { IRouter, ICommonNavigationClickHandler } from './types'
import { Router } from './symbols'

const commonNavigationClickHandlerFactory = (router: IRouter): ICommonNavigationClickHandler => {
	return {
		commonNavigationClickHandler: (anchor) => {
			const href = anchor.getAttribute('href')
			if (!href) {
				return false
			}
			if (anchor.getAttribute('target') === '_blank') {
				return false
			}
			const isInteralRoute = router.isInternalValidRoute(href)

			if (isInteralRoute) {
				const anchorDataId = anchor.getAttribute('data-anchor') || 'SCROLL_TO_TOP'
				router.navigate(href, { anchorDataId })
				return true
			}
			return false
		},
	}
}

export const CommonNavigationClickHandler = withDependencies([Router], commonNavigationClickHandlerFactory)

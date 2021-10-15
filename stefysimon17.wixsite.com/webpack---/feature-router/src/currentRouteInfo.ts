import { named, withDependencies } from '@wix/thunderbolt-ioc'
import { DynamicRouteData, SiteFeatureConfigSymbol } from '@wix/thunderbolt-symbols'
import { getRelativeUrl } from './urlUtils'
import type { ICurrentRouteInfo, IRoutingConfig, CandidateRouteInfo } from './types'
import { name } from './symbols'

const currentRouteInfo = (routingConfig: IRoutingConfig): ICurrentRouteInfo => {
	let routeInfo: CandidateRouteInfo
	let prevRouteInfo: CandidateRouteInfo | null = null

	return {
		getCurrentRouteInfo: () => {
			return routeInfo ? routeInfo : null
		},
		getPreviousRouterInfo: () => {
			return prevRouteInfo
		},
		updateCurrentRouteInfo: (nextRouteInfo: CandidateRouteInfo) => {
			prevRouteInfo = routeInfo
			routeInfo = nextRouteInfo
		},
		updateRouteInfoUrl: (parsedUrl: URL) => {
			if (routeInfo) {
				routeInfo.parsedUrl = parsedUrl
				routeInfo.relativeUrl = getRelativeUrl(parsedUrl.href, routingConfig.baseUrl)
			}
		},
		updateCurrentDynamicRouteInfo: (dynamicRouteData: DynamicRouteData) => {
			routeInfo = { ...routeInfo, dynamicRouteData }
		},
		isLandingOnProtectedPage: () => !routeInfo,
		getCurrentUrlWithoutQueryParams: () => {
			if (!routeInfo) {
				return null
			}

			return `${routeInfo.parsedUrl.origin}${routeInfo.parsedUrl.pathname}`
		},
	}
}

export const CurrentRouteInfo = withDependencies([named(SiteFeatureConfigSymbol, name)], currentRouteInfo)

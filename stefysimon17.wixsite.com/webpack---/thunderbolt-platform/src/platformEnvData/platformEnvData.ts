import _ from 'lodash'
import { getBrowserLanguage, getBrowserReferrer, getCSRFToken, isSSR } from '@wix/thunderbolt-commons'
import { withDependencies } from '@wix/thunderbolt-ioc'
import { BrowserWindow, BrowserWindowSymbol, CurrentRouteInfoSymbol, PlatformEnvData, PlatformEnvDataProvider, ViewerModel, ViewerModelSym } from '@wix/thunderbolt-symbols'
import { ICurrentRouteInfo, RoutingLinkUtilsAPISymbol, IRoutingLinkUtilsAPI } from 'feature-router'
import { ConsentPolicySymbol, IConsentPolicy } from 'feature-consent-policy'

export const consentPolicyEnvDataProvider = withDependencies(
	[ConsentPolicySymbol],
	(consentPolicyApi: IConsentPolicy): PlatformEnvDataProvider => {
		return {
			get platformEnvData() {
				return {
					consentPolicy: {
						details: consentPolicyApi.getCurrentConsentPolicy(),
						header: consentPolicyApi._getConsentPolicyHeader(),
					},
				}
			},
		}
	}
)

export const windowEnvDataProvider = withDependencies(
	[BrowserWindowSymbol],
	(window: BrowserWindow): PlatformEnvDataProvider => ({
		platformEnvData: {
			window: {
				isSSR: isSSR(window),
				browserLocale: getBrowserLanguage(window),
				csrfToken: getCSRFToken(window),
			},
		},
	})
)

export const documentEnvDataProvider = withDependencies(
	[BrowserWindowSymbol],
	(window: BrowserWindow): PlatformEnvDataProvider => ({
		platformEnvData: {
			document: {
				referrer: getBrowserReferrer(window),
			},
		},
	})
)

export const routingEnvDataProvider = withDependencies(
	[RoutingLinkUtilsAPISymbol, CurrentRouteInfoSymbol],
	(routingLinkUtilsAPI: IRoutingLinkUtilsAPI, currentRouteInfo: ICurrentRouteInfo): PlatformEnvDataProvider => {
		return {
			get platformEnvData() {
				const routeInfo = currentRouteInfo.getCurrentRouteInfo()
				const dynamicRouteData = routeInfo?.dynamicRouteData

				const routerEnvData: PlatformEnvData['router'] = {
					routingInfo: routingLinkUtilsAPI.getLinkUtilsRoutingInfo(),
					pageJsonFileName: routeInfo?.pageJsonFileName || '',
				}

				if (dynamicRouteData) {
					routerEnvData.dynamicRouteData = _.pick(dynamicRouteData, ['pageData', 'pageHeadData', 'publicData'])
				}

				return {
					router: routerEnvData,
				}
			},
		}
	}
)

export const topologyEnvDataProvider = withDependencies(
	[ViewerModelSym],
	({ media }: ViewerModel): PlatformEnvDataProvider => {
		return {
			get platformEnvData() {
				return {
					topology: {
						media,
					},
				}
			},
		}
	}
)

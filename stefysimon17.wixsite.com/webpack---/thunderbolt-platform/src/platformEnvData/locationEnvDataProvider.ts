import _ from 'lodash'
import { named, withDependencies } from '@wix/thunderbolt-ioc'
import { PlatformEnvDataProvider, PlatformSiteConfig, SiteFeatureConfigSymbol } from '@wix/thunderbolt-symbols'
import { IRoutingLinkUtilsAPI, IUrlHistoryManager, RoutingLinkUtilsAPISymbol, UrlHistoryManagerSymbol } from 'feature-router'
import { name } from '../symbols'

export const locationEnvDataProvider = withDependencies(
	[named(SiteFeatureConfigSymbol, name), UrlHistoryManagerSymbol],
	(platformSiteConfig: PlatformSiteConfig, urlHistoryManager: IUrlHistoryManager): PlatformEnvDataProvider => {
		return {
			get platformEnvData() {
				return {
					location: {
						...platformSiteConfig.bootstrapData.location,
						rawUrl: urlHistoryManager.getParsedUrl().href,
					},
				}
			},
		}
	}
)

export const dsLocationEnvDataProvider = withDependencies(
	[named(SiteFeatureConfigSymbol, name), UrlHistoryManagerSymbol, RoutingLinkUtilsAPISymbol],
	(platformSiteConfig: PlatformSiteConfig, urlHistoryManager: IUrlHistoryManager, routingLinkUtilsAPI: IRoutingLinkUtilsAPI): PlatformEnvDataProvider => {
		return {
			get platformEnvData() {
				// TODO: Probably we can use the designated externalBaseUrl instead of yoursitename.
				// See also: https://github.com/wix-private/santa-editor/blob/master/editor-test-sled/sled/platform/wixCode/location.spec.js
				const baseUrl = platformSiteConfig.bootstrapData.location.externalBaseUrl || 'http://yoursitename.wixsite.com/yoursitename'
				const relativeUrl = routingLinkUtilsAPI.getLinkUtilsRoutingInfo().relativeUrl.replace(/^\.\//, '')

				return {
					location: {
						...platformSiteConfig.bootstrapData.location,
						rawUrl: `${_.compact([baseUrl, relativeUrl]).join('/')}${urlHistoryManager.getParsedUrl().search}`,
					},
				}
			},
		}
	}
)

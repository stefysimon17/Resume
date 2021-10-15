import { withDependencies, named } from '@wix/thunderbolt-ioc'
import { TpaHandlerProvider, CurrentRouteInfoSymbol, SiteFeatureConfigSymbol } from '@wix/thunderbolt-symbols'
import { ICurrentRouteInfo, UrlHistoryManagerSymbol, IUrlHistoryManager } from 'feature-router'
import { name as tpaCommonsName, TpaCommonsSiteConfig } from 'feature-tpa-commons'

export type MessageData = never
export type HandlerResponse =
	| {
			type: 'DynamicPageLink'
			innerRoute: string
			routerId: string
	  }
	| {
			type: 'PageLink'
			pageId: string
	  }

export const GetCurrentPageNavigationInfoHandler = withDependencies(
	[UrlHistoryManagerSymbol, CurrentRouteInfoSymbol, named(SiteFeatureConfigSymbol, tpaCommonsName)],
	(
		urlHistoryManager: IUrlHistoryManager,
		currentRouteInfo: ICurrentRouteInfo,
		{ routersByPrefix }: TpaCommonsSiteConfig
	): TpaHandlerProvider => ({
		getTpaHandlers() {
			return {
				getCurrentPageNavigationInfo(): HandlerResponse {
					const relativeUrl = urlHistoryManager.getRelativeUrl()
					const { type, pageId } = currentRouteInfo.getCurrentRouteInfo()!
					if (type === 'Static') {
						return {
							type: 'PageLink',
							pageId,
						}
					}
					const [, prefix, ...innerRouteParts] = relativeUrl.split('/')
					const { routerId } = routersByPrefix[prefix]
					return {
						type: 'DynamicPageLink',
						routerId,
						innerRoute: innerRouteParts.join('/') || '/',
					}
				},
			}
		},
	})
)

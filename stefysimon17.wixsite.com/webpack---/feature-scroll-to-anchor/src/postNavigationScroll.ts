import { withDependencies, named, optional } from '@wix/thunderbolt-ioc'
import {
	PageFeatureConfigSymbol,
	IAppDidLoadPageHandler,
	CurrentRouteInfoSymbol,
	ExperimentsSymbol,
	Experiments,
} from '@wix/thunderbolt-symbols'
import type { ScrollToAnchorPageConfig } from './types'
import { name } from './symbols'
import { WindowScrollApiSymbol, IWindowScrollAPI } from 'feature-window-scroll'
import { ICurrentRouteInfo } from 'feature-router'
import { TOP_AND_BOTTOM_ANCHORS, TOP_ANCHOR } from './constants'
import { IPopupUtils, PopupUtilsSymbol } from 'feature-popups'

const postNavigationScrollFactory = (
	{ nicknameToCompIdMap, anchorDataIdToCompIdMap }: ScrollToAnchorPageConfig,
	routeInfo: ICurrentRouteInfo,
	windowScrollApi: IWindowScrollAPI,
	experiments: Experiments,
	popupUtils?: IPopupUtils
): IAppDidLoadPageHandler => {
	return {
		appDidLoadPage: ({ pageId }) => {
			if (popupUtils?.isPopupPage(pageId)) {
				return
			}

			const currentRouteInfo = routeInfo.getCurrentRouteInfo()
			const anchorDataId = currentRouteInfo && currentRouteInfo.anchorDataId
			if (anchorDataId) {
				const isTopBottomAnchor = TOP_AND_BOTTOM_ANCHORS.includes(anchorDataId)
				const compId = isTopBottomAnchor
					? anchorDataId
					: anchorDataIdToCompIdMap[anchorDataId] || nicknameToCompIdMap[anchorDataId]
				const skipScrollAnimation = anchorDataId === TOP_ANCHOR

				windowScrollApi.scrollToComponent(compId, { callbacks: undefined, skipScrollAnimation })
			}
		},
	}
}

export const PostNavigationScroll = withDependencies(
	[
		named(PageFeatureConfigSymbol, name),
		CurrentRouteInfoSymbol,
		WindowScrollApiSymbol,
		ExperimentsSymbol,
		optional(PopupUtilsSymbol),
	],
	postNavigationScrollFactory
)

import { withDependencies } from '@wix/thunderbolt-ioc'
import type { IAnchorCompIdProvider, IScrollToAnchorHandlerProvider } from './types'
import { AnchorCompIdProviderSymbol } from './symbols'
import { TOP_AND_BOTTOM_ANCHORS } from './constants'
import { IWindowScrollAPI, WindowScrollApiSymbol } from 'feature-window-scroll'
import { Structure, IStructureStore } from '@wix/thunderbolt-symbols'

const scrollToAnchorHandlerProviderFactory = (
	{ getAnchorCompId }: IAnchorCompIdProvider,
	windowScrollApi: IWindowScrollAPI,
	structureStore: IStructureStore
): IScrollToAnchorHandlerProvider => {
	return {
		getHandler: () => ({ anchorCompId, anchorDataId }) => {
			if (anchorDataId && TOP_AND_BOTTOM_ANCHORS.includes(anchorDataId)) {
				windowScrollApi.scrollToComponent(anchorDataId)
				return true
			}
			if (anchorCompId && structureStore.get(anchorCompId)) {
				windowScrollApi.scrollToComponent(anchorCompId)
				return true
			}

			if (anchorDataId && getAnchorCompId(anchorDataId) && structureStore.get(getAnchorCompId(anchorDataId))) {
				// in responsive the anchorData doesn't include the comp id
				windowScrollApi.scrollToComponent(getAnchorCompId(anchorDataId))
				return true
			}

			return false
		},
	}
}

export const ScrollToAnchorHandlerProvider = withDependencies(
	[AnchorCompIdProviderSymbol, WindowScrollApiSymbol, Structure],
	scrollToAnchorHandlerProviderFactory
)

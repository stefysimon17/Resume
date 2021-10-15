import { withDependencies, optional } from '@wix/thunderbolt-ioc'
import { SdkHandlersProvider } from '@wix/thunderbolt-symbols'
import { INavigation, NavigationSymbol } from 'feature-navigation'
import { IUrlHistoryManager, UrlHistoryManagerSymbol } from 'feature-router'
import { EditorLocationWixCodeSdkHandlers, LocationWixCodeSdkHandlers } from '../types'
import { EditorLocationSDKHandlersSymbols } from '../symbols'

export const locationWixCodeSdkHandlersProvider = withDependencies(
	[NavigationSymbol, UrlHistoryManagerSymbol, optional(EditorLocationSDKHandlersSymbols)],
	(
		navigation: INavigation,
		urlHistoryManager: IUrlHistoryManager,
		editorSDKHandlers?: EditorLocationWixCodeSdkHandlers
	): SdkHandlersProvider<LocationWixCodeSdkHandlers> => {
		return {
			getSdkHandlers: () => ({
				navigateTo: navigation.navigateTo,
				pushUrlState: (href) => {
					const url = new URL(href)
					urlHistoryManager.pushUrlState(url)
				},
				navigateToSection: editorSDKHandlers ? editorSDKHandlers.navigateToSection : () => Promise.resolve(),
			}),
		}
	}
)

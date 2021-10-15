import { multi, withDependencies } from '@wix/thunderbolt-ioc'
import {
	ILinkClickHandler,
	LinkClickHandlerSymbol,
	SiteLinkClickHandlerSymbol,
	pageIdSym,
	NavigationClickHandlerSymbol,
} from '@wix/thunderbolt-symbols'
import { ILinkClickHandlersProvider } from './types'

const linkClickHandlersProviderFactory = (
	pageId: string,
	navigationHandler: ILinkClickHandler,
	siteLinkClickHandlers: Array<ILinkClickHandler>,
	pageLinkClickHandlers: Array<ILinkClickHandler>
): ILinkClickHandlersProvider => {
	return {
		getHandlers: () =>
			pageId === 'masterPage'
				? [...siteLinkClickHandlers, ...pageLinkClickHandlers]
				: [...pageLinkClickHandlers, navigationHandler],
	}
}

export const ClickHandlersProvider = withDependencies(
	[pageIdSym, NavigationClickHandlerSymbol, multi(SiteLinkClickHandlerSymbol), multi(LinkClickHandlerSymbol)],
	linkClickHandlersProviderFactory
)

import { withDependencies } from '@wix/thunderbolt-ioc'
import {
	ViewerModelSym,
	ViewerModel,
	IAppWillMountHandler,
	BrowserWindow,
	BrowserWindowSymbol,
} from '@wix/thunderbolt-symbols'
import { Router as RouterSymbol } from './symbols'
import type { IUrlHistoryPopStateHandler, IRouter } from './types'
import { isSSR } from '@wix/thunderbolt-commons'

export const RouterInitAppWillMount = withDependencies(
	[RouterSymbol, ViewerModelSym, BrowserWindowSymbol],
	(router: IRouter, viewerModel: ViewerModel, window: BrowserWindow): IAppWillMountHandler => ({
		appWillMount: async () => {
			// In the browser we take the URL from the address bar in order to support hash
			const url = isSSR(window) ? viewerModel.requestUrl : window.location.href
			await router.navigate(url)
		},
	})
)

export const RouterInitOnPopState = withDependencies(
	[RouterSymbol],
	(router: IRouter): IUrlHistoryPopStateHandler => ({
		onPopState: async (url) => {
			await router.navigate(url.href)
		},
	})
)

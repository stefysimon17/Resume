import _ from 'lodash'
import { isSSR } from '@wix/thunderbolt-commons'
import { named, optional, withDependencies } from '@wix/thunderbolt-ioc'
import {
	BrowserWindow,
	BrowserWindowSymbol,
	CurrentRouteInfoSymbol,
	PlatformEnvData,
	PlatformEnvDataProvider,
	PlatformSiteConfig,
	SiteFeatureConfigSymbol,
	ViewerModel,
	ViewerModelSym,
	WixBiSession,
	WixBiSessionSymbol,
} from '@wix/thunderbolt-symbols'
import { ICurrentRouteInfo, UrlHistoryManagerSymbol, IUrlHistoryManager } from 'feature-router'
import { IPopupsLinkUtilsAPI, PopupsLinkUtilsAPISymbol } from 'feature-popups'
import { name } from '../symbols'

export const biEnvDataProvider = withDependencies(
	[named(SiteFeatureConfigSymbol, name), BrowserWindowSymbol, WixBiSessionSymbol, ViewerModelSym, UrlHistoryManagerSymbol, CurrentRouteInfoSymbol, optional(PopupsLinkUtilsAPISymbol)],
	(
		platformSiteConfig: PlatformSiteConfig,
		window: BrowserWindow,
		wixBiSession: WixBiSession,
		viewerModel: ViewerModel,
		urlHistoryManager: IUrlHistoryManager,
		currentRoutingInfo: ICurrentRouteInfo,
		popupsLinkUtilsAPI: IPopupsLinkUtilsAPI
	): PlatformEnvDataProvider => {
		let pageNumber = 0
		const { mode, rollout, fleetConfig } = viewerModel
		const bi = {
			..._.omit(wixBiSession, 'checkVisibility', 'msId'),
			viewerVersion: process.env.browser ? window!.thunderboltVersion : (process.env.APP_VERSION as string),
			rolloutData: rollout,
			fleetConfig,
		}

		return {
			get platformEnvData(): { bi: PlatformEnvData['bi'] } {
				const pageId = currentRoutingInfo.getCurrentRouteInfo()?.pageId

				const { href, searchParams } = urlHistoryManager.getParsedUrl()

				const suppressBi = searchParams.has('suppressbi') && searchParams.get('suppressbi') !== 'false'
				if (!pageId) {
					// TODO: Maybe we can have a single return and set the defaults on it?
					// platform init
					return {
						bi: {
							...bi,
							// @ts-ignore
							pageData: {
								pageNumber: 1,
							},
							// @ts-ignore
							rolloutData: {},
							// @ts-ignore
							fleetConfig: {},
							muteFedops: mode.qa || suppressBi,
						},
					}
				}

				const currentLightboxId = popupsLinkUtilsAPI?.getCurrentOrPendingPopupId()
				const isLightbox = !!currentLightboxId

				if (!isLightbox) {
					pageNumber++
				}

				const biPageData = {
					pageNumber,
					pageId: currentLightboxId || pageId,
					pageUrl: href,
					isLightbox,
				}

				const muteBi = isSSR(window) || mode.qa || suppressBi
				const muteFedops = mode.qa || suppressBi || isLightbox

				return {
					bi: {
						...platformSiteConfig.bootstrapData.bi,
						...bi,
						pageData: biPageData,
						muteBi,
						muteFedops,
					},
				}
			},
		}
	}
)

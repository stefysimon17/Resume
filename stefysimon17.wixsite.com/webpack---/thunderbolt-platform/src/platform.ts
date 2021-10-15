import _ from 'lodash'
import { IPageProvider, IPageReflector, PageProviderSymbol } from 'feature-pages'
import { PopupUtilsSymbol, IPopupUtils } from 'feature-popups'
import { multi, named, optional, withDependencies } from '@wix/thunderbolt-ioc'
import {
	ComponentsStylesOverridesSymbol,
	CurrentRouteInfoSymbol,
	IAppWillLoadPageHandler,
	IComponentsStylesOverrides,
	ILogger,
	LoggerSymbol,
	PlatformEnvDataProvider,
	PlatformEvnDataProviderSymbol,
	PlatformSiteConfig,
	PropsMap,
	SdkHandlersProvider,
	SiteFeatureConfigSymbol,
	ViewerModel,
	ViewerModelSym,
	WixCodeSdkHandlersProviderSym,
} from '@wix/thunderbolt-symbols'
import type { PlatformInitializer, ViewerAPI } from './types'
import { name, PlatformInitializerSym } from './symbols'
import { DebugApis, TbDebugSymbol } from 'feature-debug'
import { createBootstrapData } from './viewer/createBootstrapData'
import { ICurrentRouteInfo } from 'feature-router'

export const Platform = withDependencies(
	[
		named(SiteFeatureConfigSymbol, name),
		PlatformInitializerSym,
		ViewerModelSym,
		LoggerSymbol,
		PageProviderSymbol,
		ComponentsStylesOverridesSymbol,
		CurrentRouteInfoSymbol,
		multi(WixCodeSdkHandlersProviderSym),
		multi(PlatformEvnDataProviderSymbol),
		optional(PopupUtilsSymbol),
		optional(TbDebugSymbol),
	],
	(
		platformSiteConfig: PlatformSiteConfig,
		platformRunnerContext: PlatformInitializer,
		viewerModel: ViewerModel,
		logger: ILogger,
		pageProvider: IPageProvider,
		componentsStylesOverrides: IComponentsStylesOverrides,
		currentRouteInfo: ICurrentRouteInfo,
		siteHandlersProviders: Array<SdkHandlersProvider>,
		platformEnvDataProviders: Array<PlatformEnvDataProvider>,
		popupUtils?: IPopupUtils,
		debugApi?: DebugApis
	): IAppWillLoadPageHandler => {
		const siteHandlers = siteHandlersProviders.map((siteHandlerProvider) => siteHandlerProvider.getSdkHandlers())
		function getHandlers(page: IPageReflector) {
			const pageHandlersProviders = page.getAllImplementersOf<SdkHandlersProvider>(WixCodeSdkHandlersProviderSym)
			const pageHandlers = pageHandlersProviders.map((pageHandlerProvider) => pageHandlerProvider.getSdkHandlers())
			return Object.assign({}, ...pageHandlers, ...siteHandlers)
		}

		function getPlatformEnvData() {
			return Object.assign({}, ...platformEnvDataProviders.map((envApiProvider) => envApiProvider.platformEnvData))
		}

		const {
			bootstrapData: siteConfigBootstrapData,
			landingPageId,
			isChancePlatformOnLandingPage,
			debug: { disablePlatform },
		} = platformSiteConfig

		platformRunnerContext.initPlatformOnSite({
			platformEnvData: getPlatformEnvData(),
			appsUrlData: siteConfigBootstrapData.appsUrlData,
		})

		return {
			async appWillLoadPage({ pageId: currentPageId, contextId }) {
				if (disablePlatform || (currentPageId === landingPageId && !isChancePlatformOnLandingPage)) {
					return
				}

				// Getting envData on each navigation so it can depend on currentUrl.
				const platformEnvData = getPlatformEnvData()

				const muteFedops = platformEnvData.bi.muteFedops || platformEnvData.bi.pageData.pageNumber > 1
				if (!muteFedops) {
					logger.interactionStarted('platform')
				}

				const handlersPromise = Promise.all([pageProvider(contextId, currentPageId), pageProvider('masterPage', 'masterPage')]).then(([page, masterPage]) => ({
					masterPageHandlers: getHandlers(masterPage),
					pageHandlers: getHandlers(page),
				}))

				const bootstrapData = createBootstrapData({
					platformEnvData,
					platformBootstrapData: siteConfigBootstrapData,
					siteFeaturesConfigs: viewerModel.siteFeaturesConfigs,
					currentContextId: contextId,
					currentPageId,
				})

				const shouldIgnoreCall = () => contextId !== 'masterPage' && !popupUtils?.isPopupPage(contextId) && contextId !== currentRouteInfo.getCurrentRouteInfo()?.contextId

				const viewerAPI: ViewerAPI = {
					updateProps: (partialProps: PropsMap) => {
						if (shouldIgnoreCall()) {
							return
						}

						platformRunnerContext.updateProps(partialProps)
					},
					updateStyles: (overrideStyles: { [compId: string]: object }) => {
						const styles = _(overrideStyles)
							.mapValues((compStyles, compId) => ({ ...componentsStylesOverrides.getCompStyle(compId), ...compStyles }))
							.value()
						platformRunnerContext.updateStyles(styles)
					},
					invokeSdkHandler: async (pageId: string, path: Array<string>, ...args: any) => {
						// $TB-3031 Ignore invocations from handlers that were created on other pages
						// Limiting only setControllerProps for tracking events to pass through during navigations
						const functionName = _.last(path) as string
						if (functionName === 'setControllerProps' && shouldIgnoreCall()) {
							return
						}
						const { masterPageHandlers, pageHandlers } = await handlersPromise
						const handlers = pageId === 'masterPage' ? masterPageHandlers : pageHandlers
						const handler = _.get(handlers, path)
						if (!_.isFunction(handler)) {
							logger.captureError(new Error('handler does not exist in page'), {
								tags: { feature: 'platform', handler: functionName },
								extra: { pageId, contextId, path: path.join('.') },
								level: 'info',
							})
							return
						}
						return handler(...args)
					},
				}

				if (debugApi) {
					debugApi.platform.logBootstrapMessage(contextId, bootstrapData)
				}

				await platformRunnerContext.runPlatformOnPage(bootstrapData, viewerAPI)
				if (!muteFedops) {
					logger.interactionEnded('platform')
				}
			},
		}
	}
)

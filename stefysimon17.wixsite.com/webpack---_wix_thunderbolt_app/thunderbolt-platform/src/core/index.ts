import _ from 'lodash'
import type { PlatformLogger, PlatformEnvData, StorageInitData, CompProps } from '@wix/thunderbolt-symbols'
import { createLinkUtils, createPromise, logSdkError, logSdkWarning, createProxy } from '@wix/thunderbolt-commons'
import { createDeepProxy } from '../deepProxyUtils'
import { getComponentsSDKLoader } from '@wix/thunderbolt-components-registry/getComponentsSDKLoader'
import { ComponentSdksLoader, CoreSdkLoaders, CreateWixStorageAPI, WixStorageAPI } from '../types'
import type { ControllersExports, InitArgs } from './types' // TODO move all core types to ./types
import ClientSpecMapApi from './clientSpecMapService'
import AppsUrlApi from './appsUrlService'
import WixSelector from './wixSelector'
import WixCodeViewerAppUtils from './wixCodeViewerAppUtils'
import BlocksPreviewAppUtils from './blocksPreviewAppUtils'
import { Applications } from './applications'
import { modelsApiProvider } from './modelsApiProvider'
import { createWixCodeApiFactory } from './createWixCodeSdk'
import createSdkFactoryParams from './createSdkFactoryParams'
import setPropsFactory from './setPropsFactory'
import { ControllerEvents } from './ControllerEvents'
import { DocumentSdkFactory } from './componentsSDK/Document'
import { createPlatformApi } from './appsAPI/platformAPI'
import CommonConfigManager from './commonConfigModule'
import BsiManagerModule from './bsiManagerModule'
import { createWixCodeNamespacesRegistry } from './WixCodeNamespacesRegistry'
import { platformBiLoggerFactory } from './bi/biLoggerFactory'
import { instanceCacheFactory } from './instanceCache'
import { componentSdkStateFactory } from './componentSdkState'
import { ComponentSdksManagerFactory } from './componentSdksManager'
import { RegisterEventFactory } from './createRegisterEvent'
import { PlatformAnimationsAPI } from '../animations'
import { CreateStaticEventsManager } from './staticEventsManager'
import { AppsPublicApiManagerFactory } from './appsPublicApiManager'
import { BuildPlatformUtils } from './buildPlatformUtils'
import { CreateLocationManager } from './locationManager'
import { ViewerPlatformEssentials } from '@wix/fe-essentials-viewer-platform'
import { CreateWarmupDataManager } from './warmupDataManager'
import { CreateConsentPolicyManager } from './consentPolicyManager'
import { FedopsWebVitalsManager } from './fedops'
import { SsrCacheHintsManager } from './ssr'
import { createStorageAPI } from '../storage/storageAPI'
import { ModuleFederationManagerFactory } from './moduleFederationManager'

type PlatformState = {
	createStorageApi: CreateWixStorageAPI
	loadComponentSdksPromise: Promise<ComponentSdksLoader>
}

export function createPlatformAPI() {
	const { promise: waitForInit, resolver: initDone } = createPromise<PlatformState>()

	return {
		initPlatformOnSite({ logger, platformEnvData }: { logger: PlatformLogger; platformEnvData: PlatformEnvData }) {
			const siteStorageApi: CreateWixStorageAPI = createStorageAPI()

			initDone({
				createStorageApi: (appPrefix: string, handlers: any, storageInitData: StorageInitData): WixStorageAPI => {
					return siteStorageApi(appPrefix, handlers, storageInitData)
				},
				loadComponentSdksPromise: getComponentsSDKLoader({
					platformEnvData,
					logger,
				}) as any, // TODO: remove `as any` after https://github.com/wix-private/editor-elements/pull/3443 is merged
			})
		},

		async runPlatformOnPage({ bootstrapData, logger, importScripts, moduleLoader, viewerAPI, fetchModels, sessionService }: InitArgs) {
			logger.interactionStarted('initialisation')
			const createSdkHandlers = (pageId: string) => createDeepProxy((path: Array<string>) => (...args: Array<never>) => viewerAPI.invokeSdkHandler(pageId, path, ...args))

			const modelBuilder = modelsApiProvider({ bootstrapData, fetchModels })
			const modelsApi = await logger.runAsyncAndReport('getAllModels', modelBuilder.getModelApi)
			const clientSpecMapApi = ClientSpecMapApi({ bootstrapData })
			const handlers = createSdkHandlers(bootstrapData.currentPageId) as any
			const appsPublicApiManager = AppsPublicApiManagerFactory({ modelsApi, clientSpecMapApi, logger, handlers, bootstrapData, importScripts })
			if (_.isEmpty(modelsApi.getApplications())) {
				if (modelsApi.hasTPAComponentOnPage()) {
					// a TPA component may Wix.SuperApps.getPublicAPI(). the below code resolves this promise.
					appsPublicApiManager.registerPublicApiProvider((appDefinitionId) => {
						appsPublicApiManager.resolvePublicApi(appDefinitionId, null)
					})
				}
				return
			}

			const platformEnvData = bootstrapData.platformEnvData
			const isSSR = platformEnvData.window.isSSR
			if (!isSSR) {
				handlers.registerOnPropsChangedHandler(bootstrapData.currentContextId, (changes: CompProps) => {
					_.map(changes, (newProps, compId) => {
						modelsApi.updateProps(compId, newProps)
					})
				})
			}

			const fedopsWebVitalsManager = FedopsWebVitalsManager({ platformEnvData, modelsApi, handlers })
			fedopsWebVitalsManager.registerWidgets()

			const ssrCacheHintsManager = SsrCacheHintsManager({ platformEnvData, modelsApi, handlers })
			ssrCacheHintsManager.setSsrCacheHints()

			const { createStorageApi, loadComponentSdksPromise } = await waitForInit
			const componentSdksManager = ComponentSdksManagerFactory({ loadComponentSdksPromise, modelsApi, logger })
			const sdkInstancesCache = instanceCacheFactory()
			const getCompRefById = (compId: string) => createProxy((functionName: string) => (...args: any) => handlers.invokeCompRefFunction(compId, functionName, args))
			const appsUrlApi = AppsUrlApi({ bootstrapData })
			const controllerEventsFactory = ControllerEvents()
			const componentSdkState = componentSdkStateFactory()
			const commonConfigManager = CommonConfigManager(bootstrapData, createSdkHandlers)
			const bsiManager = BsiManagerModule(commonConfigManager, bootstrapData, createSdkHandlers)
			const linkUtils = createLinkUtils({
				isMobileView: bootstrapData.isMobileView,
				getCompIdByWixCodeNickname: modelsApi.getCompIdByWixCodeNickname,
				getRoleForCompId: modelsApi.getRoleForCompId,
				routingInfo: platformEnvData.router.routingInfo,
				metaSiteId: platformEnvData.location.metaSiteId,
				userFileDomainUrl: platformEnvData.location.userFileDomainUrl,
				routersConfig: bootstrapData.platformAPIData.routersConfigMap,
				popupPages: platformEnvData.popups?.popupPages,
				multilingualInfo: platformEnvData.multilingual,
			})
			const wixCodeNamespacesRegistry = createWixCodeNamespacesRegistry()

			const essentials = new ViewerPlatformEssentials({
				metaSiteId: platformEnvData.location.metaSiteId,
				conductedExperiments: {},
				appsConductedExperiments: bootstrapData.essentials.appsConductedExperiments,
				getAppToken(appDefId) {
					return sessionService.getInstance(appDefId)
				},
				isSSR,
			})

			const biUtils = platformBiLoggerFactory({
				sessionService,
				factory: essentials.biLoggerFactory,
				location: platformEnvData.location,
				biData: platformEnvData.bi,
				site: platformEnvData.site,
			})
			const locationManager = CreateLocationManager({ handlers, platformEnvData, bootstrapData })

			const warmupDataManager = CreateWarmupDataManager({ handlers, platformEnvData })
			const consentPolicyManager = CreateConsentPolicyManager({ handlers, platformEnvData })
			const platformUtils = BuildPlatformUtils({
				linkUtils,
				sessionService,
				appsPublicApiManager,
				wixCodeNamespacesRegistry,
				biUtils,
				locationManager,
				essentials,
				warmupDataManager,
				consentPolicyManager,
				clientSpecMapApi,
			})
			const { createSetProps, waitForUpdatePropsPromises, createSetPropsForOOI } = setPropsFactory({ modelsApi, viewerAPI, logger, handlers })
			const registerEventFactory = RegisterEventFactory({ handlers, modelsApi })
			const animationsApi = PlatformAnimationsAPI({ handlers, platformEnvData, modelsApi })
			const { getSdkFactoryParams } = createSdkFactoryParams({
				animationsApi,
				sdkInstancesCache,
				componentSdkState,
				platformUtils,
				viewerAPI,
				modelsApi,
				createSdkHandlers,
				getCompRefById,
				logger,
				createSetProps,
				registerEventFactory,
				platformEnvData,
			})
			const wixSelector = WixSelector({
				bootstrapData,
				modelsApi,
				getSdkFactoryParams,
				controllerEventsFactory,
				sdkInstancesCache,
				componentSdksManager,
				logger,
			})
			const reporter = {
				logSdkError,
				logSdkWarning,
			}
			const controllersExports: ControllersExports = {}

			const AppControllerSdkLoader = async () => {
				const { AppControllerSdk } = await import('./componentsSDK/AppController' /* webpackChunkName: "AppController.corvid" */)
				return AppControllerSdk({ controllersExports, modelsApi, controllerEventsFactory })
			}

			const AppWidgetSdkLoader = async () => {
				const { AppControllerWithChildrenSdk } = await import('./componentsSDK/AppController' /* webpackChunkName: "AppController.corvid" */)
				return AppControllerWithChildrenSdk({ controllersExports, modelsApi, controllerEventsFactory })
			}

			const staticEventsManager = CreateStaticEventsManager({ modelsApi, controllerEventsFactory, wixSelector, logger })
			// create here
			const wixCodeViewerAppUtils = WixCodeViewerAppUtils({ bootstrapData, staticEventsManager })
			const blocksPreviewAppUtils = BlocksPreviewAppUtils({ bootstrapData })
			const wixCodeApiFactory = createWixCodeApiFactory({
				bootstrapData,
				wixCodeViewerAppUtils,
				modelsApi,
				clientSpecMapApi,
				platformUtils,
				createSdkHandlers,
				platformEnvData,
				logger,
			})

			const createPlatformApiForApp = createPlatformApi({
				platformEnvData,
				platformUtils,
				createStorageApi,
				handlers,
			})

			const moduleFederationManager = ModuleFederationManagerFactory({ logger, moduleLoader, appsUrlApi, clientSpecMapApi, platformEnvData })

			const { runApplications, createRepeatedControllers } = Applications({
				appsPublicApiManager,
				platformUtils,
				clientSpecMapApi,
				appsUrlApi,
				modelsApi,
				bootstrapData,
				importScripts,
				wixCodeViewerAppUtils,
				blocksPreviewAppUtils,
				wixSelector,
				logger,
				wixCodeApiFactory,
				createSetPropsForOOI,
				waitForUpdatePropsPromises,
				controllersExports,
				createPlatformApiForApp,
				bsiManager,
				essentials,
				commonConfig: commonConfigManager.get(),
				handlers,
				moduleFederationManager,
			})

			const RepeaterSdkLoader = async () => {
				const { RepeaterSdk } = await import('./componentsSDK/repeaters/Repeater' /* webpackChunkName: "Repeater.corvid" */)
				return RepeaterSdk({
					modelsApi,
					viewerAPI,
					wixSelector,
					reporter,
					sdkInstancesCache,
					componentSdkState,
					platformEnvData,
					createRepeatedControllers,
				})
			}

			const DocumentSdkLoader = async () => Promise.resolve(DocumentSdkFactory({ modelsApi, wixSelector }))

			const coreSdks: CoreSdkLoaders = {
				AppController: AppControllerSdkLoader,
				AppWidget: AppWidgetSdkLoader,
				TPAWidget: AppControllerSdkLoader,
				TPASection: AppControllerSdkLoader,
				TPAMultiSection: AppControllerSdkLoader,
				TPAGluedWidget: AppControllerSdkLoader,
				tpaWidgetNative: AppControllerSdkLoader,
				Repeater: RepeaterSdkLoader,
				Document: DocumentSdkLoader,
			}
			componentSdksManager.fetchComponentsSdks(coreSdks)
			logger.interactionEnded('initialisation')

			await logger.runAsyncAndReport('runApplications', () => runApplications(modelsApi.getApplicationIds()))
			// calling it here because we need to run all the applications, register the controllers APIs, run and finish all PageReady/OnReady, before executing any static events handlers.
			// some handlers may depends on the apis being registered and onReady been called,
			staticEventsManager.triggerStaticEventsHandlers() // TODO do we need to run this is SSR?
		},
	}
}

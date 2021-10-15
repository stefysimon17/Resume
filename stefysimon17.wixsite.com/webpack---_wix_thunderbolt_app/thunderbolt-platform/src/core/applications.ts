import _ from 'lodash'
import { getDisplayedId } from '@wix/thunderbolt-commons'
import type {
	ControllerDataItem,
	PlatformAPI,
	PlatformUtils,
	PlatformLogger,
	ControllersApi,
	ClientSpecMapAPI,
	CommonConfig,
	ModelsAPI,
	AppModule,
	AppParams,
	WixCodeApi,
	ComponentEventContext,
	PlatformServicesAPI,
	WidgetNames,
} from '@wix/thunderbolt-symbols'
import type { BootstrapData } from '../types'
import type { ControllersExports, ControllerData } from './types'
import type { AppsUrlAPI } from './appsUrlService'
import type { WixCodeViewerAppUtils } from './wixCodeViewerAppUtils'
import type { BlocksPreviewAppUtils } from './blocksPreviewAppUtils'
import type { WixSelector } from './wixSelector'
import type { BsiManager } from './bsiManagerModule'
import type { CreateSetPropsForOOI } from './setPropsFactory'
import type { WixCodeApiFactory } from './createWixCodeSdk'
import type { AppsPublicApiManager } from './appsPublicApiManager'
import type { ViewerPlatformEssentials } from '@wix/fe-essentials-viewer-platform'
import type { ModuleFederationManager } from './moduleFederationManager'
import { BlocksPreviewAppDefId, EVENT_CONTEXT_SCOPE, WixCodeAppDefId } from './constants'
import { initializeDebugApi } from './debug'
import { createAppParams } from './appsAPI/appParams'
import { createControllersParams } from './appsAPI/controllerParams'
import { createPlatformAppServicesApi } from './appsAPI/platformServicesAPI'
import { importAndInitElementorySupport } from './elementorySupport'

function createControllerItemContext(repeaterCompId: string, itemId: string) {
	const context = {
		type: EVENT_CONTEXT_SCOPE.COMPONENT_SCOPE,
		itemId,
		_internal: {
			repeaterCompId,
		},
	} as ComponentEventContext
	return context
}

export function Applications({
	appsPublicApiManager,
	wixSelector,
	modelsApi,
	clientSpecMapApi,
	appsUrlApi,
	bootstrapData,
	importScripts,
	wixCodeViewerAppUtils,
	blocksPreviewAppUtils,
	logger,
	wixCodeApiFactory,
	createSetPropsForOOI,
	waitForUpdatePropsPromises,
	controllersExports,
	createPlatformApiForApp,
	bsiManager,
	platformUtils,
	essentials,
	commonConfig,
	handlers,
	moduleFederationManager,
}: {
	appsPublicApiManager: AppsPublicApiManager
	wixSelector: WixSelector
	modelsApi: ModelsAPI
	clientSpecMapApi: ClientSpecMapAPI
	appsUrlApi: AppsUrlAPI
	bootstrapData: BootstrapData
	importScripts: (url: string) => Promise<void>
	wixCodeViewerAppUtils: WixCodeViewerAppUtils
	blocksPreviewAppUtils: BlocksPreviewAppUtils
	logger: PlatformLogger
	wixCodeApiFactory: WixCodeApiFactory
	createSetPropsForOOI: CreateSetPropsForOOI
	waitForUpdatePropsPromises: () => Promise<unknown>
	controllersExports: ControllersExports
	createPlatformApiForApp: (applicationId: string, instanceId: string) => PlatformAPI
	bsiManager: BsiManager
	platformUtils: PlatformUtils
	essentials: ViewerPlatformEssentials
	commonConfig: CommonConfig
	handlers: any
	moduleFederationManager: ModuleFederationManager
}) {
	const {
		wixCodeBootstrapData,
		platformEnvData: {
			bi: { isPreview },
			router: { dynamicRouteData },
			window: { csrfToken },
			site: { mode, isEditorMode, experiments },
			livePreviewOptions,
		},
	} = bootstrapData
	const applications = modelsApi.getApplications()
	const controllerConfigs = modelsApi.getControllerConfigs()
	const connections = modelsApi.getAllConnections()
	const isAppRunning = (appDefId: string | undefined) => appDefId && applications[appDefId]
	const isWixCodeRunning = !!isAppRunning(clientSpecMapApi.getWixCodeAppDefinitionId())
	const isDatabindingRunning = !!isAppRunning(clientSpecMapApi.getDataBindingAppDefinitionId())
	const isBlocksRunning = _.some(clientSpecMapApi.getBlocksAppsAppDefinitionIds(), (app) => isAppRunning(app))

	const applicationsParams: {
		[appDefId: string]: {
			viewerScriptUrl: string
			appModule: AppModule
			appParams: AppParams
			widgetNames: WidgetNames
			wixCodeApi: WixCodeApi
			platformAppServicesApi: PlatformServicesAPI
			platformApi: PlatformAPI
			controllerModules: any // ModuleFederationManager
		}
	} = {}

	const loadControllerModules = async (controllersData: Array<ControllerDataItem>, viewerScriptUrl: string) => {
		const controllerModules: { [controllerType: string]: unknown } = {}
		await Promise.all(
			_.map(controllersData, async ({ controllerType, applicationId }: ControllerDataItem) => {
				const controller = await moduleFederationManager.loadControllerModule(
					{
						controllerType,
						applicationId,
					},
					viewerScriptUrl
				)
				if (controller) {
					controllerModules[controllerType] = controller
				}
			})
		)
		return controllerModules
	}

	const runApplication = async (appDefinitionId: string) => {
		const viewerScriptUrl = appsUrlApi.getViewerScriptUrl(appDefinitionId)
		if (!viewerScriptUrl) {
			/**
			 * Might be because clientSpecMap data corruption (App is missing) or might be because OOI migration
			 */
			const error = new Error('Could not find viewerScriptUrl. The Application might be missing from the CSM')
			logger.captureError(error, {
				tags: { missingViewerScriptUrl: true },
				extra: { appDefinitionId },
			})
			appsPublicApiManager.resolvePublicApi(appDefinitionId, null)
			return
		}

		const appModule = await moduleFederationManager.loadAppModule(appDefinitionId, viewerScriptUrl)
		if (!appModule) {
			// error loading app module. errors are reported via moduleLoader.
			appsPublicApiManager.resolvePublicApi(appDefinitionId, null)
			return
		}
		const appSpecData = clientSpecMapApi.getAppSpecData(appDefinitionId)
		const routerConfigMap = _.filter(bootstrapData.platformAPIData.routersConfigMap, { appDefinitionId })
		const appParams = createAppParams({
			appSpecData,
			wixCodeViewerAppUtils,
			blocksPreviewAppUtils,
			dynamicRouteData,
			routerConfigMap,
			appInstance: platformUtils.sessionService.getInstance(appDefinitionId),
			baseUrls: appsUrlApi.getBaseUrls(appDefinitionId),
			viewerScriptUrl,
			blocksData: clientSpecMapApi.getBlocksData(appDefinitionId),
		})
		const instanceId = appParams.instanceId
		const platformApi = createPlatformApiForApp(appDefinitionId, instanceId)
		const platformAppServicesApi = createPlatformAppServicesApi({
			platformEnvData: bootstrapData.platformEnvData,
			appDefinitionId,
			instanceId,
			csrfToken,
			bsiManager,
			sessionService: platformUtils.sessionService,
			essentials,
		})

		const wixCodeApi = await wixCodeApiFactory.initWixCodeApiForApplication(appDefinitionId)
		if (appDefinitionId === WixCodeAppDefId) {
			/*
			 *  TODO storage is a namespace in the sense that you can "import storage from wix-storage",
			 *  but it's not a namespace in the sense that it's bound to appDefId and instanceId.
			 *  consider creating wixCodeApi per app.
			 */
			wixCodeApi.storage = platformApi.storage
		}
		platformUtils.wixCodeNamespacesRegistry.registerWixCodeNamespaces(wixCodeApi)

		if (appModule.initAppForPage) {
			await logger.withReportingAndErrorHandling('init_app_for_page', () => appModule.initAppForPage!(appParams, platformApi, wixCodeApi, platformAppServicesApi), { appDefinitionId })
		}

		const widgetNames = clientSpecMapApi.getAppWidgetNames(appDefinitionId)

		const controllersData = _(applications[appDefinitionId])
			.values()
			.map((controller) => {
				const controllerCompId = controller.compId
				const controllerConfig = controllerConfigs[appDefinitionId][controllerCompId]
				const controllers = [{ ...controller, config: controllerConfig }] as Array<ControllerData>

				if (modelsApi.isRepeaterTemplate(controllerCompId)) {
					// if controller inside repeater template => create a controller params for each item, with its own context
					const repeaterCompId = modelsApi.getRepeaterIdByCompId(controllerCompId)!
					const repeaterItemIds = modelsApi.getCompProps(repeaterCompId).items as Array<string>
					repeaterItemIds.forEach((itemId) => {
						const displayedId = getDisplayedId(controllerCompId, itemId)
						controllers.push({
							...controller,
							config: { ...controllerConfig, ...controllerConfigs[appDefinitionId][displayedId] },
							context: createControllerItemContext(repeaterCompId, itemId),
						})
					})
				}

				return controllers
			})
			.flatten()
			.value()

		const controllersParams = createControllersParams(
			createSetPropsForOOI,
			controllersData,
			connections,
			wixSelector,
			widgetNames,
			appParams,
			wixCodeApi,
			platformAppServicesApi,
			platformApi,
			csrfToken,
			essentials,
			platformAppServicesApi.essentials,
			livePreviewOptions
		)

		if (appDefinitionId === WixCodeAppDefId && mode.debug) {
			initializeDebugApi({ wixCodeApi, $w: controllersParams[0].controllerParams.$w })
		}

		const controllerModules = await loadControllerModules(controllersData, viewerScriptUrl)
		logger.reportAppPhasesNetworkAnalysis(appDefinitionId)

		// cache params for creating dynamically added controllers
		applicationsParams[appDefinitionId] = {
			viewerScriptUrl,
			appModule,
			appParams,
			widgetNames,
			wixCodeApi,
			platformAppServicesApi,
			platformApi,
			controllerModules,
		}

		const controllerPromises = await logger.withReportingAndErrorHandling(
			'create_controllers',
			() =>
				appModule.createControllers(
					controllersParams.map((item) => item.controllerParams),
					controllerModules
				),
			{ appDefinitionId }
		)

		const controllersApi: ControllersApi = { getAll: () => controllerPromises || [] }
		const exports = _.isFunction(appModule.exports) ? appModule.exports({ controllersApi }) : appModule.exports

		appsPublicApiManager.resolvePublicApi(appDefinitionId, exports) // todo @nitzanh - support dynamic items' controllers

		if (!controllerPromises) {
			return
		}

		await Promise.all(
			controllerPromises.map(async (controllerPromise, index) => {
				const { controllerCompId, controllerParams } = controllersParams[index]
				const reportingParams = { appDefinitionId, controllerType: controllerParams.type }
				const controller = await logger.withReportingAndErrorHandling('await_controller_promise', () => controllerPromise, reportingParams)
				if (!controller) {
					return
				}

				const controllerContext = controllersData[index].context
				controllersExports[controllerContext ? getDisplayedId(controllerCompId, controllerContext.itemId) : controllerCompId] = controller.exports

				const pageReadyFunc = () => Promise.resolve(controller.pageReady(controllerParams.$w, wixCodeApi))
				wixSelector.onPageReady(() => logger.withReportingAndErrorHandling('controller_page_ready', pageReadyFunc, reportingParams), controllerCompId)
				if (controllerParams.appParams.appDefinitionId === BlocksPreviewAppDefId) {
					handlers.registerExportsSetter(controllerCompId, (props: Record<string, any>) => {
						if (controller.exports) {
							Object.assign(controller.exports() as Record<string, any>, props)
						}
					})
				}
				if (controller.updateConfig && isEditorMode) {
					handlers.registerToConfigUpdate(controllerCompId, (updatedConfig: unknown) => controller.updateConfig!(controllerParams.$w, updatedConfig))
				}
			})
		)
	}

	async function runApplications(appDefinitionIds: Array<string>) {
		if (isWixCodeRunning || isDatabindingRunning || isBlocksRunning) {
			await importAndInitElementorySupport({
				importScripts,
				wixCodeBootstrapData,
				sessionService: platformUtils.sessionService,
				viewMode: isPreview ? 'preview' : 'site',
				csrfToken,
				commonConfig,
				logger,
				experiments,
			})
		}
		appsPublicApiManager.registerPublicApiProvider(runApplication)

		await Promise.all(
			_.map(appDefinitionIds, (appDefinitionId) =>
				runApplication(appDefinitionId).catch((error) => {
					appsPublicApiManager.resolvePublicApi(appDefinitionId, null)
					logger.captureError(error, { tags: { method: 'runApplication' }, extra: { appDefinitionId } })
				})
			)
		)
		await wixSelector.flushOnReadyCallbacks()
		await waitForUpdatePropsPromises()
	}

	const createRepeatedControllers = async (repeaterId: string, itemIds: Array<string>) => {
		const appToControllers = modelsApi.getRepeatedControllers(repeaterId) // {[appDefId]: appControllersInRepeater}

		if (_.isEmpty(appToControllers)) {
			return _.noop
		}

		await Promise.all(
			_.map(appToControllers, async (controllers, appDefinitionId) => {
				if (!applicationsParams[appDefinitionId]) {
					return _.noop
				}
				const { appModule, appParams, widgetNames, wixCodeApi, platformAppServicesApi, platformApi, controllerModules } = applicationsParams[appDefinitionId]
				const controllersData = _(controllers)
					.map((controller, controllerCompId) => {
						return itemIds.map((itemId) => {
							return { ...controller, config: controllerConfigs[appDefinitionId][controllerCompId], context: createControllerItemContext(repeaterId, itemId) }
						})
					})
					.flatten()
					.value()

				const controllersParams = createControllersParams(
					createSetPropsForOOI,
					controllersData,
					connections,
					wixSelector,
					widgetNames,
					appParams,
					wixCodeApi,
					platformAppServicesApi,
					platformApi,
					csrfToken,
					essentials,
					platformAppServicesApi.essentials
				)

				const controllerPromises = appModule.createControllers(
					controllersParams.map((item) => item.controllerParams),
					controllerModules
				)

				return Promise.all(
					controllerPromises.map(async (controllerPromise, index) => {
						const { controllerCompId, controllerParams } = controllersParams[index]
						const controller = await controllerPromise
						controllersExports[getDisplayedId(controllerCompId, controllersData[index].context.itemId)] = controller.exports
						const pageReadyFunc = () => Promise.resolve(controller.pageReady(controllerParams.$w, wixCodeApi))
						wixSelector.onPageReady(pageReadyFunc, controllerCompId)
					})
				)
			})
		)

		return wixSelector.flushOnReadyCallbacks
	}

	return {
		runApplications,
		createRepeatedControllers,
	}
}

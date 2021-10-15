import { getControllerNameFromUrl } from './getControllerNameFromUrl'
import type { PlatformLogger, ControllerDataItem, AppModule, ClientSpecMapAPI, PlatformEnvData } from '@wix/thunderbolt-symbols'
import type { ModuleLoader } from './types'
import type { AppsUrlAPI } from './appsUrlService'

export interface Container {
	init(): Promise<void>
	get(name: string): Promise<() => AppModule>
}

export interface ModuleFederationManager {
	getControllerNameFromUrl(controllerScriptUrl: string): string
	loadAppModule(appDefinitionId: string, viewerScriptUrl: string): Promise<AppModule | null>
	loadControllerModule({ controllerType, applicationId: appDefinitionId }: Pick<ControllerDataItem, 'controllerType' | 'applicationId'>, viewerScriptUrl: string): Promise<any>
}

export function ModuleFederationManagerFactory({
	logger,
	moduleLoader,
	appsUrlApi,
	clientSpecMapApi,
	platformEnvData,
}: {
	logger: PlatformLogger
	moduleLoader: ModuleLoader
	appsUrlApi: AppsUrlAPI
	clientSpecMapApi: ClientSpecMapAPI
	platformEnvData: PlatformEnvData
}): ModuleFederationManager {
	return {
		getControllerNameFromUrl,
		async loadAppModule(appDefinitionId: string, viewerScriptUrl: string): Promise<AppModule | null> {
			const isModuleFederated = clientSpecMapApi.isModuleFederated(appDefinitionId) && platformEnvData.site.experiments['specs.thunderbolt.module_federation']
			const appModule = isModuleFederated
				? await loadModuleWithModuleFederation(moduleLoader, logger, viewerScriptUrl, appDefinitionId, 'viewerScript')
				: await logger.withReportingAndErrorHandling('script_loaded', () => moduleLoader.loadModule<AppModule>(viewerScriptUrl), { appDefinitionId })
			return appModule
		},
		async loadControllerModule({ controllerType, applicationId: appDefinitionId }: Pick<ControllerDataItem, 'controllerType' | 'applicationId'>, viewerScriptUrl: string): Promise<any> {
			const isModuleFederated = clientSpecMapApi.isModuleFederated(appDefinitionId) && platformEnvData.site.experiments['specs.thunderbolt.module_federation']
			const controllerScriptUrl = appsUrlApi.getControllerScriptUrl(appDefinitionId, controllerType)
			if (!controllerScriptUrl) {
				return null
			}

			if (isModuleFederated) {
				const controllerName = getControllerNameFromUrl(controllerScriptUrl)
				return logger.withReportingAndErrorHandlingSync('script_loaded', () => loadModuleWithModuleFederation(moduleLoader, logger, viewerScriptUrl, appDefinitionId, controllerName), {
					appDefinitionId,
					controllerType,
				})
			}

			return logger.withReportingAndErrorHandling('script_loaded', () => moduleLoader.loadModule(controllerScriptUrl), { appDefinitionId, controllerType })
		},
	}
}

async function loadModuleWithModuleFederation(moduleLoader: ModuleLoader, logger: PlatformLogger, viewerScriptUrl: string, appDefinitionId: string, moduleName: string) {
	const webworkerContainerUrl = viewerScriptUrl.replace('viewerScript.bundle', `webworkerContainer${moduleName}`)

	const container = await logger.withReportingAndErrorHandling('script_loaded', () => moduleLoader.loadModule<Container>(webworkerContainerUrl), { appDefinitionId })

	return loadModuleFromContainer(container!, moduleName)
}

async function loadModuleFromContainer(container: Container, moduleName: string): Promise<AppModule> {
	// Initializes the share scope. This fills it with known provided modules from this build and all remotes
	// This will be replaced by using a shared scope of our own
	// @ts-ignore
	await __webpack_init_sharing__('default')

	// @ts-ignore
	await container.init(__webpack_share_scopes__.default)

	const moduleFactory = await container.get(moduleName)

	const federatedModule = moduleFactory()

	return federatedModule
}

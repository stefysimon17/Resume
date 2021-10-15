import _ from 'lodash'
import { createPromise } from '@wix/thunderbolt-commons'
import type { PlatformLogger, PublicAPI, ClientSpecMapAPI, ModelsAPI } from '@wix/thunderbolt-symbols'
import type { BootstrapData } from '../types'

type PublicApiProviderFunc = (appDefinitionId: string) => void
export type AppsPublicApiManager = {
	resolvePublicApi: (appDefinitionId: string, publicApi: PublicAPI) => void
	getPublicApi: (appDefinitionId: string) => Promise<PublicAPI>
	registerPublicApiProvider: (publicApiProviderFunc: PublicApiProviderFunc) => void
}
type PublicApisPromises = { [appDefinitionId: string]: { setPublicApi: (api: PublicAPI) => void; publicApiPromise: Promise<PublicAPI> } }

const createPromiseForApp = () => {
	const { resolver, promise } = createPromise<PublicAPI>()
	return { publicApiPromise: promise, setPublicApi: resolver }
}

export function AppsPublicApiManagerFactory({
	modelsApi,
	clientSpecMapApi,
	logger,
	handlers,
	bootstrapData,
	importScripts,
}: {
	modelsApi: ModelsAPI
	clientSpecMapApi: ClientSpecMapAPI
	logger: PlatformLogger
	handlers: any
	bootstrapData: BootstrapData
	importScripts: (url: string) => Promise<void>
}): AppsPublicApiManager {
	const publicApisPromises: PublicApisPromises = _.mapValues(modelsApi.getApplications(), createPromiseForApp)
	let publicApiProviderFunc: PublicApiProviderFunc
	const pageId = bootstrapData.currentPageId

	async function getPublicApi(appDefinitionId: string) {
		if (!clientSpecMapApi.isAppOnSite(appDefinitionId)) {
			throw new Error(`getPublicAPI() of ${appDefinitionId} failed. The app does not exist on site.`)
		}
		if (!publicApisPromises[appDefinitionId]) {
			publicApisPromises[appDefinitionId] = createPromiseForApp()
			if (!publicApiProviderFunc) {
				logger.captureError(new Error('appsPublicApiManager Error: runApplicationFunc is not a function'), {
					tags: { appsPublicApiManager: true },
					extra: { appDefinitionId },
				})
				throw new Error(`getPublicAPI() of ${appDefinitionId} failed`)
			}
			publicApiProviderFunc(appDefinitionId) // the provider resolves the publicApisPromises[appDefinitionId] promise
		}
		return publicApisPromises[appDefinitionId].publicApiPromise
	}

	return {
		resolvePublicApi(appDefinitionId: string, publicApi: PublicAPI) {
			publicApisPromises[appDefinitionId].setPublicApi(publicApi)
		},
		registerPublicApiProvider(_publicApiProviderFunc: PublicApiProviderFunc) {
			publicApiProviderFunc = _publicApiProviderFunc

			if (process.env.browser) {
				handlers.registerPublicApiGetter(async () => {
					if (!self.pmrpc) {
						await logger.runAsyncAndReport(`import_scripts_pm-rpc`, async () => {
							try {
								await importScripts('https://static.parastorage.com/unpkg/pm-rpc@3.0.3/build/pm-rpc.min.js')
							} catch {
								await importScripts('https://static.parastorage.com/unpkg/pm-rpc@3.0.3/build/pm-rpc.min.js') // retry
							}
						})
					}

					// both wix code and dbsm viewer app have hard time when we call their createControllers() with no controllers
					const wixCodeAppDefinitionId = clientSpecMapApi.getWixCodeAppDefinitionId()
					const dataBindingAppDefinitionId = clientSpecMapApi.getDataBindingAppDefinitionId()
					const publicApis = await Promise.all(
						clientSpecMapApi
							.getAppsOnSite()
							.filter((appDefinitionId) => appDefinitionId !== wixCodeAppDefinitionId && appDefinitionId !== dataBindingAppDefinitionId)
							.map(async (appDefinitionId) => {
								const publicAPI = await getPublicApi(appDefinitionId)
								return { appDefinitionId, publicAPI }
							})
					)

					return publicApis
						.filter(({ publicAPI }) => publicAPI)
						.map(({ appDefinitionId, publicAPI }) => {
							const name = `viewer_platform_public_api_${appDefinitionId}_${pageId}`
							self.pmrpc!.api.set(name, publicAPI)
							return name
						})
				})
			}
		},
		getPublicApi,
	}
}

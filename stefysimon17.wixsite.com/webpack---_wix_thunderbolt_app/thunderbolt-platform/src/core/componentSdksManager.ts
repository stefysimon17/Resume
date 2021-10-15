import _ from 'lodash'
import { createPromise } from '@wix/thunderbolt-commons'
import type { ComponentSdksManager } from './types'
import type { PlatformLogger, ModelsAPI } from '@wix/thunderbolt-symbols'
import type { ComponentSdks, ComponentSdksLoader, CoreSdkLoaders } from '../types'

function getSdkTypesToLoad(modelsApi: ModelsAPI) {
	const compIdToConnections = modelsApi.getCompIdConnections()
	return [
		'PageBackground',
		..._(modelsApi.getStructureModel())
			.transform((sdkTypes, compStructure, compId) => {
				if (compIdToConnections[compId]) {
					sdkTypes[compStructure.componentType] = true
				}
			}, {} as Record<string, boolean>)
			.keys()
			.value(),
	]
}

export function ComponentSdksManagerFactory({
	loadComponentSdksPromise,
	modelsApi,
	logger,
}: {
	loadComponentSdksPromise: Promise<ComponentSdksLoader>
	modelsApi: ModelsAPI
	logger: PlatformLogger
}): ComponentSdksManager {
	const componentsSdks: ComponentSdks = {}
	const sdkTypesToCompTypesMapper: ComponentSdksLoader['sdkTypeToComponentTypes'] = {}
	const { resolver: sdkResolver, promise: sdkPromise } = createPromise()

	async function loadCoreComponentSdks(compTypes: Array<string>, coreSdksLoaders: CoreSdkLoaders) {
		const compsPromises = [...compTypes, 'Document']
			.filter((type) => coreSdksLoaders[type])
			.map((type) =>
				coreSdksLoaders[type]()
					.then((sdkFactory) => ({ [type]: sdkFactory }))
					.catch((e) => {
						logger.captureError(new Error('could not load core component SDKs from thunderbolt'), {
							groupErrorsBy: 'values',
							tags: { method: 'loadCoreComponentSdks' },
							extra: { type, error: e },
						})
						return {}
					})
			)
		const sdksArray = await Promise.all(compsPromises)
		return Object.assign({}, ...sdksArray)
	}

	return {
		async fetchComponentsSdks(coreSdksLoaders: CoreSdkLoaders) {
			const compTypes = getSdkTypesToLoad(modelsApi)
			logger.interactionStarted('loadComponentSdk')
			const { loadComponentSdks, sdkTypeToComponentTypes } = await loadComponentSdksPromise
			Object.assign(sdkTypesToCompTypesMapper, sdkTypeToComponentTypes || {})
			if (!loadComponentSdks) {
				sdkResolver()
				return
			}
			const componentSdksPromise = loadComponentSdks(compTypes, logger).catch((e) => {
				logger.captureError(new Error('could not load component SDKs from loadComponentSdks function'), {
					groupErrorsBy: 'values',
					tags: { method: 'loadComponentSdks' },
					extra: { compTypes, error: e },
				})
				return {}
			})
			const [coreSdks, sdks] = await Promise.all([loadCoreComponentSdks(compTypes, coreSdksLoaders), componentSdksPromise]).catch((e) => {
				logger.captureError(new Error('could not load component SDKs'), { groupErrorsBy: 'values', tags: { method: 'loadComponentSdks' }, extra: { compTypes, error: e } })
				return []
			})
			Object.assign(componentsSdks, sdks, coreSdks)
			sdkResolver()
			logger.interactionEnded('loadComponentSdk')
		},
		waitForSdksToLoad() {
			return sdkPromise
		},
		getComponentSdkFactory(compType, compInfo) {
			const sdkFactory = componentsSdks[compType]
			if (!sdkFactory) {
				logger.captureError(new Error('could not find component SDK'), {
					groupErrorsBy: 'values',
					tags: { method: 'loadComponentSdks', compType },
					extra: { ...compInfo, componentsSdks: _.keys(componentsSdks), compType },
				})
				return
			}
			return sdkFactory
		},
		getSdkTypeToComponentTypes(sdkType: string) {
			return sdkTypesToCompTypesMapper[sdkType] || [sdkType]
		},
	}
}

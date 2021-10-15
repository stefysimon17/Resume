import {
	registry,
	IPlatformComponentsRegistry,
	IPlatformComponentModel,
	ILibraryTopology,
	IRegistryManifest,
	IComponentLoader,
} from '@wix/editor-elements-registry/2.0/platform'
import { INJECTED_SDK_GLOBAL_PROP_NAME } from './runtime'
import { createRegistryInstanceCache } from '@wix/editor-elements-registry/2.0/toolbox'

import _ from 'lodash'

import { FetchResponse } from '@wix/thunderbolt-symbols'

type IComponentSDKs = Record<string, IPlatformComponentModel['sdk']['factory']>

export interface IComponentSDKLoader {
	sdkTypeToComponentTypes: Record<string, Array<string>>
	loadComponentSdks: (componentTypes: Array<string>) => Promise<IComponentSDKs>
}

export interface IComponentsRegistryPlatform {
	getRegistryAPI: () => IPlatformComponentsRegistry
	getComponentsSDKsLoader: () => IComponentSDKLoader
}

export interface IPlatformRegistryParameters {
	libraries: Array<ILibraryTopology | IRegistryManifest>
	mode?: 'lazy' | 'eager'
	fetchFn?: (url: string) => Promise<FetchResponse>
	loadFallbackSDKModule?: () => Promise<IPlatformComponentModel>
}

const cache = createRegistryInstanceCache<IPlatformComponentsRegistry>()

export function injectSDK(componentType: string, factory: IPlatformComponentModel['sdk']['factory'], sdkType?: string) {
	if (!self[INJECTED_SDK_GLOBAL_PROP_NAME]) {
		self[INJECTED_SDK_GLOBAL_PROP_NAME] = {}
	}

	const loader: IComponentLoader<any> = () =>
		Promise.resolve({
			sdk: {
				factory,
			},
		})
	loader.assets = []
	loader.isPartExist = () => false
	loader.statics = { sdkType }

	self[INJECTED_SDK_GLOBAL_PROP_NAME][componentType] = loader
}

export function clearInjectedSDKs() {
	self[INJECTED_SDK_GLOBAL_PROP_NAME] = {}
}

function getInjectedSDKs() {
	return self[INJECTED_SDK_GLOBAL_PROP_NAME] || {}
}

async function getRegistryAPI({
	libraries,
	fetchFn,
	mode,
}: IPlatformRegistryParameters): Promise<IPlatformComponentsRegistry> {
	return cache.getRegistryAPI({
		libraries,
		shouldCache: !process.env.browser,
		factory: () => {
			return registry({
				mode,
				libraries,
				fetcher: fetchFn
					? async (resourceURL: string) => {
							const response = await fetchFn(resourceURL)
							return response.text()
					  }
					: undefined,
				globals: {
					_,
					lodash: _,
				},
			})
		},
	})
}

export async function createComponentsRegistryPlatform(
	options: IPlatformRegistryParameters
): Promise<IComponentsRegistryPlatform> {
	const { loadFallbackSDKModule } = options

	const registryAPI = await getRegistryAPI(options)
	const loaders = registryAPI.getComponentsLoaders()
	Object.assign(loaders, getInjectedSDKs())

	const sdkTypeToComponentTypes: Record<string, Array<string>> = {}

	Object.keys(loaders).forEach((componentType) => {
		const loader = loaders[componentType]

		const key = loader.statics?.sdkType ?? componentType

		if (!sdkTypeToComponentTypes[key]) {
			sdkTypeToComponentTypes[key] = []
		}

		sdkTypeToComponentTypes[key].push(componentType)
	})

	return {
		getComponentsSDKsLoader() {
			return {
				sdkTypeToComponentTypes: { ...sdkTypeToComponentTypes },
				async loadComponentSdks(componentTypes) {
					const [existingComponents, unexistingComponents] = _.partition(
						componentTypes,
						(componentType) => componentType in loaders
					)

					const shouldLoadFallback = loadFallbackSDKModule && unexistingComponents.length !== 0

					const [models, fallbackSDKModule] = await Promise.all([
						registryAPI.loadComponents(existingComponents),
						shouldLoadFallback ? loadFallbackSDKModule!() : null,
					])

					const componentSDKs: IComponentSDKs = {}

					if (fallbackSDKModule) {
						unexistingComponents.forEach((componentType) => {
							componentSDKs[componentType] = fallbackSDKModule.sdk as any
						})
					}

					Object.keys(models).forEach((componentType) => {
						/**
						 * Backward compatibility since we changed the component SDK model
						 * In future should `models[componentType].sdk.factory`
						 */
						const sdk = models[componentType].sdk
						componentSDKs[componentType] = typeof sdk.factory === 'function' ? sdk.factory : (sdk as any)
					})

					return componentSDKs
				},
			}
		},
		getRegistryAPI() {
			return registryAPI
		},
	}
}

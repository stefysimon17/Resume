import { IComponentsRegistrar } from '@wix/thunderbolt-components-loader'
import { ComponentsRegistryError, ComponentsRegistryErrorTypes } from './errors'
import { getGlobalRegistryRuntime } from './runtime'
import { splitComponentName } from './common'

import { registry, IThunderboltComponentsRegistry } from '@wix/editor-elements-registry/2.0/thunderbolt'

/**
 * Components Registry for Thunderbolt Client Side Rendering
 */
export interface IComponentsRegistryCSR {
	getRegistryAPI: () => IThunderboltComponentsRegistry
	/**
	 * Legacy API is used for migrating to the thunderbolt + registry integration
	 */
	getLegacyComponentsRegistrarAPI: () => IComponentsRegistrar
}

export async function createComponentsRegistryCSR(): Promise<IComponentsRegistryCSR> {
	const runtime = getGlobalRegistryRuntime()

	if (!runtime) {
		throw new ComponentsRegistryError(
			'"serviceTopology" or "runtime" is required to create registry',
			ComponentsRegistryErrorTypes.INVALID_ARGUMENTS
		)
	}

	const registryAPI = await registry({
		options: {
			useScriptsInsteadOfEval: true,
		},
		mode: 'lazy',
		...(runtime ? runtime : { libraries: [] }),
	})

	const loaders = registryAPI.getComponentsLoaders()

	return {
		getLegacyComponentsRegistrarAPI() {
			return {
				registerComponents: (hostAPI) => {
					Object.entries(loaders).forEach(([componentName, loader]) => {
						/**
						 * TODO: hardcoded split should be removed after "specs.thunderbolt.componentsRegistry" experiment is merged
						 */
						const [name, uiType] = splitComponentName(componentName)

						hostAPI.registerComponent(
							name,
							async () => {
								const model = await loader()

								return {
									default: model.component,
									component: model.component,
									controller: model.controller,
								}
							},
							uiType
						)
					})
				},
			}
		},
		getRegistryAPI() {
			return registryAPI
		},
	}
}

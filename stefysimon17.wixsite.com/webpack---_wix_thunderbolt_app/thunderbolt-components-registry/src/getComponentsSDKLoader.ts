import { PlatformEnvData, PlatformLogger } from '@wix/thunderbolt-symbols'
import { FallbackCorvidModel } from '@wix/editor-elements-corvid-utils'

import { IComponentSDKLoader, createComponentsRegistryPlatform } from './platform'
import { ComponentsRegistryError, ComponentsRegistryErrorTypes } from './errors'
import { REGISTRY_RUNTIME_GLOBAL_PROP_NAME } from './runtime'

export const getComponentsSDKLoader = async ({
	platformEnvData,
	logger,
}: {
	platformEnvData: PlatformEnvData
	logger: PlatformLogger
}): Promise<IComponentSDKLoader> => {
	const runtime = self[REGISTRY_RUNTIME_GLOBAL_PROP_NAME]
	const libraries = runtime ? runtime.libraries : platformEnvData.componentsRegistry.librariesTopology

	const mode = platformEnvData.componentsRegistry.mode

	return logger
		.runAsyncAndReport(`import_scripts_componentSdks`, async () => {
			const componentsRegistryPlatform = await createComponentsRegistryPlatform({
				libraries,
				mode,
				loadFallbackSDKModule: () => FallbackCorvidModel.loadSDK() as any,
			})

			return componentsRegistryPlatform.getComponentsSDKsLoader()
		})
		.catch((e) => {
			logger.captureError(
				new ComponentsRegistryError(
					'could not create platform components registry',
					ComponentsRegistryErrorTypes.INITIALIZATION_ERROR
				),
				{
					groupErrorsBy: 'values',
					tags: { method: 'getComponentsSDKLoader' },
					extra: { libraries, mode, error: e },
				}
			)

			return {
				sdkTypeToComponentTypes: {},
				loadComponentSdks: () =>
					Promise.reject(
						new ComponentsRegistryError(
							'could not load components. platform components registry was initialized with error',
							ComponentsRegistryErrorTypes.COMPONENT_LOADING_ERROR
						)
					),
			}
		})
}

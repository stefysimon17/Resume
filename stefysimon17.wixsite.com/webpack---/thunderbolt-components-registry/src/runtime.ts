import { IRegistryRuntime, IComponentLoader } from '@wix/editor-elements-registry/2.0/types'

export const REGISTRY_RUNTIME_GLOBAL_PROP_NAME = '_registry_runtime'
export const INJECTED_SDK_GLOBAL_PROP_NAME = '_injectedSDKs'

declare global {
	interface Window {
		[REGISTRY_RUNTIME_GLOBAL_PROP_NAME]: IRegistryRuntime
		[INJECTED_SDK_GLOBAL_PROP_NAME]: Record<string, IComponentLoader<any>>
	}
}

export function getGlobalRegistryRuntime(): IRegistryRuntime | null {
	if (process.env.browser) {
		return window[REGISTRY_RUNTIME_GLOBAL_PROP_NAME]
	}

	return null
}

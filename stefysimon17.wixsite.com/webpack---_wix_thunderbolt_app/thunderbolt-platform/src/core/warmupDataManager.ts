import { PlatformEnvData, WarmupDataManager } from '@wix/thunderbolt-symbols'
import { AppsWarmupData, WindowWixCodeSdkHandlers } from 'feature-window-wix-code-sdk'
import _ from 'lodash'

export function CreateWarmupDataManager({ handlers, platformEnvData }: { handlers: WindowWixCodeSdkHandlers; platformEnvData: PlatformEnvData }): WarmupDataManager {
	const { isSSR } = platformEnvData.window

	// Init empty appsWarmupData and reassign it when the data is available, to avoid awaiting it.
	let appsWarmupData: AppsWarmupData = {}
	if (!isSSR) {
		handlers.onAppsWarmupDataReady((warmupData: AppsWarmupData) => {
			appsWarmupData = warmupData
		})
	}

	return {
		getAppData(appDefinitionId, key) {
			if (isSSR) {
				console.warn('getting warmup data is not supported on the backend')
				return null
			}
			return _.get(appsWarmupData, [appDefinitionId, key])
		},
		setAppData(appDefinitionId, key, data) {
			if (!isSSR) {
				console.warn('setting warmup data is not supported in the browser')
				return
			}
			handlers.setAppWarmupData({ appDefinitionId, key, data })
		},
	}
}

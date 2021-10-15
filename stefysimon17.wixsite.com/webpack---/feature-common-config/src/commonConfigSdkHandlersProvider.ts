import { withDependencies } from '@wix/thunderbolt-ioc'
import type { ICommonConfig } from './types'
import { CommonConfigSymbol } from './symbols'

const commonConfigSdkHandlersProviderFactory = (commonConfig: ICommonConfig) => {
	return {
		getSdkHandlers: () => ({
			registerToCommonConfigChange: commonConfig.registerToCommonConfigChange,
		}),
	}
}

export const commonConfigSdkHandlersProvider = withDependencies(
	[CommonConfigSymbol],
	commonConfigSdkHandlersProviderFactory
)

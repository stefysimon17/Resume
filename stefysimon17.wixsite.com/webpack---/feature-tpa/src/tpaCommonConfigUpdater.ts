import { withDependencies } from '@wix/thunderbolt-ioc'
import { CommonConfigSymbol, ICommonConfig } from 'feature-common-config'
import { TpaEventsListenerManagerSymbol } from './symbols'
import type { ITPAEventsListenerManager } from './types'

export const tpaCommonConfigUpdater = withDependencies(
	[CommonConfigSymbol, TpaEventsListenerManagerSymbol],
	(commonConfig: ICommonConfig, tpaEventsListenerManager: ITPAEventsListenerManager) => {
		return {
			pageWillMount: () => {
				commonConfig.registerToCommonConfigChange((newCommonConfig) =>
					tpaEventsListenerManager.dispatch('COMMON_CONFIG_UPDATE', () => newCommonConfig)
				)
			},
		}
	}
)

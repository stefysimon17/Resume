import { withDependencies } from '@wix/thunderbolt-ioc'
import {
	BIReporter,
	BISymbol,
	CommonConfig,
	BrowserWindowSymbol,
	BrowserWindow,
	ViewerModelSym,
	ViewerModel,
	PlatformEnvDataProvider,
} from '@wix/thunderbolt-symbols'
import type { ICommonConfig, ICommonConfigState } from './types'
import { isSSR } from '@wix/thunderbolt-commons'

const commonConfigFactory = (
	viewerModel: ViewerModel,
	biReporter: BIReporter,
	window: BrowserWindow
): ICommonConfig & PlatformEnvDataProvider => {
	const state: ICommonConfigState = {
		commonConfig: viewerModel.commonConfig,
		subscribers: [],
	}

	return {
		getCommonConfig,
		getCommonConfigForUrl: () => {
			const commonConfigQueryParam: any = { ...state.commonConfig }
			// Needed since the Aspect in the server expects BSI according to it's proto: https://github.com/wix-private/fed-infra/blob/master/fed-infra-protos/src/main/proto/common-config.proto#L26
			commonConfigQueryParam.BSI = commonConfigQueryParam.bsi
			// using deny list instead so we don't need to manually add every new property
			delete commonConfigQueryParam.consentPolicyHeader
			delete commonConfigQueryParam.consentPolicy
			return commonConfigQueryParam
		},
		updateCommonConfig: (config: Partial<CommonConfig>) => {
			if (config.hasOwnProperty('bsi')) {
				biReporter.setDynamicSessionData({ bsi: config.bsi })
			}
			state.commonConfig = { ...state.commonConfig, ...config }
			state.subscribers.forEach((subscriber) => subscriber(state.commonConfig))

			if (!isSSR(window)) {
				window!.commonConfig = state.commonConfig
			}
		},
		registerToCommonConfigChange: (subscriber) => state.subscribers.push(subscriber),
		get platformEnvData() {
			return { commonConfig: getCommonConfig() }
		},
	}

	function getCommonConfig() {
		return state.commonConfig
	}
}

export const CommonConfigImpl = withDependencies([ViewerModelSym, BISymbol, BrowserWindowSymbol], commonConfigFactory)

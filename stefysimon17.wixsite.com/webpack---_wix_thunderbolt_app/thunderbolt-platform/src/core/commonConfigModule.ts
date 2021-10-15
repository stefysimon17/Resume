import { CommonConfig } from '@wix/thunderbolt-symbols'
import { BootstrapData } from '../types'

declare const self: {
	commonConfig: CommonConfig
}

export type ICommonConfigModule = {
	registerToChange: (handler: (commonConfig: CommonConfig) => void) => void
	get: () => CommonConfig
}

export default function (bootstrapData: BootstrapData, createSdkHandlers: (pageId: string) => any): ICommonConfigModule {
	const sdkHandlers = createSdkHandlers(bootstrapData.currentPageId)
	const subscribers: Array<(commonConfig: CommonConfig) => void> = []

	if (process.env.browser) {
		sdkHandlers.registerToCommonConfigChange((newCommonConfig: CommonConfig) => {
			self.commonConfig = newCommonConfig
			subscribers.forEach((subscriber) => subscriber(newCommonConfig))
		})
	}

	return {
		registerToChange: (handler) => subscribers.push(handler),
		get: () => self.commonConfig,
	}
}

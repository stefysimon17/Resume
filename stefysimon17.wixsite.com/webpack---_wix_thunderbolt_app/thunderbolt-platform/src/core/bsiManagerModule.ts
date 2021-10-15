import { BootstrapData } from '../types'
import { SlaveBsiManager } from '@wix/bsi-manager/dist/src/manager-slave' // eslint-disable-line no-restricted-syntax
import { ICommonConfigModule } from './commonConfigModule'
import { CommonConfig } from '@wix/thunderbolt-symbols'

export type BsiManager = {
	getBsi: () => string
}

export default function (commonConfigModule: ICommonConfigModule, bootstrapData: BootstrapData, createSdkHandlers: (pageId: string) => any): BsiManager {
	const sdkHandlers = createSdkHandlers(bootstrapData.currentPageId)

	const readOnlyCommonConfig = {
		get: (key: keyof CommonConfig) => commonConfigModule.get()[key],
		subscribe: commonConfigModule.registerToChange,
	}

	const consentPolicy = {
		policy: {
			analytics: true, // TODO: real
			functional: true, // TODO: real
		},
	}

	return new SlaveBsiManager()
		.init(
			{
				getCommonConfig: () => readOnlyCommonConfig,
				getConsentPolicy: () => consentPolicy,
			},
			{ enableCookie: false }
		)
		.onActivity(() => {
			sdkHandlers.reportActivity()
		})
}

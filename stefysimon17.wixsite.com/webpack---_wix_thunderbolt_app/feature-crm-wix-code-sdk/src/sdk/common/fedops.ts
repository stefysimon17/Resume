import { PlatformUtils } from '@wix/thunderbolt-symbols'
import { createFedopsLogger as createCommonFedopsLogger } from '@wix/thunderbolt-commons'

export const createFedopsLogger = (essentials: PlatformUtils['essentials'], biUtils: PlatformUtils['biUtils']) => {
	return createCommonFedopsLogger({
		appName: 'crm-wix-code-sdk',
		biLoggerFactory: biUtils.createBiLoggerFactoryForFedops(),
		customParams: {
			viewerName: 'thunderbolt',
		},
		factory: essentials.createFedopsLogger,
	})
}

import { PlatformUtils } from '@wix/thunderbolt-symbols'
import { createFedopsLogger as createCommonFedopsLogger } from '@wix/thunderbolt-commons'

const ALE = 'load'
const ALE_KICKOFF = 'load-phase-kickoff'

export const createFedopsLogger = (essentials: PlatformUtils['essentials'], biUtils: PlatformUtils['biUtils']) => {
	const logger = createCommonFedopsLogger({
		biLoggerFactory: biUtils.createBiLoggerFactoryForFedops(),
		customParams: {
			viewerName: 'thunderbolt',
		},
		factory: essentials.createFedopsLogger,
	})

	return {
		logALE() {
			logger.interactionStarted(ALE)
			logger.interactionStarted(ALE_KICKOFF)
		},
	}
}

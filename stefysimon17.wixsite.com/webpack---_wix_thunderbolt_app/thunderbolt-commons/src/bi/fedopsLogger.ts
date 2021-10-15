import { presetsTypes } from '@wix/fedops-presets'
import type { ViewerPlatformEssentials } from '@wix/fe-essentials-viewer-platform'
import type { FedopsLogger } from '@wix/fe-essentials-viewer-platform/fedops'
import { FedopsConfig } from '@wix/thunderbolt-symbols'

export type FedopsFactory = ViewerPlatformEssentials['createFedopsLogger']

export const createFedopsLogger = ({
	biLoggerFactory,
	customParams = {},
	phasesConfig = 'SEND_ON_FINISH',
	appName = 'thunderbolt',
	presetType = presetsTypes.BOLT,
	reportBlackbox = false,
	paramsOverrides = {},
	factory,
}: FedopsConfig & { factory: FedopsFactory }): FedopsLogger =>
	factory(appName, {
		presetType,
		phasesConfig,
		isPersistent: true,
		isServerSide: !process.env.browser,
		reportBlackbox,
		customParams,
		biLoggerFactory,
		// @ts-ignore FEDINF-3725
		paramsOverrides,
	})

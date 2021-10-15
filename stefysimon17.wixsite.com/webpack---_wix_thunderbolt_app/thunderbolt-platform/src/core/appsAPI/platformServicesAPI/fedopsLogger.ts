import type { FedopsLogger } from '@wix/fe-essentials-viewer-platform/fedops'
import { BILoggerFactory, createFedopsLogger, FedopsFactory } from '@wix/thunderbolt-commons'
import { platformBiLoggerFactory } from '../../bi/biLoggerFactory'
import { PlatformEnvData, SessionServiceAPI } from '@wix/thunderbolt-symbols'

export const createFedopsLoggerFactory = ({
	biData,
	location,
	site,
	viewMode,
	sessionService,
	biLoggerFactory,
	factory,
}: {
	biData: PlatformEnvData['bi']
	location: PlatformEnvData['location']
	site: PlatformEnvData['site']
	viewMode: 'site' | 'preview'
	sessionService: SessionServiceAPI
	biLoggerFactory: BILoggerFactory
	factory: FedopsFactory
}): FedopsLogger =>
	createFedopsLogger({
		biLoggerFactory: platformBiLoggerFactory({ sessionService, location, biData, site, factory: biLoggerFactory }).createBiLoggerFactoryForFedops(),
		customParams: {
			isMobileFriendly: biData.isMobileFriendly,
			viewerName: 'thunderbolt',
			viewMode,
		},
		paramsOverrides: { is_rollout: biData.rolloutData.isTBRollout },
		factory,
	})

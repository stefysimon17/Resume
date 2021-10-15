import { platformBiLoggerFactory } from '../../bi/biLoggerFactory'
import { BsiManager } from '../../bsiManagerModule'
import { PlatformEnvData, SessionServiceAPI } from '@wix/thunderbolt-symbols'
import type { BILoggerFactory } from '@wix/thunderbolt-commons'

/**
 * BI logger factory for Viewer Platform Apps
 *
 * - Initialized with base defaults + app defaults.
 * - Any additional defaults should be added only after making sure the BI schema supports them
 *
 * Please use #bi-logger-support for any questions
 */
const createBiLoggerFactoryForApp = ({
	appDefinitionId,
	instanceId,
	biData,
	location,
	site,
	bsiManager,
	viewMode,
	sessionService,
	factory,
}: {
	appDefinitionId: string
	instanceId: string
	biData: PlatformEnvData['bi']
	location: PlatformEnvData['location']
	site: PlatformEnvData['site']
	bsiManager: BsiManager
	viewMode: 'site' | 'preview'
	sessionService: SessionServiceAPI
	factory: BILoggerFactory
}) => () =>
	platformBiLoggerFactory({ sessionService, biData, location, site, factory })
		.createBaseBiLoggerFactory()
		.updateDefaults({
			_appId: appDefinitionId,
			_instanceId: instanceId,
			_siteOwnerId: biData.ownerId,
			_viewMode: viewMode,
			bsi: () => bsiManager.getBsi(),
		})

export const platformAppBiLoggerFactory = {
	createBiLoggerFactoryForApp,
}

import _ from 'lodash'
import type { ViewerPlatformEssentials } from '@wix/fe-essentials-viewer-platform'
import { PlatformServicesAPI, PlatformEnvData, SessionServiceAPI } from '@wix/thunderbolt-symbols'
import { BsiManager } from '../../bsiManagerModule'
import { biFactory } from './bi'
import { createFedopsLoggerFactory } from './fedopsLogger'
import { platformAppBiLoggerFactory } from './biLoggerFactory'
import { monitoringFactory } from './monitoring'

export const createPlatformAppServicesApi = ({
	platformEnvData: {
		bi: biData,
		document: { referrer },
		location,
		site,
		topology,
	},
	appDefinitionId,
	instanceId,
	csrfToken,
	bsiManager,
	sessionService,
	essentials,
}: {
	platformEnvData: PlatformEnvData
	appDefinitionId: string
	instanceId: string
	csrfToken: string
	bsiManager: BsiManager
	sessionService: SessionServiceAPI
	essentials: ViewerPlatformEssentials
}): PlatformServicesAPI => {
	const viewMode = biData.isPreview ? ('preview' as const) : ('site' as const)

	const bi = biFactory({ biData, metaSiteId: location.metaSiteId, viewMode, sessionService })
	const biLoggerFactory = platformAppBiLoggerFactory.createBiLoggerFactoryForApp({
		appDefinitionId,
		instanceId,
		biData,
		location,
		site,
		bsiManager,
		viewMode,
		sessionService,
		factory: essentials.biLoggerFactory,
	})
	const fedOpsLoggerFactory = createFedopsLoggerFactory({ biData, location, site, viewMode, sessionService, biLoggerFactory, factory: essentials.createFedopsLogger })
	const monitoring = monitoringFactory({ url: biData.pageData.pageUrl, viewMode, viewerVersion: biData.viewerVersion, referrer })
	const appEssentials = essentials.createAppEssentials({
		appDefId: appDefinitionId,
		getLoggerForWidget: fedOpsLoggerFactory.getLoggerForWidget.bind(fedOpsLoggerFactory),
		biLoggerFactory,
	})

	return {
		getCsrfToken: () => csrfToken,
		bi,
		biLoggerFactory,
		reportTrace: _.noop,
		fedOpsLoggerFactory,
		monitoring,
		essentials: appEssentials,
		topology,
	}
}

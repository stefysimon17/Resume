import { BiUtils, ConsentPolicyManager, LinkUtils, LocationManager, PlatformUtils, SessionServiceAPI, WarmupDataManager, WixCodeNamespacesRegistry, ClientSpecMapAPI } from '@wix/thunderbolt-symbols'
import type { ViewerPlatformEssentials } from '@wix/fe-essentials-viewer-platform'
import { AppsPublicApiManager } from './appsPublicApiManager'

export function BuildPlatformUtils({
	linkUtils,
	sessionService,
	appsPublicApiManager,
	wixCodeNamespacesRegistry,
	biUtils,
	locationManager,
	essentials,
	warmupDataManager,
	consentPolicyManager,
	clientSpecMapApi,
}: {
	linkUtils: LinkUtils
	sessionService: SessionServiceAPI
	appsPublicApiManager: AppsPublicApiManager
	wixCodeNamespacesRegistry: WixCodeNamespacesRegistry
	biUtils: BiUtils
	locationManager: LocationManager
	essentials: ViewerPlatformEssentials
	warmupDataManager: WarmupDataManager
	consentPolicyManager: ConsentPolicyManager
	clientSpecMapApi: ClientSpecMapAPI
}): PlatformUtils {
	return {
		linkUtils,
		sessionService,
		appsPublicApisUtils: {
			getPublicAPI: appsPublicApiManager.getPublicApi,
		},
		wixCodeNamespacesRegistry,
		biUtils,
		locationManager,
		essentials,
		warmupDataManager,
		consentPolicyManager,
		clientSpecMapApi,
	}
}

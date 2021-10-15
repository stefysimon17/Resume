import { FleetConfig } from '@wix/thunderbolt-ssr-api'
import { Experiments } from '@wix/thunderbolt-symbols'
import { SiteAssetsClientConfig } from '@wix/site-assets-client'

export const shouldRouteStagingRequest = (fleetConfig: FleetConfig) => {
	return ['Stage', 'DeployPreview', 'Canary'].includes(fleetConfig.type)
}

export const updateConfig = (experiments: Experiments, config: SiteAssetsClientConfig): SiteAssetsClientConfig => {
	const { mediaRootUrl, staticMediaUrl } = config.moduleTopology.publicEnvironment

	const relativeMediaRoot = experiments['specs.thunderbolt.relativeMediaRoot'] === true
	const mediaRootUrlToUse = relativeMediaRoot ? '/_media' : mediaRootUrl
	const staticMediaUrlToUse = relativeMediaRoot ? '/_media/media' : staticMediaUrl

	return {
		...config,
		moduleTopology: {
			...config.moduleTopology,
			publicEnvironment: {
				...config.moduleTopology.publicEnvironment,
				mediaRootUrl: mediaRootUrlToUse,
				staticMediaUrl: staticMediaUrlToUse,
			},
		},
	}
}

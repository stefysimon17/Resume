import { named, withDependencies } from '@wix/thunderbolt-ioc'
import {
	SiteFeatureConfigSymbol,
	PlatformEnvDataProvider,
	SiteWixCodeSdkSiteConfig,
	ExperimentsSymbol,
	Experiments,
	ViewerModelSym,
	ViewerModel,
} from '@wix/thunderbolt-symbols'
import { name } from '../symbols'

export const siteEnvDataProvider = withDependencies(
	[ExperimentsSymbol, named(SiteFeatureConfigSymbol, name), ViewerModelSym],
	(
		experiments: Experiments,
		siteWixCodeSdkSiteConfig: SiteWixCodeSdkSiteConfig,
		viewerModel: ViewerModel
	): PlatformEnvDataProvider => {
		const {
			mode,
			site: { isResponsive },
		} = viewerModel

		return {
			get platformEnvData() {
				const { pageIdToTitle, isEditorMode = false } = siteWixCodeSdkSiteConfig || {}
				return {
					site: {
						experiments,
						isResponsive,
						pageIdToTitle,
						mode,
						isEditorMode,
					},
				}
			},
		}
	}
)

import { withDependencies } from '@wix/thunderbolt-ioc'
import { IAppDidMountHandler, ILogger, LoggerSymbol, ViewerModel, ViewerModelSym } from '@wix/thunderbolt-symbols'
import { FeaturesLoaderSymbol, ILoadFeatures } from '@wix/thunderbolt-features'

export default withDependencies<IAppDidMountHandler>(
	[FeaturesLoaderSymbol, ViewerModelSym, LoggerSymbol],
	(featuresLoader: ILoadFeatures, viewerModel: ViewerModel, logger: ILogger) => ({
		appDidMount: async () => {
			try {
				const features = [...featuresLoader.getLoadedPageFeatures(), ...viewerModel.siteFeatures]

				logger.meter(`page_features_loaded`, {
					customParams: {
						features,
					},
				})
			} catch {}
		},
	})
)

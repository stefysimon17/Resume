import { FeatureName, CarmiInstance } from '@wix/thunderbolt-symbols'
import { FeatureLoaderParams, FeaturesLoaders, ILoadFeatures } from './Features'
import { IocContainer } from '@wix/thunderbolt-ioc'

export const createFeaturesLoader = (
	featuresLoaders: Partial<FeaturesLoaders>,
	featureLoaderParams: FeatureLoaderParams
): ILoadFeatures => {
	const loadFeaturesIntoContainer = (
		container: IocContainer,
		featureNames: Array<FeatureName>,
		context: 'site' | 'page' | 'editor' | 'editorPage'
	): Promise<any> =>
		Promise.all(
			featureNames.map(async (featureName) => {
				if (!featuresLoaders[featureName]) {
					console.error(`no feature loader for ${featureName}`)
				}
				const featureLoader = await featuresLoaders[featureName]!(featureLoaderParams)
				// @ts-ignore
				const loader = featureLoader[context]
				if (loader) {
					// @ts-ignore
					container.load(loader)
				}
			})
		)
	let pageFeatures = new Set<FeatureName>()
	return {
		getAllFeatureNames() {
			return Object.keys(featuresLoaders) as Array<FeatureName>
		},
		getLoadedPageFeatures() {
			return [...pageFeatures]
		},
		loadSiteFeatures: (container, featureNames) =>
			loadFeaturesIntoContainer(container, featureNames as Array<FeatureName>, 'site'),
		loadPageFeatures: (container, featureNames) => {
			pageFeatures = new Set([...pageFeatures, ...featureNames])
			const pageFeaturesContext = container.getAll(CarmiInstance).length ? 'editorPage' : 'page'
			// TODO: Load features with editorPage entry instead of page that is used for public
			return loadFeaturesIntoContainer(container, featureNames as Array<FeatureName>, pageFeaturesContext)
		},
		loadEditorFeatures: (container, featureNames) =>
			loadFeaturesIntoContainer(container, featureNames as Array<FeatureName>, 'editor'),
	}
}

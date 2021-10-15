import type { FeaturesLoaders } from '@wix/thunderbolt-features'

// TODO move all features loaders to their own feature packages
export const internalFeaturesLoaders: Partial<FeaturesLoaders> = {
	renderIndicator: () =>
		import('./features/render-indicator/renderIndicator' /* webpackChunkName: "renderIndicator" */),
	bootstrap: () => import('./features/bootstrap' /* webpackChunkName: "bootstrap" */),
}
